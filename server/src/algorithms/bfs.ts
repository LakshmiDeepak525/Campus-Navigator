import { Graph, AlgoResult, AlgoStep, NodeState, EdgeState } from '../types/graph';

export function bfs(graph: Graph, startId: string): AlgoResult {
  const steps: AlgoStep[] = [];
  const visited: Record<string, boolean> = {};
  const levels: Record<string, number> = {};
  const queue: string[] = [startId];
  visited[startId] = true;
  levels[startId] = 0;

  // Build adjacency list
  const adj: Record<string, { to: string; edgeId: string }[]> = {};
  for (const n of graph.nodes) adj[n.id] = [];
  for (const e of graph.edges) {
    adj[e.source].push({ to: e.target, edgeId: e.id });
    if (!e.directed) adj[e.target].push({ to: e.source, edgeId: e.id });
  }

  const getNodeStates = (current?: string): Record<string, NodeState> => {
    const s: Record<string, NodeState> = {};
    for (const n of graph.nodes) {
      if (visited[n.id]) s[n.id] = 'visited';
      else if (queue.includes(n.id)) s[n.id] = 'frontier';
      else s[n.id] = 'unvisited';
    }
    if (current) s[current] = 'current';
    return s;
  };

  const getEdgeStates = (activeId?: string): Record<string, EdgeState> => {
    const s: Record<string, EdgeState> = {};
    for (const e of graph.edges) s[e.id] = visited[e.source] && visited[e.target] ? 'accepted' : 'default';
    if (activeId) s[activeId] = 'relaxing';
    return s;
  };

  const snap = (desc: string, current?: string, activeEdge?: string): AlgoStep => ({
    stepIndex: steps.length,
    description: desc,
    nodeStates: getNodeStates(current),
    edgeStates: getEdgeStates(activeEdge),
    queue: [...queue],
    levels: { ...levels },
  });

  steps.push(snap(`BFS start from ${startId}. Queue: [${startId}]`, startId));

  while (queue.length > 0) {
    const u = queue.shift()!;
    steps.push(snap(`Dequeue ${u} (level ${levels[u]}). Processing neighbors.`, u));

    for (const { to, edgeId } of adj[u]) {
      if (!visited[to]) {
        visited[to] = true;
        levels[to] = levels[u] + 1;
        queue.push(to);
        steps.push(snap(
          `Discover ${to} from ${u}. Level ${levels[to]}. Enqueue. Queue: [${queue.join(', ')}]`,
          u, edgeId
        ));
      }
    }
  }

  steps.push(snap('BFS complete. All reachable nodes visited.'));

  return { steps };
}
