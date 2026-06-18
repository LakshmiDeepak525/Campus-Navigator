import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavBar } from '../components/NavBar';
import { AlgoHeader } from '../components/AlgoHeader';
import { GraphCanvas } from '../components/GraphCanvas';
import { AnimationControls } from '../components/AnimationControls';
import { StepLog } from '../components/StepLog';
import { QueueVisualizer } from '../components/QueueVisualizer';
import { StackVisualizer } from '../components/StackVisualizer';
import { useAlgoRunner } from '../hooks/useAlgoRunner';
import { useStore } from '../store/useStore';

const ACCENT = '#FF6BDB';

export const BfsDfs: React.FC = () => {
  const { graph } = useStore();
  const [mode, setMode] = useState<'bfs' | 'dfs'>('bfs');
  const [start, setStart] = useState(graph.nodes[0]?.id || '');

  const bfsRunner = useAlgoRunner({ endpoint: '/api/algo/bfs' });
  const dfsRunner = useAlgoRunner({ endpoint: '/api/algo/dfs' });
  const runner = mode === 'bfs' ? bfsRunner : dfsRunner;

  const nodeLabels = Object.fromEntries(graph.nodes.map(n => [n.id, n.label]));
  const { steps, currentStep, current, isPlaying, isLoading, error, runAlgo,
    play, pause, next, prev, reset, skipToEnd, jumpToStep } = runner;

  // BFS: level-based node states (override with level-colored states)
  const bfsNodeStates = React.useMemo(() => {
    if (mode !== 'bfs' || !current?.levels) return current?.nodeStates;
    const levels = current.levels;
    const maxLevel = Math.max(...Object.values(levels), 0);
    return current.nodeStates;
  }, [mode, current]);

  // Get traversal order from steps so far
  const visitedOrder = React.useMemo(() => {
    if (!steps.length) return [];
    const visited: string[] = [];
    const seen = new Set<string>();
    for (let i = 0; i <= currentStep; i++) {
      const s = steps[i];
      for (const [id, state] of Object.entries(s.nodeStates || {})) {
        if ((state === 'visited' || state === 'current') && !seen.has(id)) {
          seen.add(id);
          visited.push(id);
        }
      }
    }
    return visited;
  }, [steps, currentStep]);

  return (
    <div className="algo-layout" style={{ '--page-accent': ACCENT } as React.CSSProperties}>
      <NavBar />
      <AlgoHeader
        title={mode === 'bfs' ? "BREADTH-FIRST SEARCH" : "DEPTH-FIRST SEARCH"}
        complexity={mode === 'bfs' ? 'O(V+E)' : 'O(V+E)'}
        description={mode === 'bfs'
          ? 'Explores nodes level by level using a queue. Finds shortest path in unweighted graphs.'
          : 'Plunges deep using a stack (iterative). Records discovery time.'}
        accentColor={ACCENT}
      />

      {/* Control bar */}
      <div style={{
        borderBottom: 'var(--border)', padding: '10px 16px',
        display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap',
        background: 'var(--color-paper)', flexShrink: 0,
      }}>
        {/* Toggle */}
        <div className="toggle-container" style={{ width: 160 }}>
          <button className={`toggle-option ${mode === 'bfs' ? 'active' : ''}`} onClick={() => setMode('bfs')}>BFS</button>
          <button className={`toggle-option ${mode === 'dfs' ? 'active' : ''}`} onClick={() => setMode('dfs')}>DFS</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', opacity: 0.6 }}>START</label>
          <select className="select-brutal" value={start} onChange={e => setStart(e.target.value)} aria-label="Start node">
            {graph.nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
        </div>
        <button className="btn-brutal accent" style={{ background: ACCENT }}
          onClick={() => runAlgo({ start })} disabled={isLoading || !start}>
          {isLoading ? 'RUNNING...' : '▶ RUN'}
        </button>
        {error && <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#FF4444' }}>Error: {error}</span>}
      </div>

      <div className="algo-body">
        <div className="algo-canvas-area" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            <GraphCanvas
              nodes={graph.nodes} edges={graph.edges}
              nodeStates={bfsNodeStates || current?.nodeStates}
              edgeStates={current?.edgeStates}
              accentColor={ACCENT} readOnly
            />
          </div>

          {/* Traversal order strip */}
          <div style={{
            borderTop: 'var(--border)', padding: '8px 12px',
            display: 'flex', gap: 6, flexWrap: 'wrap', background: 'var(--color-paper)',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.5, textTransform: 'uppercase', paddingTop: 2 }}>
              ORDER:
            </span>
            <AnimatePresence>
              {visitedOrder.map((id, i) => (
                <motion.span
                  key={id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  style={{
                    padding: '2px 8px',
                    border: 'var(--border)',
                    background: ACCENT,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {nodeLabels[id] || id}
                </motion.span>
              ))}
            </AnimatePresence>
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
          <div className="algo-side-section" style={{ flex: 'none' }}>
            {mode === 'bfs' ? (
              <QueueVisualizer queue={current?.queue || []} nodeLabels={nodeLabels} accentColor={ACCENT} title="QUEUE" />
            ) : (
              <StackVisualizer stack={current?.stack || []} nodeLabels={nodeLabels} accentColor={ACCENT} />
            )}
          </div>
          {/* DFS discovery times */}
          {mode === 'dfs' && current?.discoveryTime && (
            <div className="algo-side-section" style={{ flex: 'none' }}>
              <div className="section-title">DISCOVERY TIMES</div>
              {Object.entries(current.discoveryTime).map(([id, t]) => (
                <div key={id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontFamily: 'var(--font-body)', fontSize: '11px',
                  padding: '4px 0', borderBottom: '1px solid rgba(26,26,26,0.1)',
                }}>
                  <span>{nodeLabels[id] || id}</span>
                  <span style={{ fontWeight: 700 }}>t={t}</span>
                </div>
              ))}
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
