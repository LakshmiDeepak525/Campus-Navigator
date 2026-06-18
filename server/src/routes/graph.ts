import { Router, Request, Response } from 'express';
import { Graph } from '../types/graph';

const router = Router();

// In-memory graph store
let storedGraph: Graph = { nodes: [], edges: [] };

router.get('/', (_req: Request, res: Response) => {
  res.json(storedGraph);
});

router.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<Graph>;
  if (!body.nodes || !body.edges) {
    res.status(400).json({ error: 'Graph must have nodes and edges arrays.' });
    return;
  }
  storedGraph = { nodes: body.nodes, edges: body.edges };
  res.json({ ok: true, nodeCount: storedGraph.nodes.length, edgeCount: storedGraph.edges.length });
});

export default router;
