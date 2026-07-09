import { useRef, useCallback, useEffect } from 'react';

const CANVAS_W = 4000;
const CANVAS_H = 3000;

/**
 * Core drawing hook for the HTML5 canvas.
 * Manages strokes, eraser (stroke-level + pixel-level), RAF redraw, and pan/zoom.
 */
export default function useCanvas({ canvasRef, color, strokeWidth, tool, eraserMode, onStrokeComplete, onStrokeErased }) {
  const strokesRef   = useRef([]); // [{ tool, color, width, points: [[x,y]...] }]
  const currentRef   = useRef(null);
  const isDrawingRef = useRef(false);
  const rafRef       = useRef(null);

  // ── Redraw ─────────────────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    for (const stroke of strokesRef.current) {
      if (!stroke.points.length) continue;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth   = stroke.width;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.globalAlpha = stroke.tool === 'pencil' ? 0.75 : 1;
      ctx.moveTo(stroke.points[0][0], stroke.points[0][1]);
      for (let i = 1; i < stroke.points.length; i++) ctx.lineTo(stroke.points[i][0], stroke.points[i][1]);
      ctx.stroke();
    }

    if (currentRef.current?.points.length) {
      const s = currentRef.current;
      ctx.beginPath();
      ctx.strokeStyle = s.color;
      ctx.lineWidth   = s.width;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.globalAlpha = s.tool === 'pencil' ? 0.75 : 1;
      ctx.moveTo(s.points[0][0], s.points[0][1]);
      for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i][0], s.points[i][1]);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, [canvasRef]);

  const scheduleRedraw = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(redraw);
  }, [redraw]);

  // ── Pointer helpers ────────────────────────────────────────────────────────
  const getCanvasPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return [
      Math.min(CANVAS_W, Math.max(0, (e.clientX - rect.left) * scaleX)),
      Math.min(CANVAS_H, Math.max(0, (e.clientY - rect.top) * scaleY)),
    ];
  }, [canvasRef]);

  // ── Stroke eraser ──────────────────────────────────────────────────────────
  const eraseAtPoint = useCallback(([px, py]) => {
    const RADIUS = strokeWidth * 5;
    if (eraserMode === 'stroke') {
      // Collect DB element IDs of strokes that will be removed
      const erasedIds = strokesRef.current
        .filter(s => s.points.some(([x, y]) => Math.hypot(x - px, y - py) < RADIUS))
        .map(s => s._elementId)
        .filter(Boolean);

      strokesRef.current = strokesRef.current.filter(s =>
        !s.points.some(([x, y]) => Math.hypot(x - px, y - py) < RADIUS));

      erasedIds.forEach(id => onStrokeErased?.(id));
    } else {
      // pixel-level: trim points from each stroke within radius
      strokesRef.current = strokesRef.current.map(s => ({
        ...s, points: s.points.filter(([x, y]) => Math.hypot(x - px, y - py) >= RADIUS),
      }));
      // If any stroke is now empty, report its ID as erased
      const fullyErased = strokesRef.current.filter(s => !s.points.length);
      fullyErased.forEach(s => s._elementId && onStrokeErased?.(s._elementId));
      strokesRef.current = strokesRef.current.filter(s => s.points.length > 1);
    }
    scheduleRedraw();
  }, [eraserMode, strokeWidth, scheduleRedraw, onStrokeErased]);

  // ── Event handlers ─────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e) => {
    if (tool !== 'pen' && tool !== 'pencil' && tool !== 'eraser') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pt = getCanvasPoint(e);
    if (tool === 'eraser') { eraseAtPoint(pt); return; }
    currentRef.current = { tool, color, width: strokeWidth, points: [pt] };
  }, [tool, color, strokeWidth, getCanvasPoint, eraseAtPoint]);

  const onPointerMove = useCallback((e) => {
    if (!isDrawingRef.current) return;
    const pt = getCanvasPoint(e);
    if (tool === 'eraser') { eraseAtPoint(pt); return; }
    if (currentRef.current) { currentRef.current.points.push(pt); scheduleRedraw(); }
  }, [tool, getCanvasPoint, eraseAtPoint, scheduleRedraw]);

  const onPointerUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentRef.current?.points.length > 1) {
      const stroke = currentRef.current;
      strokesRef.current = [...strokesRef.current, stroke];
      currentRef.current = null;
      scheduleRedraw();
      onStrokeComplete?.(stroke);
    } else {
      currentRef.current = null;
    }
  }, [scheduleRedraw, onStrokeComplete]);

  // ── Load strokes from persisted data ──────────────────────────────────────
  const loadStrokes = useCallback((strokes) => {
    strokesRef.current = strokes;
    scheduleRedraw();
  }, [scheduleRedraw]);

  const clearStrokes = useCallback(() => {
    strokesRef.current = [];
    currentRef.current = null;
    scheduleRedraw();
  }, [scheduleRedraw]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return { onPointerDown, onPointerMove, onPointerUp, loadStrokes, clearStrokes, scheduleRedraw };
}
