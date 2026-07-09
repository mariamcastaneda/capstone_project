import React, { useRef, useState, useEffect } from 'react';
import { useApp, TOOLS } from '../../context/AppContext';

const CLAMP   = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const CANVAS_W = 4000;
const CANVAS_H = 3000;
const MIN_W    = 60;
const MIN_H    = 28;
const HS       = 8; // handle size px

// Six resize handles: four corners + right edge + bottom edge
const HANDLES = [
  { dir: 'nw', style: { top: -HS/2,    left:  -HS/2,       cursor: 'nw-resize' } },
  { dir: 'ne', style: { top: -HS/2,    right: -HS/2,       cursor: 'ne-resize' } },
  { dir: 'se', style: { bottom: -HS/2, right: -HS/2,       cursor: 'se-resize' } },
  { dir: 'sw', style: { bottom: -HS/2, left:  -HS/2,       cursor: 'sw-resize' } },
  { dir: 'e',  style: { top: '50%',    right: -HS/2, transform: 'translateY(-50%)', cursor: 'e-resize' } },
  { dir: 's',  style: { bottom: -HS/2, left: '50%',  transform: 'translateX(-50%)', cursor: 's-resize' } },
];

export default function TextBoxElement({ element, onUpdate, onErase }) {
  const { zoom, activeTool, activeColor,
          fontFamily, setFontFamily,
          fontSize,   setFontSize,
          textBold,   setTextBold,
          textItalic, setTextItalic,
          textUnderline,       setTextUnderline,
          activeTextElementId, setActiveTextElementId } = useApp();

  const data = typeof element.data === 'string' ? JSON.parse(element.data) : element.data;

  const [localData, setLocalData] = useState(() => ({
    fontFamily: data.fontFamily ?? 'Arial',
    fontSize:   data.fontSize   ?? 16,
    color:      data.color      ?? '#222',
    bold:       data.bold       ?? false,
    italic:     data.italic     ?? false,
    underline:  data.underline  ?? false,
  }));

  const [pos, setPos]     = useState({ x: element.x,             y: element.y });
  const [size, setSize]   = useState({ w: element.width  ?? 220, h: element.height ?? 60 });
  const [dragging, setDragging] = useState(false);
  const divRef = useRef(null);

  // Always-current refs so async callbacks save the latest position and size
  const posRef  = useRef(pos);
  const sizeRef = useRef(size);
  useEffect(() => { posRef.current = pos; },   [pos]);
  useEffect(() => { sizeRef.current = size; }, [size]);

  const localDataRef = useRef(localData);
  useEffect(() => { localDataRef.current = localData; }, [localData]);

  const isActive = activeTextElementId === element.id;

  // Set initial HTML once on mount
  useEffect(() => {
    if (divRef.current) {
      divRef.current.innerHTML = data.content ?? '';
      if (!data.content) divRef.current.focus();
    }
  }, []); // eslint-disable-line

  // Live toolbar → localData when this element is active
  useEffect(() => {
    if (activeTextElementId !== element.id) return;
    setLocalData(prev => ({
      ...prev,
      fontFamily, fontSize, color: activeColor,
      bold: textBold, italic: textItalic, underline: textUnderline,
    }));
  }, [fontFamily, fontSize, activeColor, textBold, textItalic, textUnderline]); // eslint-disable-line

  const handleFocus = () => {
    setActiveTextElementId(element.id);
    setFontFamily(localData.fontFamily);
    setFontSize(localData.fontSize);
    setTextBold(localData.bold);
    setTextItalic(localData.italic);
    setTextUnderline(localData.underline);
  };

  // ── Central save: always uses refs so stale-closure is never an issue ─────
  const save = () => {
    const content = divRef.current?.innerHTML ?? '';
    onUpdate({
      data: JSON.stringify({ ...data, content, ...localDataRef.current }),
      x: posRef.current.x, y: posRef.current.y,
      width: sizeRef.current.w, height: sizeRef.current.h,
    });
  };

  const handleBlur = () => save();

  // ── Drag to reposition ────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    if (e.target === divRef.current || divRef.current?.contains(e.target)) return;
    if (e.target.dataset.rh) return; // let resize handles handle it
    e.preventDefault();
    setDragging(true);
    const sx = e.clientX, sy = e.clientY;
    const ox = posRef.current.x, oy = posRef.current.y;
    const onMove = (me) => setPos({
      x: CLAMP(ox + (me.clientX - sx) / zoom, 0, CANVAS_W - sizeRef.current.w),
      y: CLAMP(oy + (me.clientY - sy) / zoom, 0, CANVAS_H - sizeRef.current.h),
    });
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      setDragging(false);
      save();
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // ── Resize handles ────────────────────────────────────────────────────────
  const onResizeStart = (dir, e) => {
    e.stopPropagation();
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    const ow = sizeRef.current.w, oh = sizeRef.current.h;
    const ox = posRef.current.x,  oy = posRef.current.y;
    const onMove = (me) => {
      const dx = (me.clientX - sx) / zoom;
      const dy = (me.clientY - sy) / zoom;
      let nw = ow, nh = oh, nx = ox, ny = oy;
      if (dir.includes('e')) nw = Math.max(MIN_W, ow + dx);
      if (dir.includes('w')) { nw = Math.max(MIN_W, ow - dx); nx = ox + (ow - nw); }
      if (dir.includes('s')) nh = Math.max(MIN_H, oh + dy);
      if (dir.includes('n')) { nh = Math.max(MIN_H, oh - dy); ny = oy + (oh - nh); }
      setSize({ w: nw, h: nh });
      setPos({ x: nx, y: ny });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      save();
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div onMouseDown={onMouseDown}
      onClick={() => { if (activeTool === TOOLS.ERASER) onErase?.(); }}
      data-element="text"
      style={{
        position: 'absolute', left: pos.x, top: pos.y,
        width: size.w, height: size.h,
        border: activeTool === TOOLS.ERASER
          ? '2px solid #c0392b'
          : (isActive ? '1.5px solid var(--nb-pink-600)' : '1.5px dashed var(--nb-pink-400)'),
        borderRadius: 4,
        cursor: activeTool === TOOLS.ERASER ? 'not-allowed' : (dragging ? 'grabbing' : 'grab'),
        background: 'rgba(255,255,255,0.92)', boxSizing: 'border-box',
        pointerEvents: 'auto', opacity: activeTool === TOOLS.ERASER ? 0.7 : 1,
      }}>

      {/* Editable text area */}
      <div ref={divRef}
        contentEditable suppressContentEditableWarning
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          padding: '4px 6px', outline: 'none',
          width: '100%', height: '100%', boxSizing: 'border-box',
          fontFamily:     localData.fontFamily,
          fontSize:       `${localData.fontSize}px`,
          color:          localData.color,
          fontWeight:     localData.bold      ? 'bold'      : 'normal',
          fontStyle:      localData.italic    ? 'italic'    : 'normal',
          textDecoration: localData.underline ? 'underline' : 'none',
          cursor: 'text', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowY: 'auto',
        }}
      />

      {/* Resize handles — only shown when not in eraser mode */}
      {activeTool !== TOOLS.ERASER && HANDLES.map(({ dir, style }) => (
        <div key={dir}
          data-rh={dir}
          onMouseDown={e => onResizeStart(dir, e)}
          style={{
            position: 'absolute',
            width: HS, height: HS,
            background: isActive ? 'var(--nb-pink-400)' : 'var(--nb-pink-200)',
            border: '1.5px solid var(--nb-pink-600)',
            borderRadius: 2,
            opacity: isActive ? 1 : 0.5,
            zIndex: 5,
            ...style,
          }}
        />
      ))}
    </div>
  );
}
