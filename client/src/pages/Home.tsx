import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NavBar } from '../components/NavBar';

const ALGO_CARDS = [
  { title: 'DIJKSTRA',       sub: "Shortest path. Greedy. O((V+E) log V).",  accent: '#FF6B6B', path: '/dijkstra',  icon: '⬡' },
  { title: 'BELLMAN-FORD',   sub: "Handles negative weights. Detects cycles.", accent: '#6BFF8E', path: '/bellman',   icon: '↻' },
  { title: 'FLOYD-WARSHALL', sub: "All-pairs shortest paths. O(V³).",          accent: '#6BB5FF', path: '/floyd',     icon: '⊞' },
  { title: 'BFS / DFS',      sub: "Level-order traversal vs depth plunge.",    accent: '#FF6BDB', path: '/bfsdfs',   icon: '⋯' },
  { title: 'MST',            sub: "Minimum spanning tree. Kruskal + Prim.",    accent: '#FF9F6B', path: '/mst',      icon: '⊤' },
  { title: 'A* SEARCH',      sub: "Heuristic-driven shortest path. O(E log V).", accent: '#9966FF', path: '/astar',    icon: '✦' },
  { title: 'GRAPH BUILDER',  sub: "Add nodes, edges. Build your own campus.",  accent: '#FFE566', path: '/builder',  icon: '⊕' },
];

const cardVariants = {
  rest:  { x: 0, y: 0, boxShadow: '4px 4px 0 #1A1A1A' },
  hover: { x: -4, y: -4, boxShadow: '10px 10px 0 #1A1A1A', transition: { type: 'spring' as const, stiffness: 500, damping: 25 } },
};

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-paper)' }}>
      <NavBar />

      {/* Hero */}
      <div style={{
        padding: '60px 40px 40px',
        borderBottom: 'var(--border-thick)',
        background: 'var(--color-accent)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(26,26,26,0.07) 39px, rgba(26,26,26,0.07) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(26,26,26,0.07) 39px, rgba(26,26,26,0.07) 40px)',
          pointerEvents: 'none',
        }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(42px, 8vw, 96px)',
            lineHeight: 0.9,
            textTransform: 'uppercase',
            transform: 'rotate(-2deg)',
            display: 'inline-block',
            marginBottom: 16,
            position: 'relative',
          }}>
            CAMPUS
            <br />
            NAVIGATOR
            <div style={{
              position: 'absolute', bottom: -8, left: 0, right: 0,
              height: 6, background: 'var(--color-ink)', transform: 'rotate(0deg)',
            }} />
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(12px, 2vw, 18px)',
            marginTop: 24,
            opacity: 0.75,
            letterSpacing: '0.05em',
          }}>
            Graph algorithms. Visualized. Brutally.
          </p>
        </motion.div>
      </div>

      {/* Cards grid */}
      <div style={{
        flex: 1,
        padding: '40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
      }}>
        {ALGO_CARDS.map((card, i) => (
          <motion.div
            key={card.path}
            variants={cardVariants}
            initial="rest"
            whileHover="hover"
            onClick={() => navigate(card.path)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            style={{
              background: card.accent,
              border: 'var(--border-thick)',
              boxShadow: '4px 4px 0 #1A1A1A',
              padding: '24px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minHeight: 160,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontSize: '28px',
                lineHeight: 1,
                fontFamily: 'var(--font-display)',
              }}>{card.icon}</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>{card.title}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', opacity: 0.7, lineHeight: 1.6 }}>
              {card.sub}
            </p>
            <div style={{ marginTop: 'auto', alignSelf: 'flex-end' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                opacity: 0.6,
              }}>
                OPEN →
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: 'var(--border)',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        opacity: 0.5,
      }}>
        <span>CAMPUS NAVIGATOR — DAA PROJECT</span>
        <span>5 ALGORITHMS · REAL-TIME VISUALIZATION</span>
      </div>
    </div>
  );
};
