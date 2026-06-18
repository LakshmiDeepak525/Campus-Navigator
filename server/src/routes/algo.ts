import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { dijkstra } from '../algorithms/dijkstra';
import { bellmanFord } from '../algorithms/bellmanFord';
import { floydWarshall } from '../algorithms/floydWarshall';
import { bfs } from '../algorithms/bfs';
import { dfs } from '../algorithms/dfs';
import { kruskal } from '../algorithms/kruskal';
import { prim } from '../algorithms/prim';
import { aStar } from '../algorithms/aStar';
import { fetchCampusFromOSM } from '../services/osmService';
import { Graph } from '../types/graph';

const router = Router();

const GraphSchema = z.object({
  nodes: z.array(z.object({ id: z.string(), label: z.string(), x: z.number(), y: z.number() })),
  edges: z.array(z.object({
    id: z.string(), source: z.string(), target: z.string(), weight: z.number(), directed: z.boolean().optional()
  }))
});

const withGraph = (handler: (graph: Graph, req: Request, res: Response) => void) =>
  (req: Request, res: Response) => {
    const parsed = GraphSchema.safeParse(req.body.graph);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid graph', details: parsed.error.issues });
      return;
    }
    handler(parsed.data, req, res);
  };

// POST /api/algo/dijkstra
router.post('/dijkstra', withGraph((graph, req, res) => {
  const { source, target } = req.body;
  if (!source) { res.status(400).json({ error: 'source required' }); return; }
  try {
    const result = dijkstra(graph, source, target);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}));

// POST /api/algo/bellman
router.post('/bellman', withGraph((graph, req, res) => {
  const { source } = req.body;
  if (!source) { res.status(400).json({ error: 'source required' }); return; }
  try {
    const result = bellmanFord(graph, source);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}));

// POST /api/algo/floyd
router.post('/floyd', withGraph((graph, _req, res) => {
  try {
    const result = floydWarshall(graph);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}));

// POST /api/algo/bfs
router.post('/bfs', withGraph((graph, req, res) => {
  const { start } = req.body;
  if (!start) { res.status(400).json({ error: 'start required' }); return; }
  try {
    const result = bfs(graph, start);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}));

// POST /api/algo/dfs
router.post('/dfs', withGraph((graph, req, res) => {
  const { start } = req.body;
  if (!start) { res.status(400).json({ error: 'start required' }); return; }
  try {
    const result = dfs(graph, start);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}));

// POST /api/algo/kruskal
router.post('/kruskal', withGraph((graph, _req, res) => {
  try {
    const result = kruskal(graph);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}));

// POST /api/algo/prim
router.post('/prim', withGraph((graph, req, res) => {
  const { start } = req.body;
  try {
    const startNode = start || graph.nodes[0]?.id || '';
    if (!startNode) throw new Error('No nodes in graph to start Prim\'s algorithm.');
    const result = prim(graph, startNode);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}));

// POST /api/algo/mst — deprecated, use /kruskal or /prim
router.post('/mst', withGraph((graph, req, res) => {
  const { start } = req.body;
  try {
    const kruskalResult = kruskal(graph);
    const primResult = start ? prim(graph, start) : prim(graph, graph.nodes[0]?.id || '');
    res.json({ kruskal: kruskalResult, prim: primResult });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}));

// POST /api/algo/astar
router.post('/astar', withGraph((graph, req, res) => {
  const { source, target } = req.body;
  if (!source || !target) { res.status(400).json({ error: 'source and target required' }); return; }
  try {
    const result = aStar(graph, source, target);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}));

// GET /api/campus/osm
router.get('/osm', async (req: Request, res: Response) => {
  const bbox = req.query.bbox as string;
  if (!bbox) { res.status(400).json({ error: 'bbox query param required (south,west,north,east)' }); return; }
  try {
    const graph = await fetchCampusFromOSM(bbox);
    res.json(graph);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
