import React from 'react';

interface AlgoHeaderProps {
  title: string;
  complexity: string;
  description: string;
  accentColor: string;
}

export const AlgoHeader: React.FC<AlgoHeaderProps> = ({ title, complexity, description, accentColor }) => (
  <div style={{
    borderBottom: 'var(--border)',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: accentColor,
    flexShrink: 0,
    flexWrap: 'wrap',
  }}>
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      fontSize: '15px',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    }}>
      {title}
    </span>
    <span className="badge-brutal" style={{ background: 'var(--color-ink)', color: 'var(--color-paper)' }}>
      {complexity}
    </span>
    <span style={{
      fontFamily: 'var(--font-body)',
      fontSize: '12px',
      opacity: 0.7,
      flex: 1,
    }}>
      {description}
    </span>
  </div>
);
