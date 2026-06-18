import { Graph, AlgoResult, AlgoStep, NodeState, EdgeState } from '../types/graph';

const INF = Number.MAX_SAFE_INTEGER / 2;

export function bellmanFord(graph: Graph, sourceId: string): AlgoResult {
  const steps: AlgoStep[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};

  for (const node of graph.nodes) {
    dist[node.id] = INF;
    prev[node.id] = null;
  }
  dist[sourceId] = 0;

  const V = graph.nodes.length;

  const getNodeStates = (relaxed?: Set<string>): Record<string, NodeState> => {
    const states: Record<string, NodeState> = {};
    for (const n of graph.nodes) {
      states[n.id] = dist[n.id] < INF ? 'visited' : 'unvisited';
    }
    if (relaxed) for (const id of relaxed) states[id] = 'frontier';
    states[sourceId] = 'current';
    return states;
  };

  const getEdgeStates = (relaxingId?: string, accepted?: Set<string>): Record<string, EdgeState> => {
    const s: Record<string, EdgeState> = {};
    for (const e of graph.edges) s[e.id] = 'default';
    if (accepted) for (const id of accepted) s[id] = 'accepted';
    if (relaxingId) s[relaxingId] = 'relaxing';
    return s;
  };

  const snapshot = (desc: string, iter: number, relaxingId?: string, updated?: Set<string>, accepted?: Set<string>): AlgoStep => ({
    stepIndex: steps.length,
    description: desc,
    nodeStates: getNodeStates(updated),
    edgeStates: getEdgeStates(relaxingId, accepted),
    distances: { ...dist },
    iteration: iter,
  });

  steps.push(snapshot(`Initialize: source ${sourceId}=0, all others=∞.`, 0));

  const acceptedEdges = new Set<string>();

  for (let i = 1; i <= V - 1; i++) {
    let changed = false;
    const updatedNodes = new Set<string>();

    steps.push(snapshot(`Iteration ${i} of ${V - 1}: relaxing all edges.`, i));

    for (const edge of graph.edges) {
      const { id, source, target, weight } = edge;
      const edgePairs: [string, string][] = edge.directed
        ? [[source, target]]
        : [[source, target], [target, source]];

      for (const [u, v] of edgePairs) {
        if (dist[u] < INF) {
          const newDist = dist[u] + weight;
          steps.push(snapshot(
            `Iter ${i}: Relax edge ${u}→${v}: ${dist[u]}+${weight}=${newDist} vs ${dist[v] < INF ? dist[v] : '∞'}.`,
            i, id, updatedNodes, acceptedEdges
          ));
          if (newDist < dist[v]) {
            dist[v] = newDist;
            prev[v] = u;
            updatedNodes.add(v);
            acceptedEdges.add(id);
            changed = true;
            steps.push(snapshot(`Updated ${v}=${newDist}.`, i, id, updatedNodes, acceptedEdges));
          }
        }
      }
    }

    if (!changed) {
      steps.push(snapshot(`No updates in iteration ${i}. Early termination.`, i, undefined, updatedNodes, acceptedEdges));
      break;
    }
  }

  // Negative cycle check
  let hasNegativeCycle = false;
  for (const edge of graph.edges) {
    const { source, target, weight } = edge;
    const pairs: [string, string][] = edge.directed
      ? [[source, target]]
      : [[source, target], [target, source]];
    for (const [u, v] of pairs) {
      if (dist[u] < INF && dist[u] + weight < dist[v]) {
        hasNegativeCycle = true;
        break;
      }
    }
    if (hasNegativeCycle) break;
  }

  const finalStep: AlgoStep = {
    stepIndex: steps.length,
    description: hasNegativeCycle
      ? '⚠ NEGATIVE CYCLE DETECTED! Shortest paths undefined.'
      : 'Algorithm complete. All shortest distances computed.',
    nodeStates: getNodeStates(),
    edgeStates: getEdgeStates(undefined, acceptedEdges),
    distances: { ...dist },
    negativeCycleDetected: hasNegativeCycle,
    iteration: V - 1,
  };
  steps.push(finalStep);

  return { steps, hasNegativeCycle };
}
