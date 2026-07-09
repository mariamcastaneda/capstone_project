import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useApp, TOOLS } from '../../context/AppContext';
import useCanvas from '../../hooks/useCanvas';

const CANVAS_W = 4000;
const CANVAS_H = 3000;

export default forwardRef(function DrawingCanvas({ zoom, panX, panY, onStrokeComplete, onStrokeErased, initialStrokes }, ref) {
  const canvasRef = useRef(null);
  const { activeTool, activeColor, strokeWidth, eraserMode } = useApp();

  const { onPointerDown, onPointerMove, onPointerUp, loadStrokes, clearStrokes } = useCanvas({
    canvasRef,
    color: activeColor,
    strokeWidth,
    tool: activeTool,
    eraserMode,
    onStrokeComplete,
    onStrokeErased,
  });

  // Expose loadStrokes/clearStrokes imperatively for CanvasPage to call
  useImperativeHandle(ref, () => ({ loadStrokes, clearStrokes }), [loadStrokes, clearStrokes]);

  // Reload strokes when the stable memoized list changes (page switch or DB state change)
  useEffect(() => {
    if (initialStrokes) loadStrokes(initialStrokes);
  }, [initialStrokes]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDrawTool = activeTool === TOOLS.PEN || activeTool === TOOLS.PENCIL || activeTool === TOOLS.ERASER;

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{
        position: 'absolute', top: 0, left: 0,
        transformOrigin: '0 0',
        transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        pointerEvents: isDrawTool ? 'auto' : 'none',
        touchAction: 'none',
        cursor: activeTool === TOOLS.ERASER ? 'cell' : 'crosshair',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
});
