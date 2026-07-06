import React from 'react';

const SHAPE_STYLE = { rounded: 'rounded-rect', rect: 'rect', circle: 'circle', diamond: 'polygon' };

export default function MindMapNode({ node, onMove, onAddChild, onRemove, zoom = 1, panX = 0, panY = 0 }) {
  const { id, label, shape, fillColor, borderColor, textColor, x, y } = node;

  const onMouseDown = (e) => {
    e.stopPropagation();
    // Convert initial viewport position to canvas space
    const startCanvasX = (e.clientX - panX) / zoom;
    const startCanvasY = (e.clientY - panY) / zoom;
    // Offset from node origin to where we grabbed
    const offsetX = startCanvasX - x;
    const offsetY = startCanvasY - y;

    const onMv = (me) => {
      const canvasX = (me.clientX - panX) / zoom - offsetX;
      const canvasY = (me.clientY - panY) / zoom - offsetY;
      onMove(id, canvasX, canvasY);
    };
    const onUp = () => { window.removeEventListener('mousemove', onMv); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMv);
    window.addEventListener('mouseup', onUp);
  };

  const W = 120, H = 44;

  return (
    <div style={{ position: 'absolute', left: x - W / 2, top: y - H / 2, width: W, pointerEvents: 'auto' }}>
      <div onMouseDown={onMouseDown}
        style={{ background: fillColor, border: `2px solid ${borderColor}`,
          borderRadius: shape === 'circle' ? '50%' : shape === 'rounded' ? 10 : shape === 'diamond' ? 0 : 4,
          transform: shape === 'diamond' ? 'rotate(45deg)' : 'none',
          width: W, height: H, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'grab', userSelect: 'none', boxSizing: 'border-box' }}>
        <span contentEditable suppressContentEditableWarning
          style={{ color: textColor, fontSize: 13, fontWeight: 600,
            transform: shape === 'diamond' ? 'rotate(-45deg)' : 'none',
            maxWidth: W - 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </div>
      <button onClick={() => onAddChild(id)}
        style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)',
          width: 18, height: 18, borderRadius: '50%', background: '#FF69B4', color: '#fff',
          border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1, pointerEvents: 'auto' }}
        title="Add child node">+</button>
      <button onClick={() => onRemove(id)}
        style={{ position: 'absolute', right: -14, top: -10,
          width: 16, height: 16, borderRadius: '50%', background: '#c0392b', color: '#fff',
          border: 'none', cursor: 'pointer', fontSize: 11, lineHeight: 1, pointerEvents: 'auto' }}
        title="Remove node">×</button>
    </div>
  );
}
