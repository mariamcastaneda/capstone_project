import React, { useRef, useState } from 'react';

const CLAMP = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const CANVAS_W = 4000;
const CANVAS_H = 3000;

export default function TextBoxElement({ element, onUpdate }) {
  const data = typeof element.data === 'string' ? JSON.parse(element.data) : element.data;
  const [pos, setPos]           = useState({ x: element.x, y: element.y });
  const [size, setSize]         = useState({ w: element.width ?? 200, h: element.height ?? 60 });
  const [dragging, setDragging] = useState(false);
  const dragStart               = useRef(null);
  const divRef                  = useRef(null);

  const onMouseDown = (e) => {
    if (e.target === divRef.current) return; // let contentEditable handle it
    e.preventDefault();
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y };
    const onMove = (me) => {
      const nx = CLAMP(dragStart.current.ox + (me.clientX - dragStart.current.mx), 0, CANVAS_W - size.w);
      const ny = CLAMP(dragStart.current.oy + (me.clientY - dragStart.current.my), 0, CANVAS_H - size.h);
      setPos({ x: nx, y: ny });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      setDragging(false);
      onUpdate({ x: pos.x, y: pos.y });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleBlur = () => {
    const content = divRef.current?.innerHTML ?? '';
    onUpdate({ data: JSON.stringify({ ...data, content }), x: pos.x, y: pos.y, width: size.w, height: size.h });
  };

  return (
    <div onMouseDown={onMouseDown}
      style={{ position: 'absolute', left: pos.x, top: pos.y, width: size.w, minHeight: size.h,
        border: '1.5px dashed var(--nb-pink-400)', borderRadius: 4, cursor: dragging ? 'grabbing' : 'grab',
        background: 'rgba(255,255,255,0.85)', boxSizing: 'border-box' }}>
      <div ref={divRef}
        contentEditable suppressContentEditableWarning
        onBlur={handleBlur}
        style={{ padding: '4px 6px', outline: 'none', minHeight: size.h - 8,
          fontFamily: data.fontFamily ?? 'Arial', fontSize: `${data.fontSize ?? 16}px`,
          color: data.color ?? '#222', fontWeight: data.bold ? 'bold' : 'normal',
          fontStyle: data.italic ? 'italic' : 'normal',
          textDecoration: data.underline ? 'underline' : 'none',
          cursor: 'text', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        dangerouslySetInnerHTML={{ __html: data.content ?? '' }}
      />
    </div>
  );
}
