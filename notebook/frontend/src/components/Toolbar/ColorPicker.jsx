import React from 'react';
import { useApp } from '../../context/AppContext';

const PALETTE = [
  '#000000','#333333','#666666','#999999','#CCCCCC','#FFFFFF','#FF0000','#FF6600',
  '#FF9900','#FFCC00','#FFFF00','#99FF00','#00FF00','#00FF99','#00FFFF','#0099FF',
  '#0000FF','#6600FF','#9900FF','#FF00FF','#FF0099','#FF69B4','#E91E8C','#7B0040',
  '#8B4513','#A0522D','#D2691E','#F4A460','#FFDEAD','#FFE4B5','#FFF8DC','#F5F5F5',
];

export default function ColorPicker() {
  const { activeColor, setActiveColor } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ width: 28, height: 28, borderRadius: 6,
        background: activeColor, border: '2px solid var(--nb-pink-600)',
        cursor: 'pointer', position: 'relative' }}>
        <input type="color" value={activeColor}
          onChange={e => setActiveColor(e.target.value)}
          style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
          title="Custom color" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 12px)', gap: 2 }}>
        {PALETTE.map(c => (
          <button key={c} title={c}
            onClick={() => setActiveColor(c)}
            style={{ width: 12, height: 12, background: c, border: activeColor === c ? '1.5px solid #333' : '1px solid rgba(0,0,0,0.15)', borderRadius: 2, cursor: 'pointer', padding: 0 }} />
        ))}
      </div>
    </div>
  );
}
