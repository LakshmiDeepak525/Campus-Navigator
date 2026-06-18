import { Graph, AlgoResult, AlgoStep, NodeState, EdgeState } from '../types/graph';

export function dfs(graph: Graph, startId: string): AlgoResult {
  const steps: AlgoStep[] = [];
  const visited: Record<string, boolean> = {};
  const discoveryTime: Record<string, number> = {};
  let timer = 0;

  // Build adjacency list
  const adj: Record<string, { to: string; edgeId: string }[]> = {};
  for (const n of graph.nodes) adj[n.id] = [];
  for (const e of graph.edges) {
    adj[e.source].push({ to: e.target, edgeId: e.id });
    if (!e.directed) adj[e.target].push({ to: e.source, edgeId: e.id });
  }

  const stack: string[] = [startId];
  const inStack = new Set<string>([startId]);

  const getNodeStates = (current?: string): Record<string, NodeState> => {
    const s: Record<string, NodeState> = {};
    for (const n of graph.nodes) {
      if (visited[n.id]) s[n.id] = 'visited';
      else if (inStack.has(n.id)) s[n.id] = 'frontier';
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
    stack: [...stack],
    discoveryTime: { ...discoveryTime },
    inStack: [...inStack],
  });

  steps.push(snap(`DFS start from ${startId}. Stack: [${startId}]`, startId));

  while (stack.length > 0) {
    const u = stack.pop()!;
    inStack.delete(u);

    if (visited[u]) continue;
    visited[u] = true;
    discoveryTime[u] = timer++;

    steps.push(snap(
      `Pop ${u}. Discovery time=${discoveryTime[u]}. Stack: [${stack.join(', ')}]`,
      u
    ));

    for (const { to, edgeId } of [...adj[u]].reverse()) {
      if (!visited[to]) {
        stack.push(to);
        inStack.add(to);
        steps.push(snap(
          `Discover ${to} from ${u}. Push to stack. Stack: [${stack.join(', ')}]`,
          u, edgeId
        ));
      }
    }
  }

  steps.push(snap('DFS complete. All reachable nodes visited.'));

  return { steps };
}
