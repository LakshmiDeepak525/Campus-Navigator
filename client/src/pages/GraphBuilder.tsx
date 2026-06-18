import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavBar } from '../components/NavBar';
import { GraphCanvas } from '../components/GraphCanvas';
import { useStore } from '../store/useStore';
import type { GraphNode, GraphEdge } from '../store/useStore';
import axios from 'axios';

type Mode = 'idle' | 'addNode' | 'addEdge' | 'delete';

const getNextLabel = (nodes: GraphNode[]) => {
  const count = nodes.length;
  const label = String.fromCharCode(65 + (count % 26));
  const suffix = count >= 26 ? String(Math.floor(count / 26)) : '';
  return label + suffix;
};

export const GraphBuilder: React.FC = () => {
  const { graph, addNode, addEdge, deleteNode, deleteEdge, clearGraph, loadSampleCampus, setGraph } = useStore();
  const [mode, setMode] = useState<Mode>('idle');
  const [pendingEdgeSource, setPendingEdgeSource] = useState<string | null>(null);
  const [pendingEdgeTarget, setPendingEdgeTarget] = useState<string | null>(null);
  const [weightPopup, setWeightPopup] = useState<{ x: number; y: number; sx: number; sy: number; tx: number; ty: number } | null>(null);
  const [weight, setWeight] = useState('1');
  const [directed, setDirected] = useState(false);
  const [osmBbox, setOsmBbox] = useState('');
  const [osmLoading, setOsmLoading] = useState(false);
  const [osmError, setOsmError] = useState('');

  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (mode === 'addNode') {
      const label = getNextLabel(graph.nodes);
      const id = label + '_' + Date.now();
      addNode({ id, label, x, y });
    }
  }, [mode, addNode, graph.nodes]);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (mode === 'delete') { deleteNode(nodeId); return; }
    if (mode === 'addEdge') {
      if (!pendingEdgeSource) {
        setPendingEdgeSource(nodeId);
      } else if (nodeId !== pendingEdgeSource) {
        const src = graph.nodes.find(n => n.id === pendingEdgeSource)!;
        const tgt = graph.nodes.find(n => n.id === nodeId)!;
        const mx = (src.x + tgt.x) / 2;
        const my = (src.y + tgt.y) / 2;
        setPendingEdgeTarget(nodeId);
        setWeightPopup({ x: mx, y: my, sx: src.x, sy: src.y, tx: tgt.x, ty: tgt.y });
      }
    }
  }, [mode, pendingEdgeSource, graph.nodes, deleteNode]);

  const handleEdgeClick = useCallback((edgeId: string) => {
    if (mode === 'delete') deleteEdge(edgeId);
  }, [mode, deleteEdge]);

  const confirmEdge = () => {
    if (!pendingEdgeSource || !pendingEdgeTarget) return;
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;
    addEdge({
      id: `e_${Date.now()}`,
      source: pendingEdgeSource,
      target: pendingEdgeTarget,
      weight: w,
      directed,
    });
    setPendingEdgeSource(null);
    setPendingEdgeTarget(null);
    setWeightPopup(null);
    setWeight('1');
  };

  const cancelEdge = () => {
    setPendingEdgeSource(null);
    setPendingEdgeTarget(null);
    setWeightPopup(null);
  };

  const importOSM = async (bboxVal?: string) => {
    const targetBbox = bboxVal || osmBbox;
    if (!targetBbox.trim()) return;
    setOsmLoading(true);
    setOsmError('');
    try {
      const res = await axios.get(`/api/campus/osm?bbox=${encodeURIComponent(targetBbox)}`);
      setGraph(res.data);
    } catch (e: any) {
      setOsmError(e?.response?.data?.error || e.message);
    } finally {
      setOsmLoading(false);
    }
  };

  const exportGraph = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graph, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "campus-graph.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const OSM_PRESETS = [
    { name: 'Stanford', bbox: '37.420,-122.175,37.435,-122.160' },
    { name: 'MIT',      bbox: '42.355,-71.100,42.365,-71.080' },
    { name: 'IIT Delhi', bbox: '28.540,77.180,28.550,77.200' },
  ];

  const nodeLabels = Object.fromEntries(graph.nodes.map(n => [n.id, n.label]));
  const modeBtn = (m: Mode, label: string, accent?: string) => (
    <button
      className="btn-brutal sm"
      style={{ background: mode === m ? (accent || 'var(--color-accent)') : 'var(--color-paper)' }}
      onClick={() => { setMode(mode === m ? 'idle' : m); setPendingEdgeSource(null); setWeightPopup(null); }}
    >
      {label}
    </button>
  );

  return (
    <div className="algo-layout" style={{ '--page-accent': '#FFE566' } as React.CSSProperties}>
      <NavBar />
      <div className="algo-body">

        {/* Left panel */}
        <div className="algo-side-panel" style={{ flexShrink: 0 }}>

          {/* Mode controls */}
          <div style={{ padding: 12, borderBottom: 'var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="section-title">BUILD MODE</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {modeBtn('addNode', '⊕ NODE', '#FFE566')}
              {modeBtn('addEdge', '— EDGE', '#6BB5FF')}
              {modeBtn('delete', '✕ DELETE', '#FF6B6B')}
            </div>
            {mode === 'addNode' && <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', opacity: 0.6 }}>Click on canvas to place a node.</div>}
            {mode === 'addEdge' && !pendingEdgeSource && <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', opacity: 0.6 }}>Click a SOURCE node.</div>}
            {mode === 'addEdge' && pendingEdgeSource && <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', opacity: 0.6 }}>Click a TARGET node.</div>}
            {mode === 'delete' && <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', opacity: 0.6 }}>Click a node or edge to delete.</div>}

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: '11px', cursor: 'pointer' }}>
              <input type="checkbox" checked={directed} onChange={e => setDirected(e.target.checked)} />
              Directed edges
            </label>
          </div>

          {/* Presets */}
          <div style={{ padding: 12, borderBottom: 'var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="section-title">PRESETS</div>
            <button className="btn-brutal sm" onClick={loadSampleCampus}>LOAD CAMPUS SAMPLE</button>
            <button className="btn-brutal sm accent" onClick={exportGraph}>EXPORT JSON</button>
            <button className="btn-brutal sm danger" onClick={clearGraph}>CLEAR ALL</button>
          </div>

          {/* OSM Import */}
          <div style={{ padding: 12, borderBottom: 'var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="section-title">IMPORT FROM OSM</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <select 
                className="select-brutal" 
                style={{ fontSize: '10px', height: '28px', padding: '0 8px' }}
                onChange={e => {
                  const val = e.target.value;
                  if (val) { setOsmBbox(val); importOSM(val); }
                }}
              >
                <option value="">-- QUICK PRESET --</option>
                {OSM_PRESETS.map(p => <option key={p.name} value={p.bbox}>{p.name}</option>)}
              </select>
              <input
                className="input-brutal"
                placeholder="south,west,north,east"
                value={osmBbox}
                onChange={e => setOsmBbox(e.target.value)}
                style={{ fontSize: '11px' }}
              />
            </div>
            {osmError && <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: '#FF4444' }}>{osmError}</div>}
            <button className="btn-brutal sm" onClick={() => importOSM()} disabled={osmLoading}>
              {osmLoading ? 'LOADING...' : 'IMPORT BBOX'}
            </button>
          </div>

          {/* Node list */}
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            <div className="section-title">NODES ({graph.nodes.length})</div>
            {graph.nodes.map(n => (
              <div key={n.id} style={{
                fontFamily: 'var(--font-body)', fontSize: '11px',
                padding: '4px 0',
                borderBottom: '1px solid rgba(26,26,26,0.1)',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span><b>{n.label}</b></span>
                <span style={{ opacity: 0.4 }}>{Math.round(n.x)},{Math.round(n.y)}</span>
              </div>
            ))}

            <div className="section-title" style={{ marginTop: 12 }}>EDGES ({graph.edges.length})</div>
            {graph.edges.map(e => {
              const s = graph.nodes.find(n => n.id === e.source);
              const t = graph.nodes.find(n => n.id === e.target);
              return (
                <div key={e.id} style={{
                  fontFamily: 'var(--font-body)', fontSize: '11px',
                  padding: '4px 0',
                  borderBottom: '1px solid rgba(26,26,26,0.1)',
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>{s?.label || e.source}{e.directed ? '→' : '—'}{t?.label || e.target}</span>
                  <span style={{ fontWeight: 700 }}>{e.weight}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Canvas */}
        <div className="algo-canvas-area dot-grid">
          <GraphCanvas
            nodes={graph.nodes}
            edges={graph.edges}
            accentColor="#FFE566"
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onCanvasClick={handleCanvasClick}
            draggable={mode === 'idle'}
            onNodeDrag={(id, x, y) => useStore.getState().updateNodePosition(id, x, y)}
            pendingEdgeSource={pendingEdgeSource}
          />

          {/* Weight popup */}
          <AnimatePresence>
            {weightPopup && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'var(--color-paper)',
                  border: 'var(--border-thick)',
                  boxShadow: 'var(--shadow-brutal-xl)',
                  padding: '20px',
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  minWidth: 220,
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase' }}>
                  SET EDGE WEIGHT
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', opacity: 0.6 }}>
                  {nodeLabels[pendingEdgeSource!]} → {nodeLabels[pendingEdgeTarget!]}
                </div>
                <input
                  className="input-brutal"
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmEdge(); if (e.key === 'Escape') cancelEdge(); }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-brutal sm accent" onClick={confirmEdge} style={{ flex: 1, background: '#FFE566' }}>CONFIRM</button>
                  <button className="btn-brutal sm" onClick={cancelEdge} style={{ flex: 1 }}>CANCEL</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode indicator */}
          {mode !== 'idle' && (
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: mode === 'delete' ? '#FF6B6B' : mode === 'addEdge' ? '#6BB5FF' : '#FFE566',
              border: 'var(--border)',
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '12px',
              textTransform: 'uppercase',
              boxShadow: 'var(--shadow-brutal)',
            }}>
              {mode === 'addNode' ? '⊕ NODE MODE' : mode === 'addEdge' ? '— EDGE MODE' : '✕ DELETE MODE'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
