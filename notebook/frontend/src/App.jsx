import React, { useEffect, useCallback, useRef, useState, Component } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { AppProvider, useApp, TOOLS } from './context/AppContext';
import Sidebar from './components/Sidebar/Sidebar';
import Toolbar from './components/Toolbar/Toolbar';
import CanvasPage from './components/Canvas/CanvasPage';
import * as notebookApi from './services/notebookApi';
import * as pageApi from './services/pageApi';

/* ── Error Boundary (T107) ───────────────────────────────────────────────── */
class ErrorBoundary extends Component {
  state = { hasError: false, message: '' };
  static getDerivedStateFromError(err) { return { hasError: true, message: err?.message ?? 'Unknown error' }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center"
          style={{ height: '100vh', background: 'var(--nb-pink-50)', color: 'var(--nb-pink-900)' }}>
          <div style={{ fontSize: '3rem' }}>💔</div>
          <h4 className="mt-3">Something went wrong</h4>
          <p className="text-muted" style={{ maxWidth: 400, textAlign: 'center' }}>{this.state.message}</p>
          <button className="btn btn-sm mt-2"
            style={{ background: 'var(--nb-pink-400)', color: '#fff' }}
            onClick={() => this.setState({ hasError: false })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

/* ── Toast notification system (T105) ───────────────────────────────────── */
function ToastNotifications() {
  const [toasts, setToasts] = useState([]);

  // Expose a global notify function so any module can trigger a toast
  useEffect(() => {
    window.__nbNotify = (message, variant = 'danger') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, variant }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };
    return () => { delete window.__nbNotify; };
  }, []);

  return (
    <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
      {toasts.map(t => (
        <Toast key={t.id} bg={t.variant} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
          <Toast.Header closeButton>
            <strong className="me-auto">
              {t.variant === 'danger' ? '⚠ Error' : t.variant === 'success' ? '✓ Success' : 'ℹ Info'}
            </strong>
          </Toast.Header>
          <Toast.Body className={t.variant === 'danger' ? 'text-white' : ''}>
            {t.message}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
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

  // Global keyboard shortcuts (T101 + Ctrl+Z/Y)
  const onKeyDown = useCallback((e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
    const map = { p: TOOLS.PEN, b: TOOLS.PENCIL, e: TOOLS.ERASER, t: TOOLS.TEXT, m: TOOLS.MINDMAP };
    if (map[e.key?.toLowerCase()]) { e.preventDefault(); setActiveTool(map[e.key.toLowerCase()]); return; }
    if (e.key === 'Escape') { setActiveTool(TOOLS.SELECT); return; }
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
    <ErrorBoundary>
      <AppProvider>
        <AppShell />
        <ToastNotifications />
      </AppProvider>
    </ErrorBoundary>
  );
}
