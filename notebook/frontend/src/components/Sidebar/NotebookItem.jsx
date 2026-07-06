import React, { useState } from 'react';
import PageItem from './PageItem';

export default function NotebookItem({
  notebook, pages, isActive, activePageId,
  onSelect, onPageSelect, onRename, onDelete, onAddPage
}) {
  const [renaming, setRenaming] = useState(false);
  const [nameVal, setNameVal]   = useState(notebook.name);
  const [expanded, setExpanded] = useState(isActive);

  const commitRename = () => {
    setRenaming(false);
    if (nameVal.trim() && nameVal !== notebook.name) onRename(notebook.id, nameVal.trim());
    else setNameVal(notebook.name);
  };

  return (
    <div>
      <div
        className={`nb-notebook-item d-flex justify-content-between align-items-center ${isActive ? 'active' : ''}`}
        onClick={() => { onSelect(); setExpanded(e => !e); }}
        onContextMenu={(e) => { e.preventDefault(); setExpanded(true); onSelect(); }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%',
            background: notebook.colorTag, flexShrink: 0 }} />
          {renaming ? (
            <input autoFocus className="form-control form-control-sm py-0 px-1"
              style={{ height: 22, fontSize: '0.85rem' }}
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setRenaming(false); setNameVal(notebook.name); }}}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              onDoubleClick={e => { e.stopPropagation(); setRenaming(true); }}>
              {notebook.name}
            </span>
          )}
        </span>
        <span className="d-flex gap-1" onClick={e => e.stopPropagation()}>
          <button className="btn btn-link btn-sm p-0" title="Add page"
            style={{ fontSize: '0.8rem', color: 'var(--nb-pink-600)' }}
            onClick={() => onAddPage(notebook.id)}>＋</button>
          <button className="btn btn-link btn-sm p-0" title="Rename"
            style={{ fontSize: '0.8rem', color: 'var(--nb-pink-600)' }}
            onClick={() => setRenaming(true)}>✏</button>
          <button className="btn btn-link btn-sm p-0" title="Delete"
            style={{ fontSize: '0.8rem', color: '#c0392b' }}
            onClick={() => onDelete(notebook.id)}>🗑</button>
        </span>
      </div>

      {expanded && pages.map(page => (
        <PageItem key={page.id} page={page} isActive={activePageId === page.id}
          onSelect={() => onPageSelect(page.id)} />
      ))}
    </div>
  );
}
