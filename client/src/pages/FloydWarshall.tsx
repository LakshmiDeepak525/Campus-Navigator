import React, { useState } from 'react';
import { NavBar } from '../components/NavBar';
import { AlgoHeader } from '../components/AlgoHeader';
import { GraphCanvas } from '../components/GraphCanvas';
import { AnimationControls } from '../components/AnimationControls';
import { StepLog } from '../components/StepLog';
import { MatrixGrid } from '../components/MatrixGrid';
import { useAlgoRunner } from '../hooks/useAlgoRunner';
import { useStore } from '../store/useStore';

const ACCENT = '#6BB5FF';

export const FloydWarshall: React.FC = () => {
  const { graph } = useStore();
  const [highlightCell, setHighlightCell] = useState<[number, number] | null>(null);

  const { steps, currentStep, current, isPlaying, isLoading, error, runAlgo,
    play, pause, next, prev, reset, skipToEnd, jumpToStep } = useAlgoRunner({ endpoint: '/api/algo/floyd' });

  const nodeIds   = graph.nodes.map(n => n.id);
  const nodeLabels = Object.fromEntries(graph.nodes.map(n => [n.id, n.label]));

  // Highlight path on cell click (just show highlighted nodes for now)
  const handleCellClick = (i: number, j: number) => {
    setHighlightCell(prev => (prev?.[0] === i && prev?.[1] === j) ? null : [i, j]);
  };

  // Build nodeStates based on highlighted cell
  const nodeStates = React.useMemo(() => {
    const base = current?.nodeStates || {};
    if (!highlightCell) return base;
    const [i, j] = highlightCell;
    const s = { ...base };
    if (nodeIds[i]) s[nodeIds[i]] = 'current';
    if (nodeIds[j]) s[nodeIds[j]] = 'path';
    return s;
  }, [current, highlightCell, nodeIds]);

  return (
    <div className="algo-layout" style={{ '--page-accent': ACCENT } as React.CSSProperties}>
      <NavBar />
      <AlgoHeader
        title="FLOYD-WARSHALL ALGORITHM"
        complexity="O(V³)"
        description="Computes all-pairs shortest paths. Works with negative weights (no negative cycles)."
        accentColor={ACCENT}
      />

      {/* Control bar */}
      <div style={{
        borderBottom: 'var(--border)', padding: '10px 16px',
        display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap',
        background: 'var(--color-paper)', flexShrink: 0,
      }}>
        <button className="btn-brutal accent" style={{ background: ACCENT }}
          onClick={() => runAlgo({})} disabled={isLoading}>
          {isLoading ? 'RUNNING...' : '▶ RUN'}
        </button>
        {current?.currentK !== undefined && current.currentK >= 0 && (
          <div style={{
            border: 'var(--border)', padding: '4px 14px',
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px',
            background: ACCENT, textTransform: 'uppercase',
          }}>
            K = {graph.nodes[current.currentK]?.label || current.currentK}
          </div>
        )}
        {highlightCell && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', opacity: 0.7 }}>
            Showing path: {graph.nodes[highlightCell[0]]?.label} → {graph.nodes[highlightCell[1]]?.label}
            <button className="btn-brutal sm" style={{ marginLeft: 8 }} onClick={() => setHighlightCell(null)}>✕</button>
          </div>
        )}
        {error && <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#FF4444' }}>Error: {error}</span>}
      </div>

      <div className="algo-body">
        {/* Canvas (left 50%) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: 'var(--border)' }}>
          <div style={{ flex: 1 }}>
            <GraphCanvas
              nodes={graph.nodes} edges={graph.edges}
              nodeStates={nodeStates} edgeStates={current?.edgeStates}
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

        {/* Right: matrix + log */}
        <div style={{ width: 480, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'auto', padding: 12, borderBottom: 'var(--border)' }}>
            <MatrixGrid
              nodeIds={nodeIds}
              nodeLabels={nodeLabels}
              matrix={current?.matrix}
              currentK={current?.currentK}
              accentColor={ACCENT}
              onCellClick={handleCellClick}
              highlightCell={highlightCell}
            />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <StepLog steps={steps} currentStep={currentStep} accentColor={ACCENT} onStepClick={jumpToStep} />
          </div>
        </div>
      </div>
    </div>
  );
};
