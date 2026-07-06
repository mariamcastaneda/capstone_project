import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const SHAPES = ['rounded', 'rect', 'circle', 'diamond'];
const SHAPE_LABELS = { rounded: '▢', rect: '□', circle: '○', diamond: '◇' };

export default function MindMapToolbar({ onShapeChange, onColorChange, onAutoLayout, onExportPng }) {
  const { activeColor } = useApp();
  const [activeShape, setActiveShape] = useState('rounded');

  const handleShape = (shape) => {
    setActiveShape(shape);
    onShapeChange?.(shape);
  };

  return (
    <div style={{
      position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--nb-pink-100)', border: '1.5px solid var(--nb-pink-400)',
      borderRadius: 10, padding: '6px 12px', display: 'flex', alignItems: 'center',
      gap: 8, zIndex: 20, boxShadow: '0 2px 8px rgba(233,30,140,0.15)',
    }}>
      <span style={{ fontSize: '0.7rem', color: 'var(--nb-pink-900)', fontWeight: 600 }}>Shape:</span>
      {SHAPES.map(s => (
        <button key={s}
          onClick={() => handleShape(s)}
          title={s}
          style={{
            width: 28, height: 28, border: activeShape === s ? '2px solid var(--nb-pink-600)' : '1.5px solid var(--nb-pink-300)',
            borderRadius: s === 'circle' ? '50%' : s === 'diamond' ? 0 : 4,
            transform: s === 'diamond' ? 'rotate(45deg)' : 'none',
            background: activeShape === s ? 'var(--nb-pink-400)' : 'white',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
            color: activeShape === s ? '#fff' : 'var(--nb-pink-900)',
          }}>
          <span style={{ display: 'inline-block', transform: s === 'diamond' ? 'rotate(-45deg)' : 'none', fontSize: '0.75rem' }}>
            {SHAPE_LABELS[s]}
          </span>
        </button>
      ))}

      <div style={{ width: 1, height: 24, background: 'var(--nb-pink-300)' }} />

      <button onClick={() => onAutoLayout?.('radial')}
        style={{ background: 'var(--nb-pink-200)', border: 'none', borderRadius: 6,
          padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>
        ◉ Radial
      </button>
      <button onClick={() => onAutoLayout?.('hierarchical')}
        style={{ background: 'var(--nb-pink-200)', border: 'none', borderRadius: 6,
          padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>
        🌿 Tree
      </button>

      <div style={{ width: 1, height: 24, background: 'var(--nb-pink-300)' }} />

      <button onClick={onExportPng}
        style={{ background: 'var(--nb-pink-400)', color: '#fff', border: 'none',
          borderRadius: 6, padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>
        ⬇ PNG
      </button>
    </div>
  );
}
