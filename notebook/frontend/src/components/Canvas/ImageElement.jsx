import React, { useState } from 'react';
import { useApp, TOOLS } from '../../context/AppContext';
import { getImageUrl } from '../../services/imageApi';

export default function ImageElement({ element, onUpdate, onDelete, onErase }) {
  const { activeTool } = useApp();
  const data = typeof element.data === 'string' ? JSON.parse(element.data) : element.data;
  const [pos, setPos]    = useState({ x: element.x, y: element.y });
  const [size, setSize]  = useState({ w: element.width ?? 200, h: element.height ?? 150 });
  const src = data.stickerSrc ?? getImageUrl(data.fileName);
  const isErasing = activeTool === TOOLS.ERASER;

  const onKeyDown = (e) => { if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); onDelete(); } };

  return (
    <div tabIndex={0} onKeyDown={onKeyDown}
      onClick={() => { if (isErasing) onErase?.(); }}
      style={{ position: 'absolute', left: pos.x, top: pos.y, width: size.w, height: size.h,
        outline: 'none', cursor: isErasing ? 'not-allowed' : 'move',
        userSelect: 'none', pointerEvents: 'auto',
        opacity: isErasing ? 0.6 : 1,
        border: isErasing ? '2px solid #c0392b' : 'none', borderRadius: 4 }}>
      <img src={src} alt={data.originalName ?? 'image'}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', borderRadius: 4 }}
        draggable={false} />
    </div>
  );
}
