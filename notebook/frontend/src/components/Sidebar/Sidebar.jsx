import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import * as notebookApi from '../../services/notebookApi';
import * as pageApi from '../../services/pageApi';
import NewNotebookModal from '../Modals/NewNotebookModal';
import ConfirmDeleteModal from '../Modals/ConfirmDeleteModal';
import NotebookItem from './NotebookItem';

export default function Sidebar() {
  const { notebooks, setNotebooks, pages, setPages,
          activeNotebookId, setActiveNotebookId,
          activePageId, setActivePageId } = useApp();

  const [showNew, setShowNew]         = useState(false);
  const [deletingId, setDeletingId]   = useState(null);
  const [deleteType, setDeleteType]   = useState('notebook');
  const [importRef]                   = useState(() => React.createRef());

  const handleCreate = async (name, colorTag) => {
    const nb = await notebookApi.createNotebook(name, colorTag);
    const page = await pageApi.createPage(nb.id);
    setNotebooks(prev => [...prev, nb]);
    setPages(prev => ({ ...prev, [nb.id]: [page] }));
    setActiveNotebookId(nb.id);
    setActivePageId(page.id);
  };

  const handleDeleteNotebook = async () => {
    await notebookApi.deleteNotebook(deletingId);
    setNotebooks(prev => prev.filter(n => n.id !== deletingId));
    setPages(prev => { const next = { ...prev }; delete next[deletingId]; return next; });
    if (activeNotebookId === deletingId) { setActiveNotebookId(null); setActivePageId(null); }
    setDeletingId(null);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const nb = await notebookApi.importNotebook(file);
    const refreshed = await notebookApi.getNotebooks();
    setNotebooks(refreshed);
    e.target.value = '';
  };

  return (
    <aside className="nb-sidebar d-flex flex-column">
      <div className="nb-sidebar-header d-flex justify-content-between align-items-center">
        <span>📓 Notebooks</span>
        <button className="btn btn-sm btn-outline-primary py-0 px-1"
          style={{ fontSize: '1.1rem', lineHeight: 1 }}
          onClick={() => setShowNew(true)} title="New Notebook">＋</button>
      </div>

      {notebooks.length === 0 && (
        <div className="text-center text-muted p-3" style={{ fontSize: '0.8rem' }}>
          <div style={{ fontSize: '2rem' }}>📚</div>
          No notebooks yet.<br />Click ＋ to create one.
        </div>
      )}

      <div className="flex-grow-1 overflow-auto">
        {notebooks.map(nb => (
          <NotebookItem key={nb.id} notebook={nb}
            pages={pages[nb.id] ?? []}
            isActive={activeNotebookId === nb.id}
            activePageId={activePageId}
            onSelect={() => setActiveNotebookId(nb.id)}
            onPageSelect={setActivePageId}
            onRename={async (id, name) => {
              await notebookApi.updateNotebook(id, { name });
              setNotebooks(prev => prev.map(n => n.id === id ? { ...n, name } : n));
            }}
            onDelete={(id) => { setDeletingId(id); setDeleteType('notebook'); }}
            onAddPage={async (nbId) => {
              const page = await pageApi.createPage(nbId);
              setPages(prev => ({ ...prev, [nbId]: [...(prev[nbId] ?? []), page] }));
              setActivePageId(page.id);
            }}
          />
        ))}
      </div>

      <div className="border-top p-2 d-flex gap-1">
        <button className="btn btn-sm w-100" style={{ background: 'var(--nb-pink-100)', fontSize: '0.75rem' }}
          onClick={() => importRef.current.click()}>⬆ Import ZIP</button>
        <input ref={importRef} type="file" accept=".zip" hidden onChange={handleImport} />
      </div>

      <NewNotebookModal show={showNew} onHide={() => setShowNew(false)} onCreate={handleCreate} />
      <ConfirmDeleteModal show={!!deletingId} onHide={() => setDeletingId(null)}
        message={`Delete this ${deleteType} and all its content?`} onConfirm={handleDeleteNotebook} />
    </aside>
  );
}
