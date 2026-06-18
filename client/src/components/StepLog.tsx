import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepLogProps {
  steps: { stepIndex: number; description: string }[];
  currentStep: number;
  accentColor?: string;
  onStepClick?: (index: number) => void;
}

export const StepLog: React.FC<StepLogProps> = ({ steps, currentStep, accentColor = '#FFE566', onStepClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentStep]);

  const visibleSteps = steps.slice(0, currentStep + 1);

  return (
    <div 
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        background: 'var(--color-paper)',
      }}
    >
      <div className="section-title">STEP LOG</div>
      <AnimatePresence initial={false}>
        {visibleSteps.map((step, i) => (
          <motion.div
            key={step.stepIndex}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onStepClick?.(step.stepIndex)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              padding: '6px 8px',
              border: i === visibleSteps.length - 1 ? `2px solid ${accentColor}` : '1px solid rgba(26,26,26,0.2)',
              background: i === visibleSteps.length - 1 ? accentColor + '33' : 'transparent',
              lineHeight: 1.5,
              cursor: onStepClick ? 'pointer' : 'default',
            }}
            whileHover={onStepClick ? { backgroundColor: 'rgba(26,26,26,0.05)' } : {}}
          >
            <span style={{ opacity: 0.5, marginRight: 6 }}>[{step.stepIndex + 1}]</span>
            {step.description}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
