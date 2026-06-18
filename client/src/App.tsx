import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home } from './pages/Home';
import { GraphBuilder } from './pages/GraphBuilder';
import { Dijkstra } from './pages/Dijkstra';
import { BellmanFord } from './pages/BellmanFord';
import { FloydWarshall } from './pages/FloydWarshall';
import { BfsDfs } from './pages/BfsDfs';
import { Mst } from './pages/Mst';
import { AStar } from './pages/AStar';
import { QuickGuide } from './components/QuickGuide';
import { useStore } from './store/useStore';
import axios from 'axios';

const pageVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
  exit:    { x: '-100%', opacity: 0, transition: { duration: 0.2 } },
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ 
        position: 'relative', 
        minHeight: '100vh', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {children}
    </motion.div>
  );
}

function ServerCheck() {
  const setServerOnline = useStore(s => s.setServerOnline);
  const serverOnline = useStore(s => s.serverOnline);

  useEffect(() => {
    const check = async () => {
      try {
        await axios.get('/api/health', { timeout: 3000 });
        setServerOnline(true);
      } catch {
        setServerOnline(false);
      }
    };
    check();
    const id = setInterval(check, 10000);
    return () => clearInterval(id);
  }, [setServerOnline]);

  if (serverOnline) return null;

  return (
    <motion.div
      className="error-banner"
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}
    >
      ⚡ SERVER OFFLINE — Start the backend: `npm start` in /server
      <button
        className="btn-brutal sm"
        style={{ marginLeft: 'auto' }}
        onClick={async () => {
          try { await axios.get('/api/health', { timeout: 3000 }); setServerOnline(true); } catch {}
        }}
      >
        RETRY
      </button>
    </motion.div>
  );
}

function App() {
  const location = useLocation();
  const darkMode = useStore(s => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <>
      <ServerCheck />
      <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
        <QuickGuide />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"         element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/builder"  element={<PageWrapper><GraphBuilder /></PageWrapper>} />
            <Route path="/dijkstra" element={<PageWrapper><Dijkstra /></PageWrapper>} />
            <Route path="/bellman"  element={<PageWrapper><BellmanFord /></PageWrapper>} />
            <Route path="/floyd"    element={<PageWrapper><FloydWarshall /></PageWrapper>} />
            <Route path="/bfsdfs"   element={<PageWrapper><BfsDfs /></PageWrapper>} />
            <Route path="/mst"      element={<PageWrapper><Mst /></PageWrapper>} />
            <Route path="/astar"    element={<PageWrapper><AStar /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>
    </>
  );
}

export default App;
