import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DistanceTableProps {
  nodes: { id: string; label: string }[];
  distances: Record<string, number> | undefined;
  accentColor: string;
  sourceId?: string;
}

const INF = Number.MAX_SAFE_INTEGER / 2;
const FMT = (v: number) => (v >= INF || v === 1e9 ? '∞' : String(v));

function AnimatedNumber({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      setDisplay(value);
      prevRef.current = value;
    }
  }, [value]);

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'inline-block' }}
    >
      {display}
    </motion.span>
  );
}

export const DistanceTable: React.FC<DistanceTableProps> = ({ nodes, distances, accentColor, sourceId }) => (
  <div>
    <div className="section-title">DISTANCES</div>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '12px' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '4px 6px', borderBottom: 'var(--border)', fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.6 }}>NODE</th>
          <th style={{ textAlign: 'right', padding: '4px 6px', borderBottom: 'var(--border)', fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.6 }}>DIST</th>
        </tr>
      </thead>
      <tbody>
        {nodes.map(n => {
          const v = distances?.[n.id];
          const fmt = v !== undefined ? FMT(v) : '∞';
          const isSource = n.id === sourceId;
          const isReached = v !== undefined && v < INF && v < 1e9;
          return (
            <tr key={n.id} style={{
              background: isSource ? accentColor + '55' : isReached ? accentColor + '22' : 'transparent',
              borderBottom: '1px solid rgba(26,26,26,0.1)',
            }}>
              <td style={{ padding: '5px 6px' }}>{n.label || n.id}</td>
              <td style={{
                padding: '5px 6px',
                textAlign: 'right',
                fontWeight: 700,
                color: isSource ? 'var(--color-ink)' : isReached ? 'var(--color-ink)' : 'rgba(26,26,26,0.4)',
              }}>
                <AnimatedNumber value={fmt} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
