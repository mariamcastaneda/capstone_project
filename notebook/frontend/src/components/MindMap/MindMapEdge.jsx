import React from 'react';

export default function MindMapEdge({ edge, nodes }) {
  const from = nodes.find(n => n.id === edge.from);
  const to   = nodes.find(n => n.id === edge.to);
  if (!from || !to) return null;

  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const d  = `M ${from.x} ${from.y} Q ${mx} ${from.y} ${to.x} ${to.y}`;

  return (
    <g>
      <path d={d} fill="none" stroke="#FF69B4" strokeWidth={2} markerEnd="url(#arrowhead)" />
      {edge.label && (
        <text x={mx} y={my - 6} textAnchor="middle" fontSize={11} fill="#7B0040">{edge.label}</text>
      )}
    </g>
  );
}
