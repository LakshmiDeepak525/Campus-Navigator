import { Graph, AlgoResult, AlgoStep, NodeState, EdgeState, GraphNode } from '../types/graph';

const INF = Number.MAX_SAFE_INTEGER;

export function aStar(graph: Graph, sourceId: string, targetId: string): AlgoResult {
  const steps: AlgoStep[] = [];
  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();

  const nodes: Record<string, GraphNode> = {};
  for (const n of graph.nodes) {
    nodes[n.id] = n;
    gScore[n.id] = INF;
    fScore[n.id] = INF;
    prev[n.id] = null;
  }

  const targetNode = nodes[targetId];
  if (!targetNode) throw new Error("Target node not found");

  const heuristic = (n: GraphNode): number => {
    return Math.sqrt(Math.pow(n.x - targetNode.x, 2) + Math.pow(n.y - targetNode.y, 2));
  };

  const adj: Record<string, { to: string; weight: number; edgeId: string }[]> = {};
  for (const n of graph.nodes) adj[n.id] = [];
  for (const edge of graph.edges) {
    adj[edge.source].push({ to: edge.target, weight: edge.weight, edgeId: edge.id });
    if (!edge.directed) {
      adj[edge.target].push({ to: edge.source, weight: edge.weight, edgeId: edge.id });
    }
  }

  gScore[sourceId] = 0;
  fScore[sourceId] = heuristic(nodes[sourceId]);

  type PQEntry = { id: string; f: number };
  const openSet: PQEntry[] = [{ id: sourceId, f: fScore[sourceId] }];

  const getNodeStates = (current?: string): Record<string, NodeState> => {
    const states: Record<string, NodeState> = {};
    for (const n of graph.nodes) {
      if (visited.has(n.id)) states[n.id] = 'visited';
      else if (openSet.some(e => e.id === n.id)) states[n.id] = 'frontier';
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
    distances: { ...gScore }, // We show gScore as distance
    queue: openSet.map(e => e.id),
  });

  steps.push(snapshot(`A* Initialization: source=${nodes[sourceId].label}, target=${targetNode.label}. Heuristic=Euclidean distance.`));

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const { id: u } = openSet.shift()!;

    if (u === targetId) {
      steps.push(snapshot(`Target node ${nodes[u].label} reached!`, u));
      break;
    }

    visited.add(u);
    steps.push(snapshot(`Visiting node ${nodes[u].label}. gScore=${Math.round(gScore[u])}, hScore=${Math.round(heuristic(nodes[u]))}.`, u));

    for (const { to, weight, edgeId } of adj[u]) {
      if (visited.has(to)) continue;

      const tentG = gScore[u] + weight;
      const h = heuristic(nodes[to]);
      const tentF = tentG + h;

      steps.push(snapshot(
        `Evaluating edge to ${nodes[to].label}. New potential gScore: ${Math.round(tentG)} (hScore=${Math.round(h)}).`,
        u, edgeId
      ));

      if (tentG < gScore[to]) {
        prev[to] = u;
        gScore[to] = tentG;
        fScore[to] = tentF;
        if (!openSet.some(e => e.id === to)) {
          openSet.push({ id: to, f: tentF });
        }
        steps.push(snapshot(`Updated ${nodes[to].label}: g=${Math.round(tentG)}, f=${Math.round(tentF)}. Added to open set.`, u, edgeId));
      }
    }
  }

  // Final path
  const finalPath: string[] = [];
  if (gScore[targetId] < INF) {
    let tmp: string | null = targetId;
    while (tmp) {
      finalPath.unshift(tmp);
      tmp = prev[tmp];
    }
  }

  const finalNodeStates: Record<string, NodeState> = {};
  const finalEdgeStates: Record<string, EdgeState> = {};
  for (const n of graph.nodes) finalNodeStates[n.id] = visited.has(n.id) ? 'visited' : 'unvisited';
  for (const e of graph.edges) finalEdgeStates[e.id] = 'default';

  if (finalPath.length > 0) {
    for (const id of finalPath) finalNodeStates[id] = 'path';
    for (let i = 0; i < finalPath.length - 1; i++) {
        const a = finalPath[i], b = finalPath[i+1];
        const e = graph.edges.find(e => (e.source === a && e.target === b) || (!e.directed && e.source === b && e.target === a));
        if (e) finalEdgeStates[e.id] = 'accepted';
    }
  }

  steps.push({
    stepIndex: steps.length,
    description: finalPath.length > 0 ? `A* complete. Path found with cost ${Math.round(gScore[targetId])}.` : "Target unreachable.",
    nodeStates: finalNodeStates,
    edgeStates: finalEdgeStates,
    distances: { ...gScore },
    queue: [],
  });

  return { steps, finalPath, totalCost: gScore[targetId] < INF ? gScore[targetId] : undefined };
}
