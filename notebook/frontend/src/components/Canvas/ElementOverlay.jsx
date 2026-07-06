import React from 'react';

export default function ElementOverlay({ zoom, panX, panY, children }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: 4000, height: 3000,
      transformOrigin: '0 0',
      transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
      pointerEvents: 'none',   // outer: let drawing canvas receive events
    }}>
      {/* No inner wrapper — children render directly with their own pointerEvents */}
      {children}
    </div>
  );
}
