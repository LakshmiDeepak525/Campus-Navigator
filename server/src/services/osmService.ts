import fetch from 'node-fetch';
import { Graph, GraphNode, GraphEdge } from '../types/graph';

export async function fetchCampusFromOSM(bbox: string): Promise<Graph> {
  // bbox format: "south,west,north,east"
  const query = `
    [out:json][timeout:25];
    (
      way["highway"~"footway|path|pedestrian|steps|corridor"]["area"!~"yes"](${bbox});
    );
    out body;
    >;
    out skel qt;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`OSM fetch failed: ${response.statusText}`);

  const data = await response.json() as any;
  const osm = data.elements as any[];

  // Build node map
  const osmNodes: Record<number, { lat: number; lon: number }> = {};
  for (const el of osm) {
    if (el.type === 'node') osmNodes[el.id] = { lat: el.lat, lon: el.lon };
  }

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const nodeIndex: Record<number, string> = {};
  let nodeCounter = 0;

  const getOrCreateNode = (osmId: number): string => {
    if (nodeIndex[osmId]) return nodeIndex[osmId];
    const osmNode = osmNodes[osmId];
    if (!osmNode) return '';
    const id = `osm_${nodeCounter}`;
    const label = String.fromCharCode(65 + (nodeCounter % 26)) + (nodeCounter < 26 ? '' : Math.floor(nodeCounter / 26).toString());
    // Normalize coords to canvas space (0-800 x 0-600)
    nodes.push({ id, label, x: 0, y: 0 });
    nodeIndex[osmId] = id;
    nodeCounter++;
    return id;
  };

  // Haversine distance in metres
  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  let edgeCounter = 0;
  for (const el of osm) {
    if (el.type !== 'way') continue;
    const wayNodes: number[] = el.nodes;
    for (let i = 0; i < wayNodes.length - 1; i++) {
      const aId = getOrCreateNode(wayNodes[i]);
      const bId = getOrCreateNode(wayNodes[i + 1]);
      if (!aId || !bId) continue;
      const a = osmNodes[wayNodes[i]], b = osmNodes[wayNodes[i + 1]];
      const weight = haversine(a.lat, a.lon, b.lat, b.lon);
      edges.push({ id: `e_${edgeCounter++}`, source: aId, target: bId, weight, directed: false });
    }
  }

  // Normalize coordinates
  if (nodes.length > 0) {
    const usedOsmNodeIds = Object.keys(nodeIndex);
    const usedLats = usedOsmNodeIds.map(id => osmNodes[Number(id)].lat);
    const usedLons = usedOsmNodeIds.map(id => osmNodes[Number(id)].lon);
    
    const minLat = Math.min(...usedLats), maxLat = Math.max(...usedLats);
    const minLon = Math.min(...usedLons), maxLon = Math.max(...usedLons);
    
    for (const node of nodes) {
      const osmIdStr = Object.keys(nodeIndex).find(k => nodeIndex[k as any] === node.id);
      if (osmIdStr && osmNodes[Number(osmIdStr)]) {
        const oNode = osmNodes[Number(osmIdStr)];
        node.x = Math.round(((oNode.lon - minLon) / (maxLon - minLon || 1)) * 750 + 25);
        node.y = Math.round((1 - (oNode.lat - minLat) / (maxLat - minLat || 1)) * 550 + 25);
      }
    }
  }

  return { nodes, edges };
}
