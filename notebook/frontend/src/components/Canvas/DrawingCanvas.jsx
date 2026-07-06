import React, { useRef, useEffect, useState } from 'react';
import { useApp, TOOLS } from '../../context/AppContext';
import useCanvas from '../../hooks/useCanvas';

const CANVAS_W = 4000;
const CANVAS_H = 3000;

export default function DrawingCanvas({ zoom, panX, panY, onPanStart, onStrokeComplete }) {
  const canvasRef = useRef(null);
  const { activeTool, activeColor, strokeWidth, eraserMode } = useApp();

  const { onPointerDown, onPointerMove, onPointerUp } = useCanvas({
    canvasRef,
    color: activeColor,
    strokeWidth,
    tool: activeTool,
    eraserMode,
    onStrokeComplete,
  });

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
}
