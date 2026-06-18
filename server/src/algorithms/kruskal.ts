import { Graph, AlgoResult, AlgoStep, NodeState, EdgeState } from '../types/graph';

class UnionFind {
  parent: Record<string, string> = {};
  rank: Record<string, number> = {};

  constructor(ids: string[]) {
    for (const id of ids) {
      this.parent[id] = id;
      this.rank[id] = 0;
    }
  }

  find(x: string): string {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }

  union(x: string, y: string): boolean {
    const px = this.find(x), py = this.find(y);
    if (px === py) return false;
    if (this.rank[px] < this.rank[py]) this.parent[px] = py;
    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;
    else { this.parent[py] = px; this.rank[px]++; }
    return true;
  }
}

export function kruskal(graph: Graph): AlgoResult {
  const steps: AlgoStep[] = [];
  const mstEdges: string[] = [];
  let totalCost = 0;

  const sorted = [...graph.edges].sort((a, b) => a.weight - b.weight);
  const uf = new UnionFind(graph.nodes.map(n => n.id));

  const edgeStatus: Record<string, EdgeState> = {};
  for (const e of graph.edges) edgeStatus[e.id] = 'default';

  const getNodeStates = (): Record<string, NodeState> => {
    const connected = new Set<string>();
    for (const eid of mstEdges) {
      const e = graph.edges.find(e => e.id === eid)!;
      connected.add(e.source);
      connected.add(e.target);
    }
    const s: Record<string, NodeState> = {};
    for (const n of graph.nodes) s[n.id] = connected.has(n.id) ? 'visited' : 'unvisited';
    return s;
  };

  const snap = (desc: string, cost?: number): AlgoStep => ({
    stepIndex: steps.length,
    description: desc,
    nodeStates: getNodeStates(),
    edgeStates: { ...edgeStatus },
    mstCost: cost ?? totalCost,
  });

  steps.push(snap(`Kruskal: Sort ${sorted.length} edges by weight. Begin processing.`));

  for (const edge of sorted) {
    edgeStatus[edge.id] = 'relaxing';
    steps.push(snap(`Consider edge ${edge.source}—${edge.target} with weight ${edge.weight}.`));
    if (uf.union(edge.source, edge.target)) {
      mstEdges.push(edge.id);
      totalCost += edge.weight;
      edgeStatus[edge.id] = 'accepted';
      steps.push(snap(
        `Accept edge ${edge.source}—${edge.target}. No cycle formed. MST cost=${totalCost}.`,
        totalCost
      ));
    } else {
      edgeStatus[edge.id] = 'rejected';
      steps.push(snap(
        `Reject edge ${edge.source}—${edge.target}. Would form a cycle.`
      ));
    }

    if (mstEdges.length === graph.nodes.length - 1) break;
  }

  steps.push(snap(`Kruskal complete. MST total cost = ${totalCost}.`));

  return { steps, totalCost };
}
