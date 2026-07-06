import React, { useState } from 'react';
import { getImageUrl } from '../../services/imageApi';

export default function ImageElement({ element, onUpdate, onDelete }) {
  const data = typeof element.data === 'string' ? JSON.parse(element.data) : element.data;
  const [pos, setPos]    = useState({ x: element.x, y: element.y });
  const [size, setSize]  = useState({ w: element.width ?? 200, h: element.height ?? 150 });
  const src = data.stickerSrc ?? getImageUrl(data.fileName);

  const onKeyDown = (e) => { if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); onDelete(); } };

  return (
    <div tabIndex={0} onKeyDown={onKeyDown}
      style={{ position: 'absolute', left: pos.x, top: pos.y, width: size.w, height: size.h,
        outline: 'none', cursor: 'move', userSelect: 'none', pointerEvents: 'auto' }}>
      <img src={src} alt={data.originalName ?? 'image'}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block',
          border: '1.5px dashed transparent', borderRadius: 4 }}
        draggable={false} />
    </div>
  );
}
