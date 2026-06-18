import React from 'react';
import { motion } from 'framer-motion';

interface MatrixGridProps {
  nodeIds: string[];
  nodeLabels: Record<string, string>;
  matrix: number[][] | undefined;
  currentK?: number;
  accentColor: string;
  onCellClick?: (i: number, j: number) => void;
  highlightCell?: [number, number] | null;
}

const INF = 1e9;
const FMT = (v: number) => (v >= INF || v >= Number.MAX_SAFE_INTEGER / 2 ? '∞' : String(v));

export const MatrixGrid: React.FC<MatrixGridProps> = ({
  nodeIds, nodeLabels, matrix, currentK, accentColor, onCellClick, highlightCell
}) => {
  const n = nodeIds.length;
  if (!matrix || n === 0) return (
    <div style={{ padding: 16, fontFamily: 'var(--font-mono)', opacity: 0.5 }}>Run algorithm to see matrix.</div>
  );

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
      <div className="section-title">DISTANCE MATRIX</div>
      <table style={{ borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '11px' }}>
        <thead>
          <tr>
            <th style={{ padding: '4px 6px', border: 'var(--border)', background: 'var(--color-ink)', color: 'var(--color-paper)', fontSize: '10px' }}>–</th>
            {nodeIds.map((id, j) => (
              <th key={id} style={{
                padding: '4px 8px',
                border: 'var(--border)',
                background: j === currentK ? accentColor : 'var(--color-ink)',
                color: j === currentK ? 'var(--color-ink)' : 'var(--color-paper)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                minWidth: 44,
              }}>
                {nodeLabels[id] || id}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nodeIds.map((rowId, i) => (
            <tr key={rowId}>
              <th style={{
                padding: '4px 8px',
                border: 'var(--border)',
                background: i === currentK ? accentColor : 'var(--color-ink)',
                color: i === currentK ? 'var(--color-ink)' : 'var(--color-paper)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
              }}>
                {nodeLabels[rowId] || rowId}
              </th>
              {nodeIds.map((_, j) => {
                const val = matrix[i]?.[j] ?? INF;
                const isKRowCol = i === currentK || j === currentK;
                const isDiag = i === j;
                const isHL = highlightCell?.[0] === i && highlightCell?.[1] === j;
                return (
                  <motion.td
                    key={j}
                    layout
                    animate={{
                      background: isHL ? '#FF6B6B' : isKRowCol ? accentColor + '55' : isDiag ? 'rgba(26,26,26,0.08)' : 'var(--color-paper)',
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      padding: '5px 8px',
                      border: 'var(--border)',
                      textAlign: 'center',
                      cursor: onCellClick ? 'pointer' : 'default',
                      fontWeight: isDiag ? 700 : 400,
                      minWidth: 44,
                    }}
                    onClick={() => onCellClick?.(i, j)}
                  >
                    {FMT(val)}
                  </motion.td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
