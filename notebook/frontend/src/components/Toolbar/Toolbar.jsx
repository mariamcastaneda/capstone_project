import React from 'react';
import { useApp, TOOLS } from '../../context/AppContext';
import ColorPicker from './ColorPicker';
import StrokeWidthSlider from './StrokeWidthSlider';

const TOOL_BUTTONS = [
  { tool: TOOLS.PEN,     icon: '🖊', title: 'Pen (P)' },
  { tool: TOOLS.PENCIL,  icon: '✏️', title: 'Pencil (B)' },
  { tool: TOOLS.ERASER,  icon: '⬜', title: 'Eraser (E)' },
  { tool: TOOLS.TEXT,    icon: 'T',  title: 'Text (T)' },
  { tool: TOOLS.SELECT,  icon: '↖',  title: 'Select' },
  { tool: TOOLS.MINDMAP, icon: '🔮', title: 'Mind Map (M)' },
];

export default function Toolbar({ saveStatus }) {
  const { activeTool, setActiveTool, eraserMode, setEraserMode } = useApp();

  return (
    <nav className="nb-toolbar" aria-label="Drawing toolbar">
      {TOOL_BUTTONS.map(({ tool, icon, title }) => (
        <button key={tool}
          className={`nb-tool-btn ${activeTool === tool ? 'active' : ''}`}
          title={title}
          onClick={() => setActiveTool(tool)}
          aria-pressed={activeTool === tool}
        >{icon}</button>
      ))}

      {activeTool === TOOLS.ERASER && (
        <>
          <div className="nb-toolbar-divider" />
          <button
            className={`nb-tool-btn ${eraserMode === 'stroke' ? 'active' : ''}`}
            title="Stroke eraser (default)"
            onClick={() => setEraserMode('stroke')}
            style={{ fontSize: '0.65rem', height: 36 }}>STR</button>
          <button
            className={`nb-tool-btn ${eraserMode === 'pixel' ? 'active' : ''}`}
            title="Pixel eraser"
            onClick={() => setEraserMode('pixel')}
            style={{ fontSize: '0.65rem', height: 36 }}>PIX</button>
        </>
      )}

      <div className="nb-toolbar-divider" />
      <ColorPicker />
      <div className="nb-toolbar-divider" />
      <StrokeWidthSlider />
      <div className="nb-toolbar-divider" style={{ marginTop: 'auto' }} />

      {saveStatus && (
        <span className="nb-save-status" style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}>
          {saveStatus === 'saving' ? '⏳' : saveStatus === 'saved' ? '✓' : saveStatus === 'error' ? '⚠' : ''}
        </span>
      )}
    </nav>
  );
}
