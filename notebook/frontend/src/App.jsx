import React, { useEffect, useCallback, useRef } from 'react';
import { AppProvider, useApp, TOOLS } from './context/AppContext';
import Sidebar from './components/Sidebar/Sidebar';
import Toolbar from './components/Toolbar/Toolbar';
import CanvasPage from './components/Canvas/CanvasPage';
import * as notebookApi from './services/notebookApi';
import * as pageApi from './services/pageApi';

function WorkArea() {
  const canvasRef = useRef(null);

  const handleImagePick = useCallback((file) => {
    canvasRef.current?.handleImagePick?.(file);
  }, []);

  const handleStickerPlace = useCallback((sticker) => {
    canvasRef.current?.handleStickerPlace?.(sticker);
  }, []);

  return (
    <div className="d-flex flex-grow-1" style={{ overflow: 'hidden' }}>
      <Toolbar onImagePick={handleImagePick} onStickerPlace={handleStickerPlace} />
      <CanvasPage ref={canvasRef} />
    </div>
  );
}

function AppShell() {
  const { setNotebooks, setPages, setActiveNotebookId, setActivePageId,
          setActiveTool } = useApp();

  // Load notebooks on mount
  useEffect(() => {
    notebookApi.getNotebooks().then(async (nbs) => {
      setNotebooks(nbs);
      const pagesMap = {};
      await Promise.all(nbs.map(async (nb) => {
        pagesMap[nb.id] = await pageApi.getPages(nb.id);
      }));
      setPages(pagesMap);
      if (nbs.length) {
        setActiveNotebookId(nbs[0].id);
        if (pagesMap[nbs[0].id]?.length) setActivePageId(pagesMap[nbs[0].id][0].id);
      }
    }).catch(console.error);
  }, []);

  // Global keyboard shortcuts
  const onKeyDown = useCallback((e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
    const map = { p: TOOLS.PEN, b: TOOLS.PENCIL, e: TOOLS.ERASER, t: TOOLS.TEXT, m: TOOLS.MINDMAP };
    if (map[e.key]) { setActiveTool(map[e.key]); return; }
  }, [setActiveTool]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <WorkArea />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
