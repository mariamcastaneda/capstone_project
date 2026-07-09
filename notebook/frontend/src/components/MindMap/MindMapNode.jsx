import React, { useState, useRef, useEffect } from 'react';
import { useApp, TOOLS } from '../../context/AppContext';

export default function MindMapNode({
  node, onMove, onAddChild, onRemove, onSelect, onLabelChange,
  isSelected, zoom = 1, panX = 0, panY = 0, isEditing = true,
}) {
  const { activeTool } = useApp();
  const { id, label, shape, fillColor, borderColor, textColor, x, y } = node;
  const isErasing   = activeTool === TOOLS.ERASER;
  const [editingText, setEditingText] = useState(false);
  const [editValue,  setEditValue]    = useState(label);
  const inputRef = useRef(null);
  const W = 120, H = 44;

  // Sync local value when label changes externally
  useEffect(() => { if (!editingText) setEditValue(label); }, [label, editingText]);

  // Focus & select all when entering edit mode
  useEffect(() => {
    if (editingText) { inputRef.current?.focus(); inputRef.current?.select(); }
  }, [editingText]);

  // ── Drag (grab anywhere on the node box while not editing text) ──────────
  const onMouseDown = (e) => {
    if (!isEditing || isErasing || editingText) return;
    if (e.detail > 1) return; // ignore double-click start
    e.stopPropagation();
    const sx = (e.clientX - panX) / zoom - x;
    const sy = (e.clientY - panY) / zoom - y;
    const onMv = (me) => onMove(id, (me.clientX - panX) / zoom - sx, (me.clientY - panY) / zoom - sy);
    const onUp = () => { window.removeEventListener('mousemove', onMv); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMv);
    window.addEventListener('mouseup', onUp);
  };

  // ── Single click: select (or erase) ──────────────────────────────────────
  const handleClick = (e) => {
    e.stopPropagation();
    if (isErasing) { onRemove(id); return; }
    if (isEditing) onSelect?.(id);
  };

  // ── Double-click: enter text edit mode ───────────────────────────────────
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!isEditing || isErasing) return;
    setEditingText(true);
  };

  // ── Commit text edit ──────────────────────────────────────────────────────
  const commitEdit = () => {
    setEditingText(false);
    const v = editValue.trim() || label;
    setEditValue(v);
    if (v !== label) onLabelChange?.(id, v);
  };

  const handleInputKey = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') { setEditingText(false); setEditValue(label); }
  };

  // ── Border style ──────────────────────────────────────────────────────────
  const borderStyle = isErasing
    ? '2.5px solid #c0392b'
    : isSelected
      ? '2.5px solid #333'
      : `2px solid ${borderColor}`;

  return (
    <div
      style={{ position: 'absolute', left: x - W / 2, top: y - H / 2, width: W, pointerEvents: 'auto' }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Node shape */}
      <div
        onMouseDown={onMouseDown}
        style={{
          background: fillColor,
          border: borderStyle,
          borderRadius: shape === 'circle' ? '50%' : shape === 'rounded' ? 10 : shape === 'diamond' ? 0 : 4,
          transform: shape === 'diamond' ? 'rotate(45deg)' : 'none',
          width: W, height: H,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isErasing ? 'not-allowed' : isEditing ? (editingText ? 'text' : 'grab') : 'default',
          userSelect: 'none', boxSizing: 'border-box',
          opacity: isErasing ? 0.65 : 1,
          boxShadow: isSelected && !isErasing ? '0 0 0 3px rgba(0,0,0,0.2)' : 'none',
          transition: 'box-shadow 0.1s',
        }}
      >
        {editingText ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleInputKey}
            onClick={e => e.stopPropagation()}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              textAlign: 'center', width: W - 16, fontSize: 12, fontWeight: 600,
              color: textColor, cursor: 'text',
              transform: shape === 'diamond' ? 'rotate(-45deg)' : 'none',
            }}
          />
        ) : (
          <span style={{
            color: textColor, fontSize: 12, fontWeight: 600, pointerEvents: 'none',
            transform: shape === 'diamond' ? 'rotate(-45deg)' : 'none',
            maxWidth: W - 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {label}
          </span>
        )}
      </div>

      {/* Editing controls: child (+) and remove (×) buttons */}
      {isEditing && !isErasing && (
        <>
          <button
            onClick={e => { e.stopPropagation(); onAddChild(id); }}
            style={{ position: 'absolute', right: -16, top: '50%', transform: 'translateY(-50%)',
              width: 18, height: 18, borderRadius: '50%', background: '#FF69B4', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1, pointerEvents: 'auto', zIndex: 1 }}
            title="Add child node">+</button>
          <button
            onClick={e => { e.stopPropagation(); onRemove(id); }}
            style={{ position: 'absolute', right: -16, top: -10,
              width: 16, height: 16, borderRadius: '50%', background: '#c0392b', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: 11, lineHeight: 1, pointerEvents: 'auto', zIndex: 1 }}
            title="Remove node">×</button>
        </>
      )}
    </div>
  );
}
