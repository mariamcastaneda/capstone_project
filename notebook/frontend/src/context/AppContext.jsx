import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export const TOOLS = {
  PENCIL:  'pencil',
  PEN:     'pen',
  ERASER:  'eraser',
  TEXT:    'text',
  SELECT:  'select',
  MINDMAP: 'mindmap',
};

export function AppProvider({ children }) {
  const [activeNotebookId, setActiveNotebookId] = useState(null);
  const [activePageId, setActivePageId]         = useState(null);
  const [activeTool, setActiveTool]             = useState(TOOLS.PEN);
  const [activeColor, setActiveColor]           = useState('#222222');
  const [strokeWidth, setStrokeWidth]           = useState(3);
  const [eraserMode, setEraserMode]             = useState('stroke');
  const [notebooks, setNotebooks]               = useState([]);
  const [pages, setPages]                       = useState({});
  const [zoom, setZoom]                         = useState(1);
  const [saveStatus, setSaveStatus]             = useState('idle');

  // Text-box formatting — shared across Toolbar controls and TextBoxElement
  const [fontFamily,    setFontFamily]    = useState('Arial');
  const [fontSize,      setFontSize]      = useState(16);
  const [textBold,      setTextBold]      = useState(false);
  const [textItalic,    setTextItalic]    = useState(false);
  const [textUnderline, setTextUnderline] = useState(false);

  // Which text-box element is currently "active" (last focused / being edited)
  // Persists even after DOM blur so toolbar changes still apply to it
  const [activeTextElementId, setActiveTextElementId] = useState(null);

  return (
    <AppContext.Provider value={{
      activeNotebookId, setActiveNotebookId,
      activePageId,     setActivePageId,
      activeTool,       setActiveTool,
      activeColor,      setActiveColor,
      strokeWidth,      setStrokeWidth,
      eraserMode,       setEraserMode,
      notebooks,        setNotebooks,
      pages,            setPages,
      zoom,             setZoom,
      saveStatus,       setSaveStatus,
      fontFamily,    setFontFamily,
      fontSize,      setFontSize,
      textBold,      setTextBold,
      textItalic,    setTextItalic,
      textUnderline, setTextUnderline,
      activeTextElementId, setActiveTextElementId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
