import { useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';

export function useGraphDrag() {
  const updateNodePosition = useStore(s => s.updateNodePosition);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const getSVGCoords = useCallback((clientX: number, clientY: number): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: Math.round(clientX - rect.left),
      y: Math.round(clientY - rect.top),
    };
  }, []);

  const startDrag = useCallback((nodeId: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as Element;
    target.setPointerCapture(e.pointerId);

    const onMove = (me: PointerEvent) => {
      const { x, y } = getSVGCoords(me.clientX, me.clientY);
      updateNodePosition(nodeId, x, y);
    };

    const onUp = () => {
      target.removeEventListener('pointermove', onMove as EventListener);
      target.removeEventListener('pointerup', onUp);
    };

    target.addEventListener('pointermove', onMove as EventListener);
    target.addEventListener('pointerup', onUp);
  }, [getSVGCoords, updateNodePosition]);

  return { svgRef, startDrag, getSVGCoords };
}
