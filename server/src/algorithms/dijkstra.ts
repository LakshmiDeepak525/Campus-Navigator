import { Graph, AlgoResult, AlgoStep, NodeState, EdgeState } from '../types/graph';

const INF = Number.MAX_SAFE_INTEGER;

export function dijkstra(graph: Graph, sourceId: string, targetId?: string): AlgoResult {
  const steps: AlgoStep[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();

  // Build adjacency list (undirected + directed)
  const adj: Record<string, { to: string; weight: number; edgeId: string }[]> = {};
  for (const node of graph.nodes) {
    adj[node.id] = [];
    dist[node.id] = INF;
    prev[node.id] = null;
  }
  for (const edge of graph.edges) {
    adj[edge.source].push({ to: edge.target, weight: edge.weight, edgeId: edge.id });
    if (!edge.directed) {
      adj[edge.target].push({ to: edge.source, weight: edge.weight, edgeId: edge.id });
    }
  }

  dist[sourceId] = 0;

  // Simple priority queue (min-heap via sorted array for clarity)
  type PQEntry = { id: string; dist: number };
  const pq: PQEntry[] = [{ id: sourceId, dist: 0 }];

  const getNodeStates = (current?: string): Record<string, NodeState> => {
    const states: Record<string, NodeState> = {};
    for (const n of graph.nodes) {
      if (visited.has(n.id)) states[n.id] = 'visited';
      else if (pq.some(e => e.id === n.id)) states[n.id] = 'frontier';
      else states[n.id] = 'unvisited';
    }
    if (current) states[current] = 'current';
    return states;
  };

  const getEdgeStates = (relaxingEdgeId?: string): Record<string, EdgeState> => {
    const states: Record<string, EdgeState> = {};
    for (const e of graph.edges) states[e.id] = 'default';
    if (relaxingEdgeId) states[relaxingEdgeId] = 'relaxing';
    return states;
  };

  const snapshot = (desc: string, current?: string, relaxingEdgeId?: string): AlgoStep => ({
    stepIndex: steps.length,
    description: desc,
    nodeStates: getNodeStates(current),
    edgeStates: getEdgeStates(relaxingEdgeId),
    distances: { ...dist },
    queue: pq.map(e => e.id),
  });

  steps.push(snapshot(`Initialize: source ${sourceId} distance=0. All others=∞.`));

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { id: u } = pq.shift()!;

    if (visited.has(u)) continue;
    visited.add(u);

    steps.push(snapshot(`Visiting node ${u} (distance=${dist[u]}).`, u));

    if (u === targetId) {
      steps.push(snapshot(`Target ${targetId} reached! Shortest path found.`, u));
      break;
    }

    for (const { to, weight, edgeId } of adj[u]) {
      if (visited.has(to)) continue;
      const newDist = dist[u] + weight;
      steps.push(snapshot(
        `Relaxing edge ${u}→${to}: ${dist[u]}+${weight}=${newDist} vs current ${dist[to] === INF ? '∞' : dist[to]}.`,
        u, edgeId
      ));

      if (newDist < dist[to]) {
        dist[to] = newDist;
        prev[to] = u;
        pq.push({ id: to, dist: newDist });
        steps.push(snapshot(`Updated distance to ${to} = ${newDist}. Added to queue.`, u, edgeId));
      }
    }
  }

  // Reconstruct final path
  const finalPath: string[] = [];
  if (targetId && dist[targetId] < INF) {
    let cur: string | null = targetId;
    while (cur) {
      finalPath.unshift(cur);
      cur = prev[cur];
    }
  }

  // Final summary step
  const finalDesc = targetId 
    ? (dist[targetId] < INF ? `Shortest path to ${targetId} found (cost=${dist[targetId]}).` : `No path found to ${targetId}.`)
    : "Algorithm complete. All reachable nodes' shortest paths computed.";

  const finalNodeStates: Record<string, NodeState> = {};
  const finalEdgeStates: Record<string, EdgeState> = {};
  for (const n of graph.nodes) finalNodeStates[n.id] = visited.has(n.id) ? 'visited' : 'unvisited';
  for (const e of graph.edges) finalEdgeStates[e.id] = 'default';

  if (targetId && dist[targetId] < INF) {
    for (const id of finalPath) finalNodeStates[id] = 'path';
    for (let i = 0; i < finalPath.length - 1; i++) {
      const a = finalPath[i], b = finalPath[i + 1];
      const e = graph.edges.find(e =>
        (e.source === a && e.target === b) || (!e.directed && e.source === b && e.target === a)
      );
      if (e) finalEdgeStates[e.id] = 'accepted';
    }
  }

  steps.push({
    stepIndex: steps.length,
    description: finalDesc,
    nodeStates: finalNodeStates,
    edgeStates: finalEdgeStates,
    distances: { ...dist },
    queue: [],
  });

  return { steps, finalPath, totalCost: targetId ? dist[targetId] : undefined };
}
