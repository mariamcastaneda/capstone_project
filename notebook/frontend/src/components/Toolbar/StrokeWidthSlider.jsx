import React from 'react';
import { useApp } from '../../context/AppContext';

export default function StrokeWidthSlider() {
  const { strokeWidth, setStrokeWidth, activeColor } = useApp();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r={Math.min(strokeWidth * 1.5, 12)}
          fill={activeColor || '#222'} />
      </svg>
      <input type="range" min="1" max="20" value={strokeWidth}
        onChange={e => setStrokeWidth(Number(e.target.value))}
        style={{ writingMode: 'vertical-lr', direction: 'rtl', height: 60,
          accentColor: 'var(--nb-pink-400)' }}
        title={`Stroke width: ${strokeWidth}px`} />
    </div>
  );
}
