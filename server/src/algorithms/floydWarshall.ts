import { Graph, AlgoResult, AlgoStep } from '../types/graph';

const INF = 1e9;

export function floydWarshall(graph: Graph): AlgoResult {
  const steps: AlgoStep[] = [];
  const ids = graph.nodes.map(n => n.id);
  const n = ids.length;
  const idx: Record<string, number> = {};
  ids.forEach((id, i) => (idx[id] = i));

  // Initialize matrix
  const mat: number[][] = Array.from({ length: n }, () => Array(n).fill(INF));
  const next: (string | null)[][] = Array.from({ length: n }, () => Array(n).fill(null));

  for (let i = 0; i < n; i++) mat[i][i] = 0;

  for (const edge of graph.edges) {
    const u = idx[edge.source], v = idx[edge.target];
    if (edge.weight < mat[u][v]) {
      mat[u][v] = edge.weight;
      next[u][v] = edge.target;
    }
    if (!edge.directed && edge.weight < mat[v][u]) {
      mat[v][u] = edge.weight;
      next[v][u] = edge.source;
    }
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (mat[i][j] < INF && !next[i][j]) next[i][j] = ids[j];
    }
  }

  const snap = (desc: string, k: number): AlgoStep => ({
    stepIndex: steps.length,
    description: desc,
    nodeStates: Object.fromEntries(ids.map(id => [id, 'visited' as const])),
    edgeStates: Object.fromEntries(graph.edges.map(e => [e.id, 'default' as const])),
    matrix: mat.map(row => [...row]),
    currentK: k,
  });

  steps.push(snap('Initialize distance matrix from graph edges.', -1));

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (mat[i][k] < INF && mat[k][j] < INF) {
          const through = mat[i][k] + mat[k][j];
          if (through < mat[i][j]) {
            mat[i][j] = through;
            next[i][j] = next[i][k];
          }
        }
      }
    }
    steps.push(snap(`Processed all paths through node ${ids[k]}.`, k));
  }

  steps.push(snap('Floyd-Warshall complete. All-pairs shortest paths computed.', -1));

  return { steps };
}
