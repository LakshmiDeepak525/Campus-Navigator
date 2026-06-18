import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NavBar } from '../components/NavBar';
import { AlgoHeader } from '../components/AlgoHeader';
import { GraphCanvas } from '../components/GraphCanvas';
import { AnimationControls } from '../components/AnimationControls';
import { StepLog } from '../components/StepLog';
import { useStore } from '../store/useStore';
import type { AlgoStep } from '../store/useStore';
import axios from 'axios';

const ACCENT = '#FF9F6B';

type MstMode = 'kruskal' | 'prim';

export const Mst: React.FC = () => {
  const { graph, animationSpeed } = useStore();
  const [mode, setMode] = useState<MstMode>('kruskal');
  const [start, setStart] = useState('');
  const [steps, setSteps] = useState<AlgoStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-select start node if not set
  React.useEffect(() => {
    if (!start && graph.nodes.length > 0) {
      setStart(graph.nodes[0].id);
    }
  }, [graph.nodes, start]);

  const current = steps[currentStep] ?? null;

  const runAlgo = async () => {
    setIsLoading(true);
    setError('');
    setIsPlaying(false);
    setCurrentStep(0);
    setSteps([]);
    try {
      const endpoint = mode === 'kruskal' ? '/api/algo/kruskal' : '/api/algo/prim';
      const res = await axios.post(endpoint, { graph, start: mode === 'prim' ? start : undefined });
      setSteps(res.data.steps || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Manual controls
  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const next = () => { setIsPlaying(false); setCurrentStep(p => steps.length > 0 ? Math.min(p + 1, steps.length - 1) : 0); };
  const prev = () => { setIsPlaying(false); setCurrentStep(p => Math.max(p - 1, 0)); };
  const reset = () => { setIsPlaying(false); setCurrentStep(0); };
  const skipToEnd = () => { setIsPlaying(false); setCurrentStep(steps.length > 0 ? steps.length - 1 : 0); };
  const jumpToStep = (index: number) => { setIsPlaying(false); setCurrentStep(Math.max(0, steps.length > 0 ? Math.min(index, steps.length - 1) : 0)); };

  React.useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const id = setInterval(() => {
      setCurrentStep(p => {
        if (p >= steps.length - 1) { setIsPlaying(false); return p; }
        return p + 1;
      });
    }, animationSpeed);
    return () => clearInterval(id);
  }, [isPlaying, animationSpeed, steps.length]);

  // Sorted edge list for Kruskal side panel
  const sortedEdges = [...graph.edges].sort((a, b) => a.weight - b.weight);
  const getEdgeStatus = (edgeId: string) => current?.edgeStates?.[edgeId] || 'default';

  const nodeLabels = Object.fromEntries(graph.nodes.map(n => [n.id, n.label]));

  return (
    <div className="algo-layout" style={{ '--page-accent': ACCENT } as React.CSSProperties}>
      <NavBar />
      <AlgoHeader
        title="MINIMUM SPANNING TREE"
        complexity="O(E log E)"
        description="Kruskal: sort edges, union-find. Prim: greedy frontier expansion. Toggle between both."
        accentColor={ACCENT}
      />

      {/* Control bar */}
      <div style={{
        borderBottom: 'var(--border)', padding: '10px 16px',
        display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap',
        background: 'var(--color-paper)', flexShrink: 0,
      }}>
        <div className="toggle-container" style={{ width: 180 }}>
          <button className={`toggle-option ${mode === 'kruskal' ? 'active' : ''}`} onClick={() => { setMode('kruskal'); setSteps([]); setCurrentStep(0); setIsPlaying(false); }}>KRUSKAL</button>
          <button className={`toggle-option ${mode === 'prim' ? 'active' : ''}`} onClick={() => { setMode('prim'); setSteps([]); setCurrentStep(0); setIsPlaying(false); }}>PRIM</button>
        </div>
        {mode === 'prim' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', opacity: 0.6 }}>START</label>
            <select className="select-brutal" value={start} onChange={e => setStart(e.target.value)} aria-label="Start node">
              {graph.nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </div>
        )}
        <button className="btn-brutal accent" style={{ background: ACCENT }} onClick={runAlgo} disabled={isLoading}>
          {isLoading ? 'RUNNING...' : `▶ RUN ${mode.toUpperCase()}`}
        </button>
        {/* Total cost */}
        {current?.mstCost !== undefined && (
          <motion.div
            key={current.mstCost}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            style={{
              border: 'var(--border-thick)', padding: '4px 16px',
              fontFamily: 'var(--font-display)', fontSize: '20px',
              background: ACCENT, letterSpacing: '0.05em',
            }}
          >
            COST: {current.mstCost}
          </motion.div>
        )}
        {error && <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#FF4444' }}>Error: {error}</span>}
      </div>

      <div className="algo-body">
        <div className="algo-canvas-area" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            <GraphCanvas
              nodes={graph.nodes} edges={graph.edges}
              nodeStates={current?.nodeStates} edgeStates={current?.edgeStates}
              accentColor={ACCENT} readOnly
            />
          </div>
          <AnimationControls
            currentStep={currentStep} totalSteps={steps.length}
            isPlaying={isPlaying} isLoading={isLoading}
            onPlay={play} onPause={pause} onNext={next} onPrev={prev} onReset={reset} onSkipToEnd={skipToEnd}
            accentColor={ACCENT}
          />
        </div>

        {/* Side panel */}
        <div className="algo-side-panel">
          {/* Kruskal: edge list */}
          {mode === 'kruskal' && (
            <div className="algo-side-section" style={{ flex: 'none', maxHeight: 260, overflowY: 'auto' }}>
              <div className="section-title">EDGES (SORTED BY WEIGHT)</div>
              {sortedEdges.map(e => {
                const status = getEdgeStatus(e.id);
                const src = graph.nodes.find(n => n.id === e.source);
                const tgt = graph.nodes.find(n => n.id === e.target);
                return (
                  <motion.div
                    key={e.id}
                    animate={{
                      background: status === 'accepted' ? ACCENT + '55'
                        : status === 'rejected' ? '#FF444422'
                        : status === 'relaxing' ? ACCENT + '33'
                        : 'transparent',
                    }}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '5px 6px', borderBottom: '1px solid rgba(26,26,26,0.1)',
                      fontFamily: 'var(--font-body)', fontSize: '11px',
                    }}
                  >
                    <span>{src?.label}—{tgt?.label}</span>
                    <span style={{ fontWeight: 700 }}>{e.weight}</span>
                    <span style={{
                      fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                      color: status === 'accepted' ? 'green' : status === 'rejected' ? '#FF4444' : 'inherit',
                      textTransform: 'uppercase',
                    }}>
                      {status === 'accepted' ? '✓ MST' : status === 'rejected' ? '✗ CYCLE' : status === 'relaxing' ? '→ CHECK' : '—'}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
          <div className="algo-side-section" style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
            <StepLog steps={steps} currentStep={currentStep} accentColor={ACCENT} onStepClick={jumpToStep} />
          </div>
        </div>
      </div>
    </div>
  );
};
