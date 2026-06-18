import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavBar } from '../components/NavBar';
import { AlgoHeader } from '../components/AlgoHeader';
import { GraphCanvas } from '../components/GraphCanvas';
import { AnimationControls } from '../components/AnimationControls';
import { StepLog } from '../components/StepLog';
import { DistanceTable } from '../components/DistanceTable';
import { useAlgoRunner } from '../hooks/useAlgoRunner';
import { useStore } from '../store/useStore';

const ACCENT = '#6BFF8E';

export const BellmanFord: React.FC = () => {
  const { graph } = useStore();
  const [source, setSource] = useState(graph.nodes[0]?.id || '');
  const { steps, currentStep, current, isPlaying, isLoading, error, runAlgo,
    play, pause, next, prev, reset, skipToEnd, jumpToStep } = useAlgoRunner({ endpoint: '/api/algo/bellman' });

  const hasNegCycle = current?.negativeCycleDetected;

  return (
    <div className="algo-layout" style={{ '--page-accent': ACCENT } as React.CSSProperties}>
      <NavBar />
      <AlgoHeader
        title="BELLMAN-FORD ALGORITHM"
        complexity="O(V·E)"
        description="Relaxes all edges V-1 times. Handles negative weights. Detects negative cycles."
        accentColor={ACCENT}
      />

      {/* Negative cycle banner */}
      <AnimatePresence>
        {hasNegCycle && (
          <motion.div
            className="error-banner shake"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 20 }}
          >
            ⚠ NEGATIVE CYCLE DETECTED — Shortest paths undefined!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control bar */}
      <div style={{
        borderBottom: 'var(--border)', padding: '10px 16px',
        display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap',
        background: 'var(--color-paper)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', opacity: 0.6 }}>SOURCE</label>
          <select className="select-brutal" value={source} onChange={e => setSource(e.target.value)} aria-label="Source node">
            {graph.nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
        </div>
        <button className="btn-brutal accent" style={{ background: ACCENT }}
          onClick={() => runAlgo({ source })} disabled={isLoading || !source}>
          {isLoading ? 'RUNNING...' : '▶ RUN'}
        </button>

        {/* Iteration counter */}
        {current?.iteration !== undefined && (
          <div style={{
            border: 'var(--border-thick)', padding: '4px 16px',
            fontFamily: 'var(--font-display)', fontSize: '20px',
            background: ACCENT, letterSpacing: '0.05em',
          }}>
            ITER {current.iteration} / {Math.max(graph.nodes.length - 1, 1)}
          </div>
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

        <div className="algo-side-panel">
          <div className="algo-side-section" style={{ flex: 'none' }}>
            <DistanceTable nodes={graph.nodes} distances={current?.distances} accentColor={ACCENT} sourceId={source} />
          </div>
          <div className="algo-side-section" style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
            <StepLog steps={steps} currentStep={currentStep} accentColor={ACCENT} onStepClick={jumpToStep} />
          </div>
        </div>
      </div>
    </div>
  );
};
