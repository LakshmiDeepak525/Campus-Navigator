import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const QuickGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('campus-nav-v1-guide');
    if (!hasSeen) {
      setIsOpen(true);
      localStorage.setItem('campus-nav-v1-guide', 'true');
    }
  }, []);

  if (!isOpen) return (
    <button 
      className="btn-brutal sm icon" 
      style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000, background: 'var(--color-accent)' }}
      onClick={() => setIsOpen(true)}
      title="Open Help Guide"
    >
      ?
    </button>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(26,26,26,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          style={{
            background: 'var(--color-paper)',
            border: 'var(--border-thick)',
            boxShadow: '12px 12px 0 var(--color-ink)',
            maxWidth: 500, width: '100%',
            padding: 32,
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          <button 
            className="btn-brutal sm icon" 
            style={{ position: 'absolute', top: -20, right: -20, background: '#FF6B6B' }}
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', textTransform: 'uppercase', marginBottom: 20 }}>
            COMMAND CENTER ⬡
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <section>
              <div className="section-title">CONTROL DECK</div>
              <ul style={{ listStyle: 'none', fontFamily: 'var(--font-mono)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><kbd style={{ background: '#eee', padding: '2px 6px', border: '1px solid #000', borderRadius: 2 }}>Space</kbd> Play / Pause animation</li>
                <li><kbd style={{ background: '#eee', padding: '2px 6px', border: '1px solid #000', borderRadius: 2 }}>→</kbd> Next step / Scrub forward</li>
                <li><kbd style={{ background: '#eee', padding: '2px 6px', border: '1px solid #000', borderRadius: 2 }}>←</kbd> Previous step / Scrub back</li>
                <li><kbd style={{ background: '#eee', padding: '2px 6px', border: '1px solid #000', borderRadius: 2 }}>R</kbd> Reset to beginning</li>
              </ul>
            </section>

            <section>
              <div className="section-title">GRAPH BUILDER</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', opacity: 0.8 }}>
                Place nodes anywhere. To add an edge, select <b>EDGE MODE</b>, click the source node, then the target. 
                Drag nodes to reposition them in <b>IDLE MODE</b>.
              </p>
            </section>

            <section>
              <div className="section-title">OSM IMPORT</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', opacity: 0.8 }}>
                Use our <b>QUICK PRESETS</b> to jump to famous campuses (Stanford, MIT, IIT Delhi) or paste your own bounding box.
              </p>
            </section>

            <section>
              <div className="section-title">PRO TIP</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-ink)', fontWeight: 600 }}>
                Click on any entry in the <b>STEP LOG</b> to jump straight to that state!
              </p>
            </section>
          </div>

          <button 
            className="btn-brutal lg accent" 
            style={{ marginTop: 32, width: '100%' }}
            onClick={() => setIsOpen(false)}
          >
            GOT IT! LET'S BUILD.
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
