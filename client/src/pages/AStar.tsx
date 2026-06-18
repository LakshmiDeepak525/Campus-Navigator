import React, { useState } from 'react';
import { NavBar } from '../components/NavBar';
import { AlgoHeader } from '../components/AlgoHeader';
import { GraphCanvas } from '../components/GraphCanvas';
import { AnimationControls } from '../components/AnimationControls';
import { StepLog } from '../components/StepLog';
import { DistanceTable } from '../components/DistanceTable';
import { QueueVisualizer } from '../components/QueueVisualizer';
import { useAlgoRunner } from '../hooks/useAlgoRunner';
import { useStore } from '../store/useStore';

const ACCENT = '#9966FF';

export const AStar: React.FC = () => {
  const { graph } = useStore();
  const [source, setSource] = useState(graph.nodes[0]?.id || '');
  const [target, setTarget] = useState(graph.nodes[graph.nodes.length - 1]?.id || '');

  const { steps, currentStep, current, isPlaying, isLoading, error, runAlgo,
    play, pause, next, prev, reset, skipToEnd, jumpToStep } = useAlgoRunner({ endpoint: '/api/algo/astar' });

  const nodeLabels = Object.fromEntries(graph.nodes.map(n => [n.id, n.label]));

  return (
    <div className="algo-layout" style={{ '--page-accent': ACCENT } as React.CSSProperties}>
      <NavBar />
      <AlgoHeader
        title="A* SEARCH"
        complexity="O(E log V)"
        description="Informed search algorithm that uses heuristics to find the shortest path efficiently. f(n) = g(n) + h(n)."
        accentColor={ACCENT}
      />

      {/* Control bar */}
      <div style={{
        borderBottom: 'var(--border)',
        padding: '10px 16px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap',
        background: 'var(--color-paper)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', opacity: 0.6 }}>SOURCE</label>
          <select className="select-brutal" value={source} onChange={e => setSource(e.target.value)} aria-label="Source node">
            {graph.nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', opacity: 0.6 }}>TARGET</label>
          <select className="select-brutal" value={target} onChange={e => setTarget(e.target.value)} aria-label="Target node">
            {graph.nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
        </div>
        <button
          className="btn-brutal accent"
          style={{ background: ACCENT, color: 'white' }}
          onClick={() => runAlgo({ source, target })}
          disabled={isLoading || !source || !target}
        >
          {isLoading ? 'RUNNING...' : '▶ RUN'}
        </button>
        {error && <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#FF4444' }}>Error: {error}</span>}
      </div>

      <div className="algo-body">
        {/* Canvas */}
        <div className="algo-canvas-area" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            <GraphCanvas
              nodes={graph.nodes}
              edges={graph.edges}
              nodeStates={current?.nodeStates}
              edgeStates={current?.edgeStates}
              accentColor={ACCENT}
              readOnly
            />
          </div>
          <AnimationControls
            currentStep={currentStep}
            totalSteps={steps.length}
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlay={play} onPause={pause} onNext={next} onPrev={prev} onReset={reset} onSkipToEnd={skipToEnd}
            accentColor={ACCENT}
          />
        </div>

        {/* Side panel */}
        <div className="algo-side-panel">
          <div className="algo-side-section" style={{ flex: 'none' }}>
            <DistanceTable 
               nodes={graph.nodes} 
               distances={current?.distances} 
               accentColor={ACCENT} 
               sourceId={source} 
               labelOverride="g-score" 
            />
          </div>
          <div className="algo-side-section" style={{ flex: 'none' }}>
            <QueueVisualizer
              queue={current?.queue || []}
              nodeLabels={nodeLabels}
              accentColor={ACCENT}
              title="OPEN SET (PQ)"
            />
          </div>
          <div className="algo-side-section" style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
            <StepLog steps={steps} currentStep={currentStep} accentColor={ACCENT} onStepClick={jumpToStep} />
          </div>
        </div>
      </div>
    </div>
  );
};
