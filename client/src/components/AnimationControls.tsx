import React from 'react';
import { useStore } from '../store/useStore';

interface AnimationControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onSkipToEnd: () => void;
  accentColor?: string;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  currentStep, totalSteps, isPlaying, isLoading,
  onPlay, onPause, onNext, onPrev, onReset, onSkipToEnd,
  accentColor = '#FFE566',
}) => {
  const { animationSpeed, setAnimationSpeed } = useStore();
  const hasSteps = totalSteps > 0;

  return (
    <div style={{
      borderTop: 'var(--border)',
      padding: '10px 16px',
      background: 'var(--color-paper)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap',
    }}>
      {/* Playback buttons */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button className="btn-brutal icon sm" onClick={onReset} disabled={!hasSteps || isLoading} aria-label="Reset">⏮</button>
        <button className="btn-brutal icon sm" onClick={onPrev}  disabled={!hasSteps || currentStep === 0 || isLoading} aria-label="Previous step">⏪</button>
        <button
          className="btn-brutal icon sm"
          style={{ background: accentColor, minWidth: 48 }}
          onClick={isPlaying ? onPause : onPlay}
          disabled={!hasSteps || isLoading}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? '⟳' : isPlaying ? '⏸' : '▶'}
        </button>
        <button className="btn-brutal icon sm" onClick={onNext}     disabled={!hasSteps || currentStep === totalSteps - 1 || isLoading} aria-label="Next step">⏩</button>
        <button className="btn-brutal icon sm" onClick={onSkipToEnd} disabled={!hasSteps || currentStep === totalSteps - 1 || isLoading} aria-label="Skip to end">⏭</button>
      </div>

      {/* Step counter */}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        border: 'var(--border)',
        padding: '4px 10px',
        background: hasSteps ? accentColor : 'var(--color-paper)',
        minWidth: 90,
        textAlign: 'center',
        fontWeight: 700,
      }}>
        {hasSteps ? `STEP ${currentStep + 1} / ${totalSteps}` : 'NO STEPS'}
      </span>

      {/* Speed slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 180 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', opacity: 0.6, whiteSpace: 'nowrap' }}>
          SLOW
        </span>
        <input
          type="range"
          className="slider-brutal"
          min={150} max={2000} step={50}
          value={2150 - animationSpeed}
          onChange={e => setAnimationSpeed(2150 - Number(e.target.value))}
          style={{ '--page-accent': accentColor } as React.CSSProperties}
          aria-label="Animation speed"
        />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', opacity: 0.6, whiteSpace: 'nowrap' }}>
          FAST
        </span>
      </div>

      {/* Keyboard hint */}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', opacity: 0.45, whiteSpace: 'nowrap' }}>
        [SPACE] [←→] [R]
      </span>
    </div>
  );
};
