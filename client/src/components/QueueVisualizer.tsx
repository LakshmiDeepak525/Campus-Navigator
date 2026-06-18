import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QueueVisualizerProps {
  queue: string[];
  nodeLabels: Record<string, string>;
  accentColor: string;
  title?: string;
}

export const QueueVisualizer: React.FC<QueueVisualizerProps> = ({ queue, nodeLabels, accentColor, title = 'PRIORITY QUEUE' }) => (
  <div>
    <div className="section-title">{title}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: 200, overflowY: 'auto' }}>
      <AnimatePresence initial={false}>
        {queue.length === 0 ? (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            style={{ fontFamily: 'var(--font-body)', fontSize: '11px', padding: '6px 8px' }}
          >
            Empty
          </motion.div>
        ) : queue.map((id, i) => (
          <motion.div
            key={id + '-' + i}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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
            <span style={{ opacity: 0.4, fontSize: '9px' }}>{i === 0 ? '←HEAD' : i + 1}</span>
            <span>{nodeLabels[id] || id}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  </div>
);
