import { Graph, AlgoResult, AlgoStep, NodeState, EdgeState } from '../types/graph';

const INF = Number.MAX_SAFE_INTEGER / 2;

export function prim(graph: Graph, startId: string): AlgoResult {
  const steps: AlgoStep[] = [];
  const inMST = new Set<string>();
  const key: Record<string, number> = {};
  const parent: Record<string, string | null> = {};
  let totalCost = 0;

  for (const n of graph.nodes) { key[n.id] = INF; parent[n.id] = null; }
  key[startId] = 0;

  // adjacency
  const adj: Record<string, { to: string; weight: number; edgeId: string }[]> = {};
  for (const n of graph.nodes) adj[n.id] = [];
  for (const e of graph.edges) {
    adj[e.source].push({ to: e.target, weight: e.weight, edgeId: e.id });
    if (!e.directed) adj[e.target].push({ to: e.source, weight: e.weight, edgeId: e.id });
  }

  const mstEdgeIds = new Set<string>();
  const edgeStatus: Record<string, EdgeState> = {};
  for (const e of graph.edges) edgeStatus[e.id] = 'default';

  const getNodeStates = (current?: string): Record<string, NodeState> => {
    const s: Record<string, NodeState> = {};
    for (const n of graph.nodes) {
      if (inMST.has(n.id)) s[n.id] = 'visited';
      else if (key[n.id] < INF) s[n.id] = 'frontier';
      else s[n.id] = 'unvisited';
    }
    if (current) s[current] = 'current';
    return s;
  };

  const snap = (desc: string, current?: string): AlgoStep => ({
    stepIndex: steps.length,
    description: desc,
    nodeStates: getNodeStates(current),
    edgeStates: { ...edgeStatus },
    mstCost: totalCost,
  });

  steps.push(snap(`Prim: Start from ${startId}. Key[${startId}]=0.`));

  for (let iter = 0; iter < graph.nodes.length; iter++) {
    // Pick min key NOT in MST
    let u = '';
    let minKey = INF;
    for (const n of graph.nodes) {
      if (!inMST.has(n.id) && key[n.id] < minKey) {
        minKey = key[n.id];
        u = n.id;
      }
    }
    if (!u) break;

    inMST.add(u);
    if (parent[u]) {
      totalCost += key[u];
      const e = graph.edges.find(e =>
        (e.source === parent[u] && e.target === u) ||
        (!e.directed && e.source === u && e.target === parent[u])
      );
      if (e) { mstEdgeIds.add(e.id); edgeStatus[e.id] = 'accepted'; }
    }

    steps.push(snap(`Add ${u} to MST (key=${key[u]}). Total cost=${totalCost}.`, u));

    for (const { to, weight, edgeId } of adj[u]) {
      if (!inMST.has(to)) {
        const oldStatus = edgeStatus[edgeId];
        edgeStatus[edgeId] = 'relaxing';
        steps.push(snap(`Consider adjacent edge ${u}—${to} with weight ${weight}. Key[${to}] is ${key[to] < INF ? key[to] : '∞'}.`, u));

        if (weight < key[to]) {
          const oldKey = key[to];
          key[to] = weight;
          parent[to] = u;
          steps.push(snap(`Key[${to}] updated from ${oldKey < INF ? oldKey : '∞'} to ${weight} via ${u}.`, u));
        }
        edgeStatus[edgeId] = oldStatus;
      }
    }
  }

  steps.push(snap(`Prim complete. MST total cost = ${totalCost}.`));

  return { steps, totalCost };
}
