import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp, TOOLS } from '../../context/AppContext';
import * as elementApi from '../../services/elementApi';
import DrawingCanvas from './DrawingCanvas';
import ElementOverlay from './ElementOverlay';
import TextBoxElement from './TextBoxElement';
import ImageElement from './ImageElement';
import MindMapCanvas from '../MindMap/MindMapCanvas';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;

export default function CanvasPage() {
  const { activePageId, activeTool } = useApp();
  const [elements, setElements]     = useState([]);
  const [zoom, setZoom]             = useState(1);
  const [panX, setPanX]             = useState(0);
  const [panY, setPanY]             = useState(0);
  const wrapperRef  = useRef(null);
  const panStartRef = useRef(null);

  useEffect(() => {
    if (!activePageId) { setElements([]); return; }
    elementApi.getElements(activePageId).then(setElements).catch(console.error);
  }, [activePageId]);

  const handleStrokeComplete = useCallback(async (stroke) => {
    if (!activePageId) return;
    try {
      const el = await elementApi.createElement(activePageId, {
        elementType: 'stroke',
        data: JSON.stringify({ tool: stroke.tool, color: stroke.color, width: stroke.width, points: stroke.points }),
        x: 0, y: 0,
      });
      setElements(prev => [...prev, el]);
    } catch (e) { console.error('Failed to save stroke', e); }
  }, [activePageId]);

  // Pan with Space+drag
  const onPointerDown = useCallback((e) => {
    if (e.target !== wrapperRef.current && !e.target.classList.contains('nb-canvas-bg')) return;
    if (activeTool === TOOLS.SELECT || e.buttons === 4 || e.spaceHeld) {
      panStartRef.current = { x: e.clientX - panX, y: e.clientY - panY };
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }, [activeTool, panX, panY]);

  const onPointerMove = useCallback((e) => {
    if (!panStartRef.current) return;
    setPanX(e.clientX - panStartRef.current.x);
    setPanY(e.clientY - panStartRef.current.y);
  }, []);

  const onPointerUp = useCallback(() => { panStartRef.current = null; }, []);

  const onWheel = useCallback((e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.001)));
    }
  }, []);

  // Double-click → text box
  const onDoubleClick = useCallback(async (e) => {
    if (activeTool !== TOOLS.TEXT || !activePageId) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top  - panY) / zoom;
    const el = await elementApi.createElement(activePageId, {
      elementType: 'text', data: JSON.stringify({ content: '', fontFamily: 'Arial', fontSize: 16, color: '#222', bold: false, italic: false }),
      x, y, width: 200, height: 60,
    });
    setElements(prev => [...prev, el]);
  }, [activeTool, activePageId, panX, panY, zoom]);

  if (!activePageId) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1"
        style={{ background: 'var(--nb-pink-50)', color: 'var(--nb-pink-600)' }}>
        <div style={{ fontSize: '3rem' }}>📓</div>
        <p className="mt-2">Select or create a notebook to get started</p>
      </div>
    );
  }

  const strokes     = elements.filter(e => e.elementType === 'stroke');
  const textEls     = elements.filter(e => e.elementType === 'text');
  const imageEls    = elements.filter(e => e.elementType === 'image' || e.elementType === 'sticker');
  const mindmapEl   = elements.find(e => e.elementType === 'mindmap');

  return (
    <div ref={wrapperRef} className="nb-canvas-wrapper flex-grow-1"
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      onWheel={onWheel} onDoubleClick={onDoubleClick}
      style={{ position: 'relative', overflow: 'hidden' }}>

      <DrawingCanvas zoom={zoom} panX={panX} panY={panY} onStrokeComplete={handleStrokeComplete} />

      <ElementOverlay zoom={zoom} panX={panX} panY={panY}>
        {textEls.map(el => (
          <TextBoxElement key={el.id} element={el}
            onUpdate={patch => elementApi.updateElement(el.id, patch)} />
        ))}
        {imageEls.map(el => (
          <ImageElement key={el.id} element={el}
            onUpdate={patch => elementApi.updateElement(el.id, patch)}
            onDelete={() => { elementApi.deleteElement(el.id); setElements(prev => prev.filter(e => e.id !== el.id)); }} />
        ))}
      </ElementOverlay>

      {activeTool === TOOLS.MINDMAP && (
        <MindMapCanvas zoom={zoom} panX={panX} panY={panY}
          pageId={activePageId} existingElement={mindmapEl}
          onSave={(el) => setElements(prev => [...prev.filter(e => e.id !== el.id), el])} />
      )}
    </div>
  );
}
