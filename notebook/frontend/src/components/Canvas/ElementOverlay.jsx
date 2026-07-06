import React from 'react';

export default function ElementOverlay({ zoom, panX, panY, children }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: 4000, height: 3000,
      transformOrigin: '0 0',
      transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
      pointerEvents: 'none',
    }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
