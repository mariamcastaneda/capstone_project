# Implementation Plan: Course Notebook App

**Branch**: `001-course-notebook-app` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-course-notebook-app/spec.md`

## Summary

A web-based, offline-capable notebook application that lets students organize notes by course. Each page is a free-form canvas combining HTML5 Canvas (raster drawing) and positioned HTML/SVG elements (text boxes, images, mind maps). The frontend is built with React 18 + Bootstrap 5 (pink-themed toolbar). The backend is a .NET Core Minimal API with EF Core + SQLite for all metadata and content. No data leaves the user's machine.

---

## Technical Context

**Language/Version**: C# 12 / .NET 8 (backend) · JavaScript ES2023 / React 18 (frontend)

**Primary Dependencies**:
- Backend: `Microsoft.EntityFrameworkCore.Sqlite` (EF Core 8), `Microsoft.AspNetCore` Minimal API (built-in). No additional packages.
- Frontend: `react@18`, `react-dom@18`, `bootstrap@5` (CSS only), `react-bootstrap@2` (UI components). No drawing libraries — raw HTML5 Canvas API and SVG.

**Storage**: SQLite via EF Core. All metadata (notebooks, pages, element positions/data) stored in a single `notebook.db` file on the user's machine. Images saved as files in a local `data/images/` folder; filenames are referenced inside element JSON blobs. No cloud upload of any kind.

**Testing**: xUnit + FluentAssertions (backend) · Jest + React Testing Library (frontend)

**Target Platform**: Desktop browser (Chrome, Firefox, Edge — latest 2 versions). Served locally via `dotnet run` + Vite dev server or `dotnet publish` + SPA static hosting.

**Project Type**: Full-stack web application (SPA + REST API)

**Performance Goals**: ≥60 fps freehand drawing on canvas · <200ms mind map drag response · ≤5s auto-save · <2s app load

**Constraints**: Fully offline — no external API calls, no CDN, no cloud. SQLite as the only persistence mechanism. Minimal third-party dependencies (≤5 npm packages total, ≤2 NuGet packages total beyond built-ins).

**Scale/Scope**: Single-user, single-machine. No auth, no multi-user. Target: hundreds of notebooks, thousands of pages, tens of thousands of canvas elements per page.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **SOLID – Single Responsibility** | ✅ | Each .NET service class owns one domain (NotebookService, PageService, ElementService, ImageService). Each React component owns one visual concern. |
| **SOLID – Open/Closed** | ✅ | CanvasElement uses a discriminated `ElementType` enum + JSON data blob — new element types added without modifying existing services. |
| **SOLID – Liskov Substitution** | ✅ | Canvas element renderers implement a common `ICanvasRenderer` interface; each subtype is fully substitutable. |
| **SOLID – Interface Segregation** | ✅ | Frontend services (NotebookApi, PageApi, ElementApi) expose narrow interfaces; components import only the calls they need. |
| **SOLID – Dependency Inversion** | ✅ | .NET services depend on `IRepository<T>` abstractions injected via DI; EF Core implementation registered at startup. |
| **Modularity** | ✅ | Strict layers: API endpoints → Services → Repository → EF Core. Frontend: UI components → hooks → API service → fetch. No layer skipping. |
| **Test-First** | ✅ | TDD mandatory. Unit tests written before each service/component. Coverage gate: ≥90%. |
| **No Circular Deps** | ✅ | Frontend dependency graph: pages → components → hooks → services. Backend: endpoints → services → data. No cycles. |
| **Injected Config** | ✅ | DB connection string, image storage path, and CORS origins are in `appsettings.json`, injected via `IConfiguration`. |
| **Simplicity / YAGNI** | ✅ | No Redux, no ORM beyond EF Core, no CSS preprocessor (Bootstrap + CSS variables only), no state machine library. |
| **Performance** | ✅ | Canvas drawing uses `requestAnimationFrame`. Auto-save debounced at 3s. Images thumbnail-compressed before storage. |
| **Max fn length 30 lines** | ✅ | Enforced via ESLint `max-lines-per-function` and .editorconfig. |

**Complexity Justification** (two-project structure):

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Frontend + Backend split | Browser APIs (Canvas, File) need a JS runtime; SQLite/EF Core needs .NET | A single .NET Blazor app would require WASM and adds significant complexity with no benefit for this use case |
| `react-bootstrap` package | Bootstrap JS components (modals, dropdowns) require React integration to avoid jQuery | Vanilla Bootstrap JS requires jQuery or custom event wiring; using react-bootstrap keeps the component model clean |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-course-notebook-app/
├── plan.md              ← this file
├── spec.md              ← feature specification
└── tasks.md             ← generated by /speckit.tasks (next step)
```

### Source Code (repository root)

```text
backend/
├── CourseNotebook.Api/
│   ├── Program.cs                   ← app bootstrap, DI registration, Minimal API route map
│   ├── appsettings.json             ← DB path, image storage path, CORS
│   ├── Data/
│   │   ├── AppDbContext.cs          ← EF Core DbContext (Notebooks, Pages, Elements)
│   │   └── Migrations/              ← EF Core auto-generated migrations
│   ├── Models/
│   │   ├── Notebook.cs
│   │   ├── Page.cs
│   │   └── CanvasElement.cs         ← polymorphic via ElementType enum + JSON data field
│   ├── Repositories/
│   │   ├── IRepository.cs           ← generic CRUD interface
│   │   └── EfRepository.cs          ← EF Core implementation
│   ├── Services/
│   │   ├── NotebookService.cs
│   │   ├── PageService.cs
│   │   ├── ElementService.cs
│   │   └── ImageService.cs          ← save/delete local image files
│   └── Endpoints/
│       ├── NotebookEndpoints.cs
│       ├── PageEndpoints.cs
│       ├── ElementEndpoints.cs
│       └── ImageEndpoints.cs
└── CourseNotebook.Tests/
    ├── Unit/
    │   ├── NotebookServiceTests.cs
    │   ├── PageServiceTests.cs
    │   ├── ElementServiceTests.cs
    │   └── ImageServiceTests.cs
    └── Integration/
        ├── NotebookEndpointTests.cs
        └── PageEndpointTests.cs

frontend/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx                     ← React root, Bootstrap CSS import
│   ├── App.jsx                      ← top-level layout (Sidebar + WorkArea)
│   ├── styles/
│   │   ├── theme.css                ← CSS variables: pink palette overriding Bootstrap tokens
│   │   └── toolbar.css              ← pink toolbar-specific styles
│   ├── components/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.jsx          ← notebook/page tree nav
│   │   │   ├── NotebookItem.jsx
│   │   │   └── PageItem.jsx
│   │   ├── Toolbar/
│   │   │   ├── Toolbar.jsx          ← pink control panel; tool buttons
│   │   │   ├── ToolButton.jsx
│   │   │   ├── ColorPicker.jsx
│   │   │   └── StrokeWidthSlider.jsx
│   │   ├── Canvas/
│   │   │   ├── CanvasPage.jsx       ← container: raster canvas + element overlay
│   │   │   ├── DrawingCanvas.jsx    ← <canvas> for pencil/pen/eraser strokes
│   │   │   ├── ElementOverlay.jsx   ← positioned <div> layer for text/image/sticker
│   │   │   ├── TextBoxElement.jsx
│   │   │   ├── ImageElement.jsx
│   │   │   └── StickerElement.jsx
│   │   ├── MindMap/
│   │   │   ├── MindMapCanvas.jsx    ← SVG-based mind map (replaces DrawingCanvas when active)
│   │   │   ├── MindMapNode.jsx
│   │   │   ├── MindMapEdge.jsx
│   │   │   └── MindMapToolbar.jsx
│   │   └── Modals/
│   │       ├── NewNotebookModal.jsx
│   │       └── ConfirmDeleteModal.jsx
│   ├── hooks/
│   │   ├── useCanvas.js             ← Canvas 2D drawing logic, RAF loop
│   │   ├── useAutoSave.js           ← debounced save trigger
│   │   ├── useUndoRedo.js           ← immutable history stack
│   │   └── useMindMap.js            ← node/edge state management
│   ├── services/
│   │   ├── notebookApi.js           ← fetch wrappers for /api/notebooks
│   │   ├── pageApi.js
│   │   ├── elementApi.js
│   │   └── imageApi.js
│   └── context/
│       └── AppContext.jsx           ← active notebook/page, active tool, color state
└── tests/
    ├── unit/
    │   ├── useCanvas.test.js
    │   ├── useUndoRedo.test.js
    │   └── useMindMap.test.js
    └── integration/
        ├── Sidebar.test.jsx
        ├── Toolbar.test.jsx
        └── CanvasPage.test.jsx
```

**Structure Decision**: Web application split (Option 2). `backend/` holds the .NET 8 Minimal API + EF Core SQLite project. `frontend/` holds the React 18 + Vite + Bootstrap 5 SPA. The frontend calls the backend API over `http://localhost:5000` in development; in production the .NET app serves the built SPA as static files.

---

## Data Model

### SQLite Tables (via EF Core)

```sql
-- Notebooks
CREATE TABLE Notebooks (
    Id          TEXT PRIMARY KEY,          -- GUID
    Name        TEXT NOT NULL,
    ColorTag    TEXT NOT NULL DEFAULT '#FF69B4',
    Icon        TEXT,                      -- emoji or icon name
    SortOrder   INTEGER NOT NULL DEFAULT 0,
    CreatedAt   TEXT NOT NULL,             -- ISO 8601
    UpdatedAt   TEXT NOT NULL
);

-- Pages
CREATE TABLE Pages (
    Id          TEXT PRIMARY KEY,
    NotebookId  TEXT NOT NULL REFERENCES Notebooks(Id) ON DELETE CASCADE,
    Name        TEXT NOT NULL DEFAULT 'Page 1',
    SortOrder   INTEGER NOT NULL DEFAULT 0,
    CreatedAt   TEXT NOT NULL,
    UpdatedAt   TEXT NOT NULL
);

-- Canvas Elements (polymorphic)
CREATE TABLE CanvasElements (
    Id          TEXT PRIMARY KEY,
    PageId      TEXT NOT NULL REFERENCES Pages(Id) ON DELETE CASCADE,
    ElementType TEXT NOT NULL,             -- 'stroke' | 'text' | 'image' | 'sticker' | 'mindmap'
    Data        TEXT NOT NULL,             -- JSON blob (element-specific payload)
    X           REAL NOT NULL DEFAULT 0,
    Y           REAL NOT NULL DEFAULT 0,
    Width       REAL,
    Height      REAL,
    Rotation    REAL NOT NULL DEFAULT 0,
    ZOrder      INTEGER NOT NULL DEFAULT 0,
    CreatedAt   TEXT NOT NULL,
    UpdatedAt   TEXT NOT NULL
);
```

### Element `Data` JSON Schemas

**stroke**
```json
{ "tool": "pencil|pen", "color": "#FF69B4", "width": 3,
  "points": [[x,y], [x,y], ...] }
```

**text**
```json
{ "content": "...", "fontFamily": "Georgia", "fontSize": 16,
  "color": "#222", "bold": false, "italic": false, "underline": false,
  "bgColor": null }
```

**image** / **sticker**
```json
{ "fileName": "abc123.png", "originalName": "formula.png",
  "mimeType": "image/png" }
```

**mindmap**
```json
{
  "nodes": [{ "id": "n1", "label": "Main Idea", "shape": "circle",
              "fillColor": "#FFB6C1", "borderColor": "#FF69B4",
              "textColor": "#333", "x": 300, "y": 200 }],
  "edges": [{ "id": "e1", "from": "n1", "to": "n2", "label": "" }]
}
```

---

## API Contracts

### Notebooks
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/notebooks` | List all notebooks ordered by SortOrder |
| POST | `/api/notebooks` | Create notebook `{ name, colorTag?, icon? }` |
| PUT | `/api/notebooks/{id}` | Update `{ name?, colorTag?, icon?, sortOrder? }` |
| DELETE | `/api/notebooks/{id}` | Delete notebook + cascade pages + elements |

### Pages
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/notebooks/{id}/pages` | List pages for a notebook |
| POST | `/api/notebooks/{id}/pages` | Create page `{ name? }` |
| PUT | `/api/pages/{id}` | Update `{ name?, sortOrder? }` |
| DELETE | `/api/pages/{id}` | Delete page + cascade elements |

### Canvas Elements
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/pages/{id}/elements` | List all elements for a page |
| POST | `/api/pages/{id}/elements` | Create element `{ elementType, data, x, y, width?, height?, rotation?, zOrder? }` |
| PUT | `/api/elements/{id}` | Update any field (position, data) |
| DELETE | `/api/elements/{id}` | Delete single element |
| DELETE | `/api/pages/{id}/elements` | Bulk delete all elements (used by clear-page) |

### Images
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/images` | Multipart upload — saves to `data/images/`, returns `{ fileName }` |
| DELETE | `/api/images/{fileName}` | Delete local image file |
| GET | `/api/images/{fileName}` | Serve local image file (static file middleware) |

---

## Pink Theme Design Tokens

```css
/* frontend/src/styles/theme.css */
:root {
  /* Core pink palette */
  --nb-pink-50:  #FFF0F5;   /* lightest — sidebar/page background */
  --nb-pink-100: #FFD6E7;   /* toolbar background */
  --nb-pink-200: #FFB3CB;   /* toolbar hover states */
  --nb-pink-400: #FF69B4;   /* primary buttons, active tool highlight */
  --nb-pink-600: #E91E8C;   /* accent, selected notebook item */
  --nb-pink-900: #7B0040;   /* text on pink backgrounds */

  /* Bootstrap 5 token overrides */
  --bs-primary:        var(--nb-pink-400);
  --bs-primary-rgb:    255, 105, 180;
  --bs-link-color:     var(--nb-pink-600);
  --bs-body-bg:        #FFFAFB;
}

/* Toolbar panel */
.nb-toolbar {
  background: linear-gradient(135deg, var(--nb-pink-100), var(--nb-pink-200));
  border-right: 2px solid var(--nb-pink-400);
}

.nb-tool-btn.active {
  background-color: var(--nb-pink-400);
  color: white;
  box-shadow: 0 0 0 3px var(--nb-pink-200);
}
```

---

## Phase Roadmap

| Phase | Deliverable | Constitution Gate |
|-------|-------------|-------------------|
| **0 – Scaffold** | .NET 8 Minimal API project + Vite React project + EF Core SQLite migration 001 (empty schema) | Structure in place, DI wired, CI can build both projects |
| **1 – Notebooks CRUD** | Sidebar with create/rename/delete notebooks + pages; API + service + repo + unit tests | TDD: service tests first; ≥90% coverage on NotebookService |
| **2 – Blank Canvas** | CanvasPage renders; pan (space+drag); AppContext wires active page | 60fps empty canvas; no drawing yet |
| **3 – Drawing Tools** | Pencil, Pen, Eraser, color picker, stroke width — all backed by `useCanvas` hook; strokes saved as elements | TDD: useCanvas unit tests; Red-Green before impl |
| **4 – Undo / Redo** | `useUndoRedo` hook; Ctrl+Z/Y works across all canvas mutations | Hook unit tests first |
| **5 – Auto-Save** | `useAutoSave` debounced at 3s; dirty-flag pattern; save indicator in toolbar | Integration test: mock API + RTL |
| **6 – Text Boxes** | Text element placed on canvas; font/size/color/bold/italic toolbar; resize + reposition | TDD: TextBoxElement unit tests |
| **7 – Images & Stickers** | Drag-drop + file picker; `ImageService` saves to `data/images/`; built-in sticker SVGs bundled | FR-017 – FR-020 verified |
| **8 – Mind Map** | SVG mind map on its own layer; nodes, edges, labels, shapes, colors, auto-layout; PNG export | TDD: useMindMap hook; FR-021 – FR-027 verified |
| **9 – Pink Theme & Polish** | `theme.css` applied; all Bootstrap components themed; keyboard shortcuts; responsive toolbar; final QA | All quality gates: lint, type-check, coverage, benchmark |
