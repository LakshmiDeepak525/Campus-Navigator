import React, { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GraphNode, GraphEdge, NodeState, EdgeState } from '../store/useStore';

const INF = 1e9;

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeStates?: Record<string, NodeState>;
  edgeStates?: Record<string, EdgeState>;
  accentColor?: string;
  onNodeClick?: (id: string) => void;
  onEdgeClick?: (id: string) => void;
  onCanvasClick?: (x: number, y: number) => void;
  draggable?: boolean;
  onNodeDrag?: (id: string, x: number, y: number) => void;
  selectedNode?: string | null;
  selectedEdge?: string | null;
  pendingEdgeSource?: string | null;
  readOnly?: boolean;
}

const nodeColor = (state: NodeState | undefined, accent: string): string => {
  switch (state) {
    case 'current':   return accent;
    case 'frontier':  return accent + 'AA';
    case 'visited':   return '#1A1A1A';
    case 'path':      return accent;
    default:          return '#FFFFFF';
  }
};

const nodeScale = (state: NodeState | undefined): number => {
  switch (state) {
    case 'current':  return 1.3;
    case 'frontier': return 1.1;
    case 'path':     return 1.1;
    default:         return 1;
  }
};

const edgeColor = (state: EdgeState | undefined, accent: string): string => {
  switch (state) {
    case 'relaxing':  return accent;
    case 'accepted':  return accent;
    case 'rejected':  return '#FF4444';
    default:          return '#1A1A1A';
  }
};

const edgeWidth = (state: EdgeState | undefined): number => {
  switch (state) {
    case 'relaxing':  return 3.5;
    case 'accepted':  return 4;
    case 'rejected':  return 2;
    default:          return 2;
  }
};

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes, edges, nodeStates = {}, edgeStates = {},
  accentColor = '#FFE566',
  onNodeClick, onEdgeClick, onCanvasClick,
  draggable = false, onNodeDrag,
  selectedNode, selectedEdge, pendingEdgeSource,
  readOnly = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef<string | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);
  const [localNodes, setLocalNodes] = useState<Record<string, { x: number; y: number }>>({});

  const getNodePos = (n: GraphNode) => ({
    x: (localNodes[n.id]?.x ?? n.x) + panOffset.x,
    y: (localNodes[n.id]?.y ?? n.y) + panOffset.y,
  });

  const getSVGPos = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: Math.round(e.clientX - rect.left - panOffset.x),
      y: Math.round(e.clientY - rect.top - panOffset.y),
    };
  }, [panOffset]);

  // Pan background
  const onBgPointerDown = (e: React.PointerEvent<SVGRectElement>) => {
    if (e.button !== 0) return;
    panStart.current = { mx: e.clientX, my: e.clientY, ox: panOffset.x, oy: panOffset.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onBgPointerMove = (e: React.PointerEvent<SVGRectElement>) => {
    if (!panStart.current) return;
    setPanOffset({
      x: panStart.current.ox + (e.clientX - panStart.current.mx),
      y: panStart.current.oy + (e.clientY - panStart.current.my),
    });
  };
  const onBgPointerUp = (e: React.PointerEvent<SVGRectElement>) => {
    if (panStart.current) {
      const dx = Math.abs(e.clientX - panStart.current.mx);
      const dy = Math.abs(e.clientY - panStart.current.my);
      if (dx < 5 && dy < 5 && onCanvasClick) {
        const { x, y } = getSVGPos(e);
        onCanvasClick(x, y);
      }
    }
    panStart.current = null;
  };

  // Node drag
  const onNodePointerDown = (e: React.PointerEvent<SVGGElement>, nodeId: string) => {
    if (!draggable) return;
    e.stopPropagation();
    draggingRef.current = nodeId;
    (e.target as Element).closest('g')?.setPointerCapture(e.pointerId);
  };
  const onNodePointerMove = (e: React.PointerEvent<SVGGElement>, nodeId: string) => {
    if (draggingRef.current !== nodeId) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left - panOffset.x);
    const y = Math.round(e.clientY - rect.top - panOffset.y);
    setLocalNodes(prev => ({ ...prev, [nodeId]: { x, y } }));
    onNodeDrag?.(nodeId, x, y);
  };
  const onNodePointerUp = (_e: React.PointerEvent, nodeId: string) => {
    if (draggingRef.current === nodeId) draggingRef.current = null;
  };

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      style={{ display: 'block', cursor: 'crosshair' }}
      aria-label="Graph canvas"
    >
      {/* Dot grid */}
      <defs>
        <pattern id="dotgrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(26,26,26,0.18)" />
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect
        width="100%" height="100%"
        fill="url(#dotgrid)"
        style={{ cursor: onCanvasClick ? 'crosshair' : 'grab' }}
        onPointerDown={onBgPointerDown}
        onPointerMove={onBgPointerMove}
        onPointerUp={onBgPointerUp}
      />

      {/* Edges */}
      {edges.map(edge => {
        const src = nodeMap[edge.source];
        const tgt = nodeMap[edge.target];
        if (!src || !tgt) return null;
        const sp = getNodePos(src);
        const tp = getNodePos(tgt);
        const mx = (sp.x + tp.x) / 2;
        const my = (sp.y + tp.y) / 2;
        const state = edgeStates[edge.id] as EdgeState | undefined;
        const isSelected = selectedEdge === edge.id;
        const color = isSelected ? '#FF6B6B' : edgeColor(state, accentColor);
        const width = isSelected ? 4 : edgeWidth(state);
        const len = Math.hypot(tp.x - sp.x, tp.y - sp.y);

        return (
          <g key={edge.id} onClick={() => onEdgeClick?.(edge.id)} style={{ cursor: onEdgeClick ? 'pointer' : 'default' }}>
            <motion.line
              x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y}
              stroke={color}
              strokeWidth={width}
              strokeDasharray={state === 'relaxing' ? len : undefined}
              animate={{
                stroke: color,
                strokeWidth: width,
                strokeDashoffset: state === 'relaxing' ? [len, 0] : 0,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            {/* Arrow for directed edges */}
            {edge.directed && (
              <motion.polygon
                points={`0,-5 10,0 0,5`}
                fill={color}
                transform={`translate(${tp.x},${tp.y}) rotate(${Math.atan2(tp.y - sp.y, tp.x - sp.x) * 180 / Math.PI}) translate(-22,0)`}
                animate={{ fill: color }}
              />
            )}
            {/* Weight label */}
            <rect x={mx - 13} y={my - 10} width="26" height="20"
              fill="var(--color-ink)" rx="0"
              style={{ pointerEvents: 'none' }}
            />
            <text x={mx} y={my + 4}
              textAnchor="middle"
              fill="var(--color-paper)"
              fontSize="10"
              fontFamily="var(--font-mono)"
              fontWeight="700"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {edge.weight}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const pos = getNodePos(node);
        const state = nodeStates[node.id] as NodeState | undefined;
        const isSelected = selectedNode === node.id || pendingEdgeSource === node.id;
        const fill = isSelected ? accentColor : nodeColor(state, accentColor);
        const textFill = state === 'visited' ? 'var(--color-paper)' : 'var(--color-ink)';
        const scale = nodeScale(state);

        return (
          <motion.g
            key={node.id}
            aria-label={`Node ${node.label}`}
            role="img"
            style={{ cursor: (draggable || onNodeClick) ? 'pointer' : 'default', touchAction: 'none' }}
            animate={{ scale }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={(e) => { e.stopPropagation(); onNodeClick?.(node.id); }}
            onPointerDown={(e) => onNodePointerDown(e, node.id)}
            onPointerMove={(e) => onNodePointerMove(e, node.id)}
            onPointerUp={(e) => onNodePointerUp(e, node.id)}
          >
            <motion.circle
              cx={pos.x} cy={pos.y} r={26}
              fill={fill}
              stroke="var(--color-ink)"
              strokeWidth={isSelected ? 4 : 3}
              filter={state === 'current' ? 'url(#glow)' : undefined}
              animate={{ fill, r: state === 'current' ? 30 : 26 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            />
            {/* Pulse ring for frontier */}
            <AnimatePresence>
              {state === 'frontier' && (
                <motion.circle
                  cx={pos.x} cy={pos.y} r={26}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth={2}
                  initial={{ r: 26, opacity: 0.8 }}
                  animate={{ r: 46, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
            </AnimatePresence>
            <text
              x={pos.x} y={pos.y - 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={textFill}
              fontSize="12"
              fontFamily="var(--font-mono)"
              fontWeight="700"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {node.label.length <= 2 ? node.label : node.id}
            </text>
            <text
              x={pos.x} y={pos.y + 10}
              textAnchor="middle"
              fill={textFill}
              fontSize="7"
              fontFamily="var(--font-mono)"
              style={{ pointerEvents: 'none', userSelect: 'none', opacity: 0.7 }}
            >
              {node.label.length > 2 ? node.label.substring(0, 8) : ''}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
};
