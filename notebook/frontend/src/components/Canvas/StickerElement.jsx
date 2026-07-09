import React, { useState } from 'react';
import { useApp, TOOLS } from '../../context/AppContext';

export default function StickerElement({ element, onUpdate, onDelete, onErase }) {
  const { activeTool } = useApp();
  const data = typeof element.data === 'string' ? JSON.parse(element.data) : element.data;
  const [pos, setPos]   = useState({ x: element.x, y: element.y });
  const [size, setSize] = useState({ w: element.width ?? 80, h: element.height ?? 80 });
  const isErasing = activeTool === TOOLS.ERASER;

  const onKeyDown = (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); onDelete(); }
  };

  const svgDataUrl = data.stickerSvg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.stickerSvg)}`
    : null;

  return (
    <div tabIndex={0} onKeyDown={onKeyDown}
      onClick={() => { if (isErasing) onErase?.(); }}
      style={{ position: 'absolute', left: pos.x, top: pos.y,
        width: size.w, height: size.h,
        outline: 'none', cursor: isErasing ? 'not-allowed' : 'move',
        userSelect: 'none', pointerEvents: 'auto',
        opacity: isErasing ? 0.6 : 1,
        border: isErasing ? '2px solid #c0392b' : 'none', borderRadius: 4 }}>
      {svgDataUrl
        ? <img src={svgDataUrl} alt={data.stickerName ?? 'sticker'}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none' }} />
        : <div dangerouslySetInnerHTML={{ __html: data.stickerSvg ?? '' }}
            style={{ width: '100%', height: '100%' }} />
      }
    </div>
  );
}
