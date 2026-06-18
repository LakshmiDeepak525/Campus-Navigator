import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export const NavBar: React.FC = () => {
  const { darkMode, toggleDarkMode } = useStore();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header style={{
      borderBottom: 'var(--border-thick)',
      background: 'var(--color-accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      height: '52px',
      flexShrink: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'var(--color-ink)' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          ⬡ CAMPUS NAVIGATOR
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {!isHome && (
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button className="btn-brutal sm">← HOME</button>
          </Link>
        )}
        <Link to="/builder" style={{ textDecoration: 'none' }}>
          <button className="btn-brutal sm accent">GRAPH BUILDER</button>
        </Link>
        <button
          className="btn-brutal sm icon"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          {darkMode ? '☀' : '◑'}
        </button>
      </div>
    </header>
  );
};
