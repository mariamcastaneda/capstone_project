import React, { useEffect, useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useApp, TOOLS } from '../../context/AppContext';
import * as elementApi from '../../services/elementApi';
import * as imageApi from '../../services/imageApi';
import DrawingCanvas from './DrawingCanvas';
import ElementOverlay from './ElementOverlay';
import TextBoxElement from './TextBoxElement';
import ImageElement from './ImageElement';
import StickerElement from './StickerElement';
import MindMapCanvas from '../MindMap/MindMapCanvas';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;

export default forwardRef(function CanvasPage(props, ref) {
  useImperativeHandle(ref, () => ({ handleImagePick, handleStickerPlace }));
  const { activePageId, activeTool, zoom, setZoom, setSaveStatus,
          activeColor, fontFamily, fontSize, textBold, textItalic, textUnderline,
          setActiveTextElementId } = useApp();
  const [elements, setElements]     = useState([]);
  const [panX, setPanX]             = useState(0);
  const [panY, setPanY]             = useState(0);
  const wrapperRef   = useRef(null);
  const panStartRef  = useRef(null);
  const drawingRef   = useRef(null);   // imperative ref to DrawingCanvas
  const mindMapRef   = useRef(null);   // imperative ref to MindMapCanvas

  useEffect(() => {
    if (!activePageId) { setElements([]); return; }
    elementApi.getElements(activePageId).then(setElements).catch(console.error);
  }, [activePageId]);

  const handleStrokeComplete = useCallback(async (stroke) => {
    if (!activePageId) return;
    setSaveStatus('saving');
    try {
      const el = await elementApi.createElement(activePageId, {
        elementType: 'stroke',
        data: JSON.stringify({ tool: stroke.tool, color: stroke.color, width: stroke.width, points: stroke.points }),
        x: 0, y: 0,
      });
      setElements(prev => [...prev, el]);
      setSaveStatus('saved');
    } catch (e) {
      console.error('Failed to save stroke', e);
      setSaveStatus('error');
    }
  }, [activePageId, setSaveStatus]);

  // When a stroke is erased on the canvas, delete it from the DB + state so it never comes back
  const handleStrokeErased = useCallback((elementId) => {
    if (!elementId) return;
    elementApi.deleteElement(elementId).catch(console.error);
    setElements(prev => prev.filter(e => e.id !== elementId));
  }, []);
  const onDragOver = useCallback((e) => { e.preventDefault(); }, []);

  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    if (!activePageId) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      const rect = wrapperRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - panX) / zoom;
      const y = (e.clientY - rect.top  - panY) / zoom;
      const { fileName } = await imageApi.uploadImage(file);
      const el = await elementApi.createElement(activePageId, {
        elementType: 'image',
        data: JSON.stringify({ fileName, originalName: file.name, mimeType: file.type }),
        x, y, width: 200, height: 150,
      });
      setElements(prev => [...prev, el]);
    } catch (err) { console.error('Image drop failed:', err.message); }
  }, [activePageId, panX, panY, zoom]);

  // Image file-picker handler (called from Toolbar)
  const handleImagePick = useCallback(async (file) => {
    if (!activePageId) return;
    try {
      const { fileName } = await imageApi.uploadImage(file);
      const el = await elementApi.createElement(activePageId, {
        elementType: 'image',
        data: JSON.stringify({ fileName, originalName: file.name, mimeType: file.type }),
        x: 100, y: 100, width: 200, height: 150,
      });
      setElements(prev => [...prev, el]);
    } catch (err) { console.error('Image upload failed:', err.message); }
  }, [activePageId]);

  // Sticker placement handler (called from Toolbar sticker panel)
  const handleStickerPlace = useCallback(async (sticker) => {
    if (!activePageId) return;
    const el = await elementApi.createElement(activePageId, {
      elementType: 'sticker',
      data: JSON.stringify({ stickerName: sticker.name, stickerSvg: sticker.svg }),
      x: 200, y: 200, width: 80, height: 80,
    });
    setElements(prev => [...prev, el]);
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

  // Single-click → insert text box (Text tool only); clicking canvas background clears active text element
  const onClick = useCallback(async (e) => {
    // Clicking the canvas background deactivates any active text element
    if (e.target === wrapperRef.current) setActiveTextElementId(null);

    if (activeTool !== TOOLS.TEXT || !activePageId) return;
    if (e.target !== wrapperRef.current && e.target.closest('[data-element]')) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = Math.max(0, (e.clientX - rect.left - panX) / zoom);
    const y = Math.max(0, (e.clientY - rect.top  - panY) / zoom);
    try {
      const el = await elementApi.createElement(activePageId, {
        elementType: 'text',
        data: JSON.stringify({
          content: '',
          fontFamily,
          fontSize,
          color: activeColor,
          bold: textBold,
          italic: textItalic,
          underline: textUnderline,
        }),
        x, y, width: 220, height: 40,
      });
      setElements(prev => [...prev, el]);
    } catch (err) { console.error('Failed to create text box', err); }
  }, [activeTool, activePageId, panX, panY, zoom,
      fontFamily, fontSize, activeColor, textBold, textItalic, textUnderline,
      setActiveTextElementId]);

  // ── Derived data — ALL hooks must be called before any conditional return ──
  const strokes    = elements.filter(e => e.elementType === 'stroke');
  const textEls    = elements.filter(e => e.elementType === 'text');
  const imageEls   = elements.filter(e => e.elementType === 'image');
  const stickerEls = elements.filter(e => e.elementType === 'sticker');
  const mindmapEl  = elements.find(e => e.elementType === 'mindmap');

  // Stable memoized stroke list keyed on IDs — only recomputes when stroke set changes in DB/state.
  // Includes _elementId so useCanvas can report which DB record to delete when erasing.
  const strokeElIds = strokes.map(e => e.id).join(',');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const parsedStrokes = useMemo(() =>
    strokes.map(el => { try { return { ...JSON.parse(el.data), _elementId: el.id }; } catch { return null; } }).filter(Boolean),
    [strokeElIds] // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!activePageId) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1"
        style={{ background: 'var(--nb-pink-50)', color: 'var(--nb-pink-600)' }}>
        <div style={{ fontSize: '3rem' }}>📓</div>
        <p className="mt-2">Select or create a notebook to get started</p>
      </div>
    );
  }

  return (
    <div ref={wrapperRef}
      className={`nb-canvas-wrapper flex-grow-1 tool-${activeTool}`}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      onWheel={onWheel} onClick={onClick}
      onDragOver={onDragOver} onDrop={onDrop}
      data-on-image-pick={handleImagePick}
      data-on-sticker-place={handleStickerPlace}
      style={{ position: 'relative', overflow: 'hidden' }}>

      <DrawingCanvas ref={drawingRef} zoom={zoom} panX={panX} panY={panY}
        onStrokeComplete={handleStrokeComplete}
        onStrokeErased={handleStrokeErased}
        initialStrokes={parsedStrokes} />

      <ElementOverlay zoom={zoom} panX={panX} panY={panY}>
        {textEls.map(el => (
          <TextBoxElement key={el.id} element={el}
            onUpdate={async (patch) => {
              try {
                const updated = await elementApi.updateElement(el.id, patch);
                // Refresh local state so element.data prop stays current
                // (prevents stale font/size being re-applied on next focus)
                setElements(prev => prev.map(e => e.id === el.id ? updated : e));
              } catch (err) { console.error('Failed to update text element', err); }
            }}
            onErase={() => { elementApi.deleteElement(el.id); setElements(prev => prev.filter(e => e.id !== el.id)); }} />
        ))}
        {imageEls.map(el => (
          <ImageElement key={el.id} element={el}
            onUpdate={patch => elementApi.updateElement(el.id, patch)}
            onDelete={() => { elementApi.deleteElement(el.id); setElements(prev => prev.filter(e => e.id !== el.id)); }}
            onErase={() => { elementApi.deleteElement(el.id); setElements(prev => prev.filter(e => e.id !== el.id)); }} />
        ))}
        {stickerEls.map(el => (
          <StickerElement key={el.id} element={el}
            onUpdate={patch => elementApi.updateElement(el.id, patch)}
            onDelete={() => { elementApi.deleteElement(el.id); setElements(prev => prev.filter(e => e.id !== el.id)); }}
            onErase={() => { elementApi.deleteElement(el.id); setElements(prev => prev.filter(e => e.id !== el.id)); }} />
        ))}
      </ElementOverlay>

      {/* Mind map: always render if data exists; key=activePageId resets state on page switch */}
      {(mindmapEl || activeTool === TOOLS.MINDMAP) && (
        <MindMapCanvas key={activePageId} ref={mindMapRef} zoom={zoom} panX={panX} panY={panY}
          pageId={activePageId} existingElement={mindmapEl}
          isEditing={activeTool === TOOLS.MINDMAP}
          onSave={(el) => setElements(prev => [...prev.filter(e => e.id !== el.id), el])}
          onDelete={() => {
            if (!mindmapEl) return;
            elementApi.deleteElement(mindmapEl.id).catch(console.error);
            setElements(prev => prev.filter(e => e.id !== mindmapEl.id));
          }} />
      )}
    </div>
  );
});
