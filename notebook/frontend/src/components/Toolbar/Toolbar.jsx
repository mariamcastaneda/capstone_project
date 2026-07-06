import React, { useRef, useState } from 'react';
import { Offcanvas, Tab, Tabs } from 'react-bootstrap';
import { useApp, TOOLS } from '../../context/AppContext';
import ColorPicker from './ColorPicker';
import StrokeWidthSlider from './StrokeWidthSlider';
import { stickerRegistry } from '../../assets/stickers/stickerRegistry.js';

const TOOL_BUTTONS = [
  { tool: TOOLS.PEN,     icon: '🖊', title: 'Pen (P)' },
  { tool: TOOLS.PENCIL,  icon: '✏️', title: 'Pencil (B)' },
  { tool: TOOLS.ERASER,  icon: '⬜', title: 'Eraser (E)' },
  { tool: TOOLS.TEXT,    icon: 'T',  title: 'Text (T)' },
  { tool: TOOLS.SELECT,  icon: '↖',  title: 'Select' },
  { tool: TOOLS.MINDMAP, icon: '🔮', title: 'Mind Map (M)' },
];

const FONTS = ['Arial','Georgia','Courier New','Verdana','Times New Roman',
               'Trebuchet MS','Impact','Palatino','Comic Sans MS','Indie Flower'];

export default function Toolbar({ saveStatus, onImagePick, onStickerPlace }) {
  const { activeTool, setActiveTool, eraserMode, setEraserMode } = useApp();
  const fileRef   = useRef(null);
  const [showStickers, setShowStickers] = useState(false);

  return (
    <>
      <nav className="nb-toolbar" aria-label="Drawing toolbar">
        {TOOL_BUTTONS.map(({ tool, icon, title }) => (
          <button key={tool}
            className={`nb-tool-btn ${activeTool === tool ? 'active' : ''}`}
            title={title} onClick={() => setActiveTool(tool)}
            aria-pressed={activeTool === tool}>{icon}</button>
        ))}

        {activeTool === TOOLS.ERASER && (
          <>
            <div className="nb-toolbar-divider" />
            <button className={`nb-tool-btn ${eraserMode === 'stroke' ? 'active' : ''}`}
              title="Stroke eraser" onClick={() => setEraserMode('stroke')}
              style={{ fontSize: '0.65rem', height: 36 }}>STR</button>
            <button className={`nb-tool-btn ${eraserMode === 'pixel' ? 'active' : ''}`}
              title="Pixel eraser" onClick={() => setEraserMode('pixel')}
              style={{ fontSize: '0.65rem', height: 36 }}>PIX</button>
          </>
        )}

        {activeTool === TOOLS.TEXT && (
          <>
            <div className="nb-toolbar-divider" />
            <TextFormattingControls />
          </>
        )}

        <div className="nb-toolbar-divider" />
        <ColorPicker />
        <div className="nb-toolbar-divider" />
        <StrokeWidthSlider />

        <div className="nb-toolbar-divider" />
        {/* Image insert */}
        <button className="nb-tool-btn" title="Insert image" onClick={() => fileRef.current?.click()}>🖼</button>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          hidden onChange={e => { const f = e.target.files?.[0]; if (f) onImagePick?.(f); e.target.value=''; }} />

        {/* Sticker panel */}
        <button className="nb-tool-btn" title="Stickers" onClick={() => setShowStickers(true)}>🌸</button>

        <div className="nb-toolbar-divider" style={{ marginTop: 'auto' }} />
        {saveStatus && (
          <span className="nb-save-status" style={{ writingMode: 'vertical-lr' }}>
            {saveStatus === 'saving' ? '⏳' : saveStatus === 'saved' ? '✓' : saveStatus === 'error' ? '⚠' : ''}
          </span>
        )}
      </nav>

      <StickerPanel show={showStickers} onHide={() => setShowStickers(false)} onPlace={onStickerPlace} />
    </>
  );
}

function TextFormattingControls() {
  const [font, setFont]     = useState('Arial');
  const [size, setSize]     = useState(16);
  const [bold, setBold]     = useState(false);
  const [italic, setItalic] = useState(false);

  const applyCmd = (cmd) => { try { document.execCommand(cmd); } catch {} };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'stretch', padding: '0 2px' }}>
      <select value={font} onChange={e => { setFont(e.target.value); applyCmd('fontName'); }}
        style={{ fontSize: '0.65rem', border: '1px solid var(--nb-pink-300)', borderRadius: 4,
          background: 'var(--nb-pink-50)', color: 'var(--nb-pink-900)', maxWidth: 44 }}>
        {FONTS.map(f => <option key={f} value={f}>{f.split(' ')[0]}</option>)}
      </select>
      <input type="number" min={8} max={200} value={size}
        onChange={e => setSize(Number(e.target.value))}
        style={{ width: 44, fontSize: '0.65rem', border: '1px solid var(--nb-pink-300)',
          borderRadius: 4, background: 'var(--nb-pink-50)', color: 'var(--nb-pink-900)', textAlign: 'center' }} />
      <div style={{ display: 'flex', gap: 2 }}>
        <button onClick={() => { setBold(b => !b); applyCmd('bold'); }}
          className={`nb-tool-btn ${bold ? 'active' : ''}`}
          style={{ width: 20, height: 20, fontSize: '0.7rem', fontWeight: 'bold' }} title="Bold">B</button>
        <button onClick={() => { setItalic(i => !i); applyCmd('italic'); }}
          className={`nb-tool-btn ${italic ? 'active' : ''}`}
          style={{ width: 20, height: 20, fontSize: '0.7rem', fontStyle: 'italic' }} title="Italic">I</button>
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        <button onClick={() => applyCmd('underline')}
          className="nb-tool-btn" style={{ width: 20, height: 20, fontSize: '0.65rem', textDecoration: 'underline' }} title="Underline">U</button>
        <button onClick={() => applyCmd('strikeThrough')}
          className="nb-tool-btn" style={{ width: 20, height: 20, fontSize: '0.65rem', textDecoration: 'line-through' }} title="Strike">S</button>
      </div>
    </div>
  );
}

function StickerPanel({ show, onHide, onPlace }) {
  const categories = Object.entries(stickerRegistry);

  return (
    <Offcanvas show={show} onHide={onHide} placement="start"
      style={{ width: 260, background: 'var(--nb-pink-50)' }}>
      <Offcanvas.Header closeButton style={{ background: 'var(--nb-pink-100)' }}>
        <Offcanvas.Title style={{ color: 'var(--nb-pink-900)', fontSize: '0.95rem' }}>🌸 Stickers</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Tabs defaultActiveKey="academic" className="mb-2" style={{ fontSize: '0.8rem' }}>
          {categories.map(([cat, stickers]) => (
            <Tab key={cat} eventKey={cat} title={cat.charAt(0).toUpperCase() + cat.slice(1)}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, padding: '8px 0' }}>
                {stickers.map(s => (
                  <button key={s.name} title={s.name}
                    onClick={() => { onPlace?.(s); onHide(); }}
                    style={{ width: 44, height: 44, border: '1px solid var(--nb-pink-200)',
                      borderRadius: 8, background: '#fff', cursor: 'pointer', padding: 4 }}
                    dangerouslySetInnerHTML={{ __html: s.svg }} />
                ))}
              </div>
            </Tab>
          ))}
        </Tabs>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
