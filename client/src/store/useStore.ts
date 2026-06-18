import { create } from 'zustand';

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  directed?: boolean;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type NodeState = 'unvisited' | 'frontier' | 'current' | 'visited' | 'path';
export type EdgeState = 'default' | 'relaxing' | 'accepted' | 'rejected';

export interface AlgoStep {
  stepIndex: number;
  description: string;
  nodeStates: Record<string, NodeState>;
  edgeStates: Record<string, EdgeState>;
  distances?: Record<string, number>;
  matrix?: number[][];
  queue?: string[];
  stack?: string[];
  mstCost?: number;
  currentK?: number;
  iteration?: number;
  negativeCycleDetected?: boolean;
  levels?: Record<string, number>;
  discoveryTime?: Record<string, number>;
  inStack?: string[];
}

// Sample 8-node campus graph
export const SAMPLE_CAMPUS_GRAPH: Graph = {
  nodes: [
    { id: 'A', label: 'Main Gate',     x: 100, y: 300 },
    { id: 'B', label: 'Library',       x: 280, y: 150 },
    { id: 'C', label: 'Cafeteria',     x: 420, y: 300 },
    { id: 'D', label: 'Lab Block A',   x: 560, y: 160 },
    { id: 'E', label: 'Lab Block B',   x: 660, y: 300 },
    { id: 'F', label: 'Hostel',        x: 480, y: 440 },
    { id: 'G', label: 'Sports Ground', x: 650, y: 450 },
    { id: 'H', label: 'Admin Block',   x: 200, y: 440 },
  ],
  edges: [
    { id: 'e1',  source: 'A', target: 'B', weight: 5  },
    { id: 'e2',  source: 'A', target: 'H', weight: 3  },
    { id: 'e3',  source: 'B', target: 'C', weight: 4  },
    { id: 'e4',  source: 'B', target: 'D', weight: 7  },
    { id: 'e5',  source: 'B', target: 'H', weight: 9  },
    { id: 'e6',  source: 'C', target: 'D', weight: 2  },
    { id: 'e7',  source: 'C', target: 'F', weight: 6  },
    { id: 'e8',  source: 'D', target: 'E', weight: 3  },
    { id: 'e9',  source: 'E', target: 'F', weight: 4  },
    { id: 'e10', source: 'E', target: 'G', weight: 5  },
    { id: 'e11', source: 'F', target: 'G', weight: 8  },
    { id: 'e12', source: 'G', target: 'H', weight: 6  },
  ],
};

interface Store {
  graph: Graph;
  darkMode: boolean;
  animationSpeed: number; // ms between steps
  serverOnline: boolean;

  setGraph: (g: Graph) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  addNode: (node: GraphNode) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: GraphEdge) => void;
  deleteEdge: (id: string) => void;
  clearGraph: () => void;
  loadSampleCampus: () => void;
  toggleDarkMode: () => void;
  setAnimationSpeed: (ms: number) => void;
  setServerOnline: (v: boolean) => void;
}

const LS_KEY = 'campus-nav-graph';

const loadFromStorage = (): Graph => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return SAMPLE_CAMPUS_GRAPH;
};

const saveToStorage = (g: Graph) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(g)); } catch {}
};

export const useStore = create<Store>((set, get) => ({
  graph: loadFromStorage(),
  darkMode: localStorage.getItem('campus-nav-dark') === 'true',
  animationSpeed: 800,
  serverOnline: true,

  setGraph: (g) => { saveToStorage(g); set({ graph: g }); },

  updateNodePosition: (id, x, y) => {
    const nodes = get().graph.nodes.map(n => n.id === id ? { ...n, x, y } : n);
    const g = { ...get().graph, nodes };
    saveToStorage(g);
    set({ graph: g });
  },

  addNode: (node) => {
    const g = { ...get().graph, nodes: [...get().graph.nodes, node] };
    saveToStorage(g);
    set({ graph: g });
  },

  deleteNode: (id) => {
    const g = {
      nodes: get().graph.nodes.filter(n => n.id !== id),
      edges: get().graph.edges.filter(e => e.source !== id && e.target !== id),
    };
    saveToStorage(g);
    set({ graph: g });
  },

  addEdge: (edge) => {
    const g = { ...get().graph, edges: [...get().graph.edges, edge] };
    saveToStorage(g);
    set({ graph: g });
  },

  deleteEdge: (id) => {
    const g = { ...get().graph, edges: get().graph.edges.filter(e => e.id !== id) };
    saveToStorage(g);
    set({ graph: g });
  },

  clearGraph: () => {
    const g: Graph = { nodes: [], edges: [] };
    saveToStorage(g);
    set({ graph: g });
  },

  loadSampleCampus: () => {
    saveToStorage(SAMPLE_CAMPUS_GRAPH);
    set({ graph: SAMPLE_CAMPUS_GRAPH });
  },

  toggleDarkMode: () => {
    const dm = !get().darkMode;
    localStorage.setItem('campus-nav-dark', String(dm));
    set({ darkMode: dm });
    document.documentElement.classList.toggle('dark', dm);
  },

  setAnimationSpeed: (ms) => set({ animationSpeed: ms }),
  setServerOnline: (v) => set({ serverOnline: v }),
}));
