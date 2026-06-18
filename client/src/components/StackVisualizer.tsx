import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StackVisualizerProps {
  stack: string[];
  nodeLabels: Record<string, string>;
  accentColor: string;
}

export const StackVisualizer: React.FC<StackVisualizerProps> = ({ stack, nodeLabels, accentColor }) => {
  const reversed = [...stack].reverse(); // top of stack first

  return (
    <div>
      <div className="section-title">STACK</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: 200, overflowY: 'auto' }}>
        <AnimatePresence initial={false}>
          {reversed.length === 0 ? (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
              style={{ fontFamily: 'var(--font-body)', fontSize: '11px', padding: '6px 8px' }}>
              Empty
            </motion.div>
          ) : reversed.map((id, i) => (
            <motion.div
              key={id + i}
              layout
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                padding: '5px 10px',
                border: 'var(--border)',
                background: i === 0 ? accentColor : 'var(--color-paper)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: i === 0 ? 700 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ opacity: 0.4, fontSize: '9px' }}>{i === 0 ? '↑TOP' : ''}</span>
              <span>{nodeLabels[id] || id}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div style={{
          height: 4,
          background: 'var(--color-ink)',
          marginTop: 2,
        }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', opacity: 0.4, textAlign: 'center' }}>BOTTOM</div>
      </div>
    </div>
  );
};
