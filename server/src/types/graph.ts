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

export type NodeState =
  | 'unvisited'
  | 'frontier'
  | 'current'
  | 'visited'
  | 'path';

export type EdgeState =
  | 'default'
  | 'relaxing'
  | 'accepted'
  | 'rejected';

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

export interface AlgoResult {
  steps: AlgoStep[];
  finalPath?: string[];
  totalCost?: number;
  hasNegativeCycle?: boolean;
}
