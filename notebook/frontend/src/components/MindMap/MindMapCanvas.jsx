import React, { useEffect, useRef } from 'react';
import useMindMap from '../../hooks/useMindMap';
import * as elementApi from '../../services/elementApi';
import MindMapNode from './MindMapNode';
import MindMapEdge from './MindMapEdge';

export default function MindMapCanvas({ zoom, panX, panY, pageId, existingElement, onSave }) {
  const map    = useMindMap();
  const elId   = useRef(existingElement?.id ?? null);
  const isMounted = useRef(false);

  // Hydrate from persisted data on first mount only
  useEffect(() => {
    if (existingElement?.data) {
      try { map.hydrate(JSON.parse(existingElement.data)); } catch {}
    }
    isMounted.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist whenever state settles after any change (skips the initial hydration render)
  useEffect(() => {
    if (!isMounted.current) return;
    // Don't persist an empty map on mount before hydration completes
    if (!map.nodes.length && !elId.current) return;
    const data = JSON.stringify({ nodes: map.nodes, edges: map.edges });
    if (elId.current) {
      elementApi.updateElement(elId.current, { data }).then(onSave).catch(console.error);
    } else {
      elementApi.createElement(pageId, { elementType: 'mindmap', data, x: 0, y: 0 })
        .then(el => { elId.current = el.id; onSave(el); })
        .catch(console.error);
    }
  }, [map.nodes, map.edges]); // eslint-disable-line react-hooks/exhaustive-deps

  // persist is now driven by the useEffect above — no manual calls needed
  const handleAddNode = () => {
    map.addNode({ label: 'New Idea', x: 300 + map.nodes.length * 40, y: 200 });
    // state change triggers useEffect → persist automatically
  };

  const exportPng = () => {
    const svg = document.getElementById('nb-mindmap-svg');
    if (!svg) return;
    const xml  = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = svg.clientWidth; c.height = svg.clientHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      const a = document.createElement('a');
      a.href = c.toDataURL('image/png'); a.download = 'mindmap.png'; a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <>
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 4 }}>
        <button className="btn btn-sm" style={{ background: 'var(--nb-pink-400)', color: '#fff' }} onClick={handleAddNode}>＋ Node</button>
        <button className="btn btn-sm" style={{ background: 'var(--nb-pink-100)' }} onClick={map.autoLayoutRadial}>Radial</button>
        <button className="btn btn-sm" style={{ background: 'var(--nb-pink-100)' }} onClick={map.autoLayoutHierarchical}>Tree</button>
        <button className="btn btn-sm" style={{ background: 'var(--nb-pink-200)' }} onClick={exportPng}>⬇ PNG</button>
      </div>
      <svg id="nb-mindmap-svg"
        style={{ position: 'absolute', top: 0, left: 0, width: 4000, height: 3000,
          transformOrigin: '0 0', transform: `translate(${panX}px,${panY}px) scale(${zoom})`,
          pointerEvents: 'none', overflow: 'visible' }}>
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#FF69B4" />
          </marker>
        </defs>
        {map.edges.map(e => <MindMapEdge key={e.id} edge={e} nodes={map.nodes} />)}
      </svg>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 4000, height: 3000,
        transformOrigin: '0 0', transform: `translate(${panX}px,${panY}px) scale(${zoom})`,
        pointerEvents: 'none' }}>
        {map.nodes.map(n => (
          <MindMapNode key={n.id} node={n}
            zoom={zoom} panX={panX} panY={panY}
            onMove={(id, x, y) => map.updateNode(id, { x, y })}
            onAddChild={(parentId) => map.addNode({ parentId, x: n.x + 200, y: n.y + 100 })}
            onRemove={(id) => map.removeNode(id)}
          />
        ))}
      </div>
    </>
  );
}
