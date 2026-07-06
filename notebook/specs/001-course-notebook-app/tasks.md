# Tasks: Course Notebook App

**Input**: Design documents from `/specs/001-course-notebook-app/`

**Prerequisites**: plan.md ✅ · spec.md ✅ (5 user stories, 33 FRs, clarifications applied)

**TDD Note**: Per the project Constitution (Principle III), test tasks MUST be completed and confirmed failing **before** their paired implementation tasks begin. Red-Green-Refactor is non-negotiable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable — touches different files with no dependency on incomplete tasks
- **[US#]**: User story this task belongs to (US1–US5 from spec.md)

---

## Phase 1: Setup

**Purpose**: Scaffold both projects so the build pipeline is green before any feature work begins.

- [x] T001 Initialize .NET 8 Minimal API project: `dotnet new webapi -o backend/CourseNotebook.Api --no-https`
- [x] T002 Initialize xUnit test project: `dotnet new xunit -o backend/CourseNotebook.Tests` and add project reference to `CourseNotebook.Api`
- [x] T003 [P] Initialize React 18 + Vite frontend: `npm create vite@latest frontend -- --template react` inside `notebook/`
- [x] T004 [P] Add `.gitignore` entries for `bin/`, `obj/`, `*.db`, `node_modules/`, `dist/`, `data/images/` at repo root
- [x] T005 [P] Configure `frontend/vite.config.js` with dev proxy: `/api` → `http://localhost:5000`
- [x] T006 [P] Add `backend/CourseNotebook.Api/appsettings.json` with keys: `DbPath`, `ImageStoragePath`, `AllowedOrigins`
- [x] T007 [P] Add `backend/CourseNotebook.Api/appsettings.Development.json` with local dev paths (`./notebook.db`, `./data/images`)

**Checkpoint**: `dotnet build backend/` and `npm install && npm run dev` in `frontend/` both succeed with zero errors.

---

## Phase 2: Foundational

**Purpose**: Core infrastructure shared by all user stories. No story work begins until this phase is complete.

**⚠️ CRITICAL**: All subsequent phases depend on this foundation.

- [x] T008 Add NuGet packages to `backend/CourseNotebook.Api/`: `Microsoft.EntityFrameworkCore.Sqlite`, `Microsoft.EntityFrameworkCore.Design`, `FluentAssertions` (test project)
- [x] T009 Create `backend/CourseNotebook.Api/Models/Notebook.cs` — properties: `Id` (GUID string), `Name`, `ColorTag`, `Icon`, `SortOrder`, `CreatedAt`, `UpdatedAt`
- [x] T010 [P] Create `backend/CourseNotebook.Api/Models/Page.cs` — properties: `Id`, `NotebookId` (FK), `Name`, `SortOrder`, `CreatedAt`, `UpdatedAt`; nav property to `Notebook`
- [x] T011 [P] Create `backend/CourseNotebook.Api/Models/CanvasElement.cs` — properties: `Id`, `PageId` (FK), `ElementType` (string enum: stroke/text/image/sticker/mindmap), `Data` (JSON string), `X`, `Y`, `Width`, `Height`, `Rotation`, `ZOrder`, `CreatedAt`, `UpdatedAt`
- [x] T012 Create `backend/CourseNotebook.Api/Data/AppDbContext.cs` with `DbSet<Notebook>`, `DbSet<Page>`, `DbSet<CanvasElement>`; configure cascade-delete and indexes on `Pages(NotebookId)` and `CanvasElements(PageId)`
- [x] T013 Run `dotnet ef migrations add InitialSchema` and `dotnet ef database update` to create `notebook.db`
- [x] T014 Create `backend/CourseNotebook.Api/Repositories/IRepository.cs` — generic interface: `GetAllAsync`, `GetByIdAsync`, `AddAsync`, `UpdateAsync`, `DeleteAsync`
- [x] T015 Create `backend/CourseNotebook.Api/Repositories/EfRepository.cs` implementing `IRepository<T>` using `AppDbContext`
- [x] T016 Wire DI in `backend/CourseNotebook.Api/Program.cs`: register `AppDbContext`, `EfRepository<T>` for each entity, CORS from `AllowedOrigins` config, static file serving for `ImageStoragePath`
- [x] T017 [P] Install npm packages in `frontend/`: `bootstrap@5`, `react-bootstrap@2`; confirm no other packages added
- [x] T018 [P] Create `frontend/src/styles/theme.css` — define CSS variables: `--nb-pink-50` through `--nb-pink-900`, Bootstrap token overrides (`--bs-primary`, `--bs-primary-rgb`, `--bs-link-color`), `--bs-body-bg`
- [x] T019 [P] Create `frontend/src/styles/toolbar.css` — `.nb-toolbar` gradient background, `.nb-tool-btn.active` pink highlight with box-shadow
- [x] T020 [P] Update `frontend/src/main.jsx` — import `bootstrap/dist/css/bootstrap.min.css`, `./styles/theme.css`, render `<App />` inside `<React.StrictMode>`
- [x] T021 Create `frontend/src/context/AppContext.jsx` — provide: `activeNotebookId`, `activePageId`, `activeTool` (pencil/pen/eraser/text/mindmap/select), `activeColor`, `strokeWidth`, `setters` for each
- [x] T022 [P] Create `frontend/src/App.jsx` — layout shell: Bootstrap `d-flex` row with `<Sidebar />` (left) and `<WorkArea />` (right); import theme CSS; wrap in `AppContext.Provider`
- [x] T023 [P] Configure Jest + React Testing Library in `frontend/package.json` (`jest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`); add `npm test` script
- [x] T024 [P] Create empty stub files: `frontend/src/components/Sidebar/Sidebar.jsx`, `Toolbar/Toolbar.jsx`, `Canvas/CanvasPage.jsx` returning `<div>TODO</div>`

**Checkpoint**: Backend builds, DB migration applies, `GET /api/notebooks` returns 200 `[]`. Frontend renders a blank split-layout page. All stubs import without error.

---

## Phase 3: User Story 1 — Course & Notebook Management (Priority: P1) 🎯 MVP

**Goal**: Students can create, rename, reorder, and delete notebooks and pages. All changes persist across refresh.

**Independent Test**: Open app → create two notebooks → rename one → add two pages to first → drag to reorder → delete second notebook → refresh → verify state is preserved.

### Tests for User Story 1 *(write first — must FAIL before T034)*

- [ ] T025 [P] [US1] Write `backend/CourseNotebook.Tests/Unit/NotebookServiceTests.cs` — unit tests for: CreateNotebook, RenameNotebook (duplicate name allowed), DeleteNotebook (cascade), ReorderNotebooks
- [ ] T026 [P] [US1] Write `backend/CourseNotebook.Tests/Unit/PageServiceTests.cs` — unit tests for: CreatePage, RenamePage, DeletePage, ReorderPages within a notebook
- [ ] T027 [P] [US1] Write `backend/CourseNotebook.Tests/Integration/NotebookEndpointTests.cs` — integration tests for all `GET/POST/PUT/DELETE /api/notebooks` and `/api/notebooks/{id}/pages` endpoints using in-memory SQLite
- [ ] T028 [P] [US1] Write `frontend/tests/integration/Sidebar.test.jsx` — RTL tests for: render empty state, create notebook modal, rename inline, delete with confirm modal, page creation

### Implementation for User Story 1

- [x] T029 [US1] Implement `backend/CourseNotebook.Api/Services/NotebookService.cs` — CRUD + reorder logic using `IRepository<Notebook>`; duplicate names allowed (FR-033)
- [x] T030 [US1] Implement `backend/CourseNotebook.Api/Services/PageService.cs` — CRUD + reorder logic using `IRepository<Page>`
- [x] T031 [US1] Implement `backend/CourseNotebook.Api/Endpoints/NotebookEndpoints.cs` — map: `GET /api/notebooks`, `POST /api/notebooks`, `PUT /api/notebooks/{id}`, `DELETE /api/notebooks/{id}`
- [x] T032 [US1] Implement `backend/CourseNotebook.Api/Endpoints/PageEndpoints.cs` — map: `GET /api/notebooks/{id}/pages`, `POST /api/notebooks/{id}/pages`, `PUT /api/pages/{id}`, `DELETE /api/pages/{id}`
- [x] T033 Register notebook and page endpoints in `backend/CourseNotebook.Api/Program.cs`
- [x] T034 [P] [US1] Implement `frontend/src/services/notebookApi.js` — fetch wrappers: `getNotebooks()`, `createNotebook(name, colorTag)`, `updateNotebook(id, patch)`, `deleteNotebook(id)`
- [x] T035 [P] [US1] Implement `frontend/src/services/pageApi.js` — fetch wrappers: `getPages(notebookId)`, `createPage(notebookId, name)`, `updatePage(id, patch)`, `deletePage(id)`
- [x] T036 [US1] Implement `frontend/src/components/Sidebar/NotebookItem.jsx` — displays name + color tag; right-click context menu (Rename, Add Page, Delete); inline rename on double-click
- [x] T037 [US1] Implement `frontend/src/components/Sidebar/PageItem.jsx` — displays page name; inline rename on double-click; click sets `activePageId` in AppContext
- [x] T038 [US1] Implement `frontend/src/components/Sidebar/Sidebar.jsx` — renders list of `NotebookItem` + `PageItem` with HTML5 drag-and-drop reorder; calls `notebookApi` / `pageApi` on change; shows empty state when no notebooks
- [x] T039 [US1] Implement `frontend/src/components/Modals/NewNotebookModal.jsx` — Bootstrap `<Modal>` with name input + color-tag picker (using `--nb-pink-*` swatches); calls `createNotebook` on submit
- [x] T040 [US1] Implement `frontend/src/components/Modals/ConfirmDeleteModal.jsx` — Bootstrap `<Modal>` with warning text and confirm/cancel buttons
- [x] T041 [US1] Wire sidebar into `frontend/src/App.jsx` — on mount: `getNotebooks()` → populate AppContext; pass callbacks to Sidebar

**Checkpoint**: US1 independently verifiable — full notebook/page lifecycle works with persistence. Run `T027` integration tests: all must pass.

---

## Phase 4: User Story 2 — Free-Form Canvas & Drawing Tools (Priority: P2)

**Goal**: Students draw freehand strokes with pencil/pen, erase them, pick colors, pan the 4000×3000 canvas, and have strokes persist.

**Independent Test**: Open a page → draw 5 strokes with different colors → erase one → Ctrl+Z → Ctrl+Y → pan canvas → refresh → verify all strokes restored.

### Tests for User Story 2 *(write first — must FAIL before T051)*

- [ ] T042 [P] [US2] Write `frontend/tests/unit/useUndoRedo.test.js` — tests for: initial empty stack, push, undo (returns prev state), redo, max-stack limit, clear
- [ ] T043 [P] [US2] Write `frontend/tests/unit/useCanvas.test.js` — tests for: pointerdown starts stroke, pointermove appends points, pointerup finalizes stroke, color/width respected, stroke-eraser removes correct stroke, pixel-eraser carves region
- [ ] T044 [P] [US2] Write `backend/CourseNotebook.Tests/Unit/ElementServiceTests.cs` — tests for: createElement (stroke), updateElement, deleteElement, getElementsForPage
- [ ] T045 [P] [US2] Write `frontend/tests/integration/CanvasPage.test.jsx` — RTL tests for: canvas renders, tool switch updates active tool, auto-save fires after debounce

### Implementation for User Story 2

- [x] T046 [US2] Implement `frontend/src/hooks/useUndoRedo.js` — immutable history array, `push(state)`, `undo()`, `redo()`, `canUndo`, `canRedo`; max 100 history entries
- [x] T047 [US2] Implement `frontend/src/hooks/useCanvas.js` — PointerEvents capture on `<canvas>` ref; RAF draw loop (`requestAnimationFrame`); pencil mode (globalAlpha 0.85, round lineCap); pen mode (constant width, sharp edges); stroke-level eraser (default: remove whole stroke on contact); pixel-level eraser (toggle: carve circular region via `destination-out` composite); calls `useUndoRedo.push` after each stroke
- [x] T048 [US2] Implement `frontend/src/components/Canvas/DrawingCanvas.jsx` — `<canvas>` sized 4000×3000 logical px; CSS `transform: scale(zoom) translate(panX, panY)`; Space+drag panning; scroll-wheel zoom clamped 50%–200%; clamp all interaction to canvas boundary (FR-005)
- [x] T049 [US2] Implement `frontend/src/components/Canvas/ElementOverlay.jsx` — `position: absolute` div sized 4000×3000, same transform as DrawingCanvas; renders structured elements (text, images, stickers, mind map) as children
- [x] T050 [US2] Implement `frontend/src/components/Canvas/CanvasPage.jsx` — composes `DrawingCanvas` + `ElementOverlay`; reads `activePageId` from AppContext; loads elements on mount via `elementApi.getElements(pageId)`
- [x] T051 [P] [US2] Implement `frontend/src/components/Toolbar/ToolButton.jsx` — Bootstrap `<Button>` with pink `.nb-tool-btn.active` class when tool matches AppContext `activeTool`
- [x] T052 [P] [US2] Implement `frontend/src/components/Toolbar/ColorPicker.jsx` — 32-color swatch grid (4 rows × 8 cols) + hex input; updates `activeColor` in AppContext
- [x] T053 [P] [US2] Implement `frontend/src/components/Toolbar/StrokeWidthSlider.jsx` — range input 1–20px; live preview circle; updates `strokeWidth` in AppContext
- [x] T054 [US2] Implement `frontend/src/components/Toolbar/Toolbar.jsx` — pink gradient panel (`nb-toolbar`); tool buttons (Pencil, Pen, Eraser + eraser-mode toggle, Text, Select, MindMap); `ColorPicker`; `StrokeWidthSlider`; save-status badge
- [x] T055 [US2] Implement `backend/CourseNotebook.Api/Services/ElementService.cs` — CRUD for `CanvasElement` using `IRepository<CanvasElement>`; bulk-delete by pageId
- [x] T056 [US2] Implement `backend/CourseNotebook.Api/Endpoints/ElementEndpoints.cs` — map: `GET /api/pages/{id}/elements`, `POST /api/pages/{id}/elements`, `PUT /api/elements/{id}`, `DELETE /api/elements/{id}`, `DELETE /api/pages/{id}/elements`
- [x] T057 [US2] Register element endpoints in `backend/CourseNotebook.Api/Program.cs`
- [x] T058 [US2] Implement `frontend/src/services/elementApi.js` — fetch wrappers: `getElements(pageId)`, `createElement(pageId, payload)`, `updateElement(id, patch)`, `deleteElement(id)`
- [x] T059 [US2] Implement `frontend/src/hooks/useAutoSave.js` — 3-second debounce; dirty-flag tracks unsaved strokes; calls `elementApi.createElement` for new strokes, `elementApi.deleteElement` for erased strokes; exposes `saveStatus` ('idle'|'saving'|'saved'|'error')
- [x] T060 Wire `useAutoSave` into `CanvasPage.jsx` — pass `saveStatus` to `Toolbar.jsx` for status badge display

**Checkpoint**: US2 independently verifiable — draw/erase/undo/redo/persist all work. Run `T044`/`T045` tests: all must pass. Manual test: 60fps confirmed during 10-second continuous stroke.

---

## Phase 5: User Story 3 — Rich Text Areas with Formatting (Priority: P3)

**Goal**: Students place text boxes anywhere on the canvas and format text with fonts, sizes, bold, italic, color.

**Independent Test**: Open a page → double-click canvas → type "Hello World" → select "Hello" → change font, size, color → bold → drag box to new position → refresh → verify text and formatting restored.

### Tests for User Story 3 *(write first — must FAIL before T062)*

- [ ] T061 [P] [US3] Write `frontend/tests/unit/TextBoxElement.test.jsx` — RTL tests for: renders at position, contentEditable active on click, font/size/color/bold/italic applied to selection, drag repositions, resize handle changes dimensions, blur triggers save

### Implementation for User Story 3

- [x] T062 [US3] Implement `frontend/src/components/Canvas/TextBoxElement.jsx` — absolutely positioned `<div contentEditable>`; resize handles (8 anchors); drag-to-reposition via pointer events; applies inline styles (fontFamily, fontSize, color, fontWeight, fontStyle, textDecoration); clamped to 4000×3000 canvas boundary
- [x] T063 [P] [US3] Add font-family `<select>` to `Toolbar.jsx` — 10 options: Georgia, Arial, Courier New, Verdana, Times New Roman, Trebuchet MS, Impact, Palatino, Comic Sans MS, Indie Flower (loaded via `@import url()` in theme.css)
- [x] T064 [P] [US3] Add font-size `<input type="number" min="8" max="200">` to `Toolbar.jsx`
- [x] T065 [P] [US3] Add Bold / Italic / Underline / Strikethrough toggle buttons to `Toolbar.jsx`; use `document.execCommand` or Selection API on the active `TextBoxElement` contentEditable
- [x] T066 [P] [US3] Add text-color and highlight-color pickers to `Toolbar.jsx` (reuse `ColorPicker.jsx`)
- [x] T067 [US3] Wire double-click on `ElementOverlay.jsx` when Text tool active → create new `TextBoxElement` at click coordinates, persist as elementType `text` via `elementApi.createElement`
- [x] T068 [US3] On `TextBoxElement` blur/change: call `elementApi.updateElement(id, { data: {...textPayload}, x, y, width, height })`
- [x] T069 [US3] Restore `text` elements on page load in `CanvasPage.jsx` — render `TextBoxElement` for each element with `elementType === 'text'` from `getElements` response

**Checkpoint**: US3 independently verifiable — place, format, persist, and restore text boxes. Run `T061` tests: all must pass.

---

## Phase 6: User Story 4 — Images & Stickers (Priority: P4)

**Goal**: Students drag-drop images onto the canvas; images auto-compress. Students browse a built-in sticker library and place stickers. All are resizable, rotatable, and deletable.

**Independent Test**: Drag a 5 MB JPEG onto the canvas → verify compressed image appears within 2s → resize and rotate → open sticker panel → place an "Academic" sticker → refresh → verify both elements restored.

### Tests for User Story 4 *(write first — must FAIL before T075)*

- [ ] T070 [P] [US4] Write `backend/CourseNotebook.Tests/Unit/ImageServiceTests.cs` — tests for: reject file > 10 MB, compress 5 MB JPEG to ≤ 2 MB, store SVG as-is, delete removes file from disk, prevent path traversal in fileName
- [ ] T071 [P] [US4] Write `frontend/tests/unit/ImageElement.test.jsx` — RTL tests for: renders at position, corner-drag resizes proportionally, rotate handle rotates, Delete key removes element, triggers save on change

### Implementation for User Story 4

- [x] T072 [US4] Implement `backend/CourseNotebook.Api/Services/ImageService.cs` — validate MIME type server-side (not just extension); reject > 10 MB; compress JPEG/PNG/WebP to ≤ 2 MB using `System.Drawing.Common` or `SkiaSharp`; save to `ImageStoragePath`; sanitize fileName to prevent path traversal
- [x] T073 [US4] Implement `backend/CourseNotebook.Api/Endpoints/ImageEndpoints.cs` — `POST /api/images` (multipart, calls `ImageService.SaveAsync`), `DELETE /api/images/{fileName}`, static file route `/api/images/{fileName}` via `UseStaticFiles` middleware scoped to `ImageStoragePath`
- [x] T074 [US4] Register image endpoints and static file middleware in `backend/CourseNotebook.Api/Program.cs`
- [x] T075 [US4] Implement `frontend/src/services/imageApi.js` — `uploadImage(file)` → POST multipart to `/api/images`, returns `{ fileName }`; `deleteImage(fileName)` → DELETE
- [x] T076 [US4] Implement `frontend/src/components/Canvas/ImageElement.jsx` — `<img>` with corner resize handles (aspect-ratio lock via shift key); rotation handle (pointer drag → CSS `rotate(deg)`); Delete key handler; persists transform on change
- [x] T077 [US4] Add `ondrop` handler to `CanvasPage.jsx` — `e.dataTransfer.files[0]` → `imageApi.uploadImage()` → `elementApi.createElement(pageId, { elementType:'image', data:{fileName}, x, y })` → render `ImageElement`
- [x] T078 [P] [US4] Add file-picker button to `Toolbar.jsx` (`<input type="file" accept="image/*">`) as alternative to drag-drop
- [x] T079 [P] [US4] Bundle sticker SVG assets in `frontend/src/assets/stickers/` — 3 categories: `academic/` (10 SVGs: star, checkmark, lightbulb, book, pencil, calculator, formula, clock, trophy, magnifier), `emotions/` (10 SVGs), `symbols/` (10 SVGs: arrow, heart, warning, etc.); export a `stickerRegistry.js` index
- [x] T080 [US4] Implement `frontend/src/components/Canvas/StickerElement.jsx` — identical to `ImageElement.jsx` but `src` resolved from `stickerRegistry` by name (no server upload needed; SVG inlined)
- [x] T081 [US4] Implement sticker panel as Bootstrap `<Offcanvas>` triggered from `Toolbar.jsx` — category tabs (Academic, Emotions, Symbols); grid of sticker previews; click places sticker at canvas center via `elementApi.createElement` with `elementType:'sticker'`
- [x] T082 [US4] Restore `image` and `sticker` elements on page load in `CanvasPage.jsx`

**Checkpoint**: US4 independently verifiable — drag-drop, compress, stickers, persist, restore. Run `T070`/`T071` tests: all must pass. Verify 5 MB JPEG inserts in < 2s (SC-005).

---

## Phase 7: User Story 5 — Mind Map Builder (Priority: P5)

**Goal**: Students create node-and-arrow mind maps with labeled nodes, styled shapes, auto-layout, and PNG export.

**Independent Test**: Activate MindMap tool → create central node "Study Plan" → add 4 child nodes → label arrows → change node shapes and colors → click Auto-layout (radial) → export PNG → verify PNG downloaded with correct content.

### Tests for User Story 5 *(write first — must FAIL before T089)*

- [ ] T083 [P] [US5] Write `frontend/tests/unit/useMindMap.test.js` — tests for: addNode (returns new node with id), addEdge (validates from/to exist), removeNode (also removes connected edges), updateNodeLabel, autoLayoutRadial (no overlapping nodes), autoLayoutHierarchical
- [ ] T084 [P] [US5] Write `frontend/tests/integration/MindMapCanvas.test.jsx` — RTL tests for: renders SVG, click creates node, click "+" handle creates child node and edge, drag repositions node, edge rereoutes

### Implementation for User Story 5

- [x] T085 [US5] Implement `frontend/src/hooks/useMindMap.js` — state: `{ nodes: [], edges: [] }`; actions: `addNode(label, parentId?)`, `addEdge(fromId, toId, label?)`, `removeNode(id)` (cascades edges), `updateNode(id, patch)`, `updateEdge(id, patch)`, `autoLayoutRadial()`, `autoLayoutHierarchical()` (simple tree BFS + spacing algorithm, no external library)
- [x] T086 [US5] Implement `frontend/src/components/MindMap/MindMapNode.jsx` — SVG `<g>` wrapping shape (`<rect>`, `<circle>`, `<polygon>` for diamond, `<rect rx>` for rounded); fill/border/text color from node state; inline label `<foreignObject>`; drag handle updates node position in `useMindMap`; "+" connector handle appears on hover
- [x] T087 [US5] Implement `frontend/src/components/MindMap/MindMapEdge.jsx` — SVG `<path>` cubic bezier between node centers; arrowhead `<marker>`; recalculates when connected node positions change; inline label via `<text>` at midpoint; click to edit label
- [x] T088 [US5] Implement `frontend/src/components/MindMap/MindMapCanvas.jsx` — SVG element sized 4000×3000, same pan/zoom transform as `DrawingCanvas`; mounts when `activeTool === 'mindmap'`; uses `useMindMap` hook; renders all `MindMapNode` + `MindMapEdge` components
- [x] T089 [US5] Implement `frontend/src/components/MindMap/MindMapToolbar.jsx` — shown when MindMap tool active: node-shape selector (4 shapes), fill/border/text color pickers, "Auto-layout Radial" + "Auto-layout Hierarchical" buttons, "Export PNG" button
- [x] T090 [US5] Implement PNG export in `MindMapCanvas.jsx` — serialize SVG to `Blob` → `URL.createObjectURL` → draw to off-screen `<canvas>` via `drawImage` → `canvas.toDataURL('image/png')` → programmatic download link click
- [x] T091 [US5] Persist mind map: on each `useMindMap` state change (debounced 1s) → serialize `{ nodes, edges }` as JSON → `elementApi.updateElement` (or `createElement` if first save) with `elementType:'mindmap'`
- [x] T092 [US5] Restore mind map on page load in `CanvasPage.jsx` — if element with `elementType === 'mindmap'` exists, hydrate `useMindMap` state from `Data` JSON

**Checkpoint**: US5 independently verifiable — create/connect/style nodes, auto-layout, export PNG. Run `T083`/`T084` tests: all must pass. Verify 20-node mind map drag responds in < 200ms (SC-004).

---

## Phase 8: Export & Import (FR-031, FR-032)

**Goal**: Students can export any notebook as a ZIP and import it back — the primary backup mechanism.

### Tests for Export & Import *(write first — must FAIL before T097)*

- [ ] T093 [P] Write `backend/CourseNotebook.Tests/Unit/ExportServiceTests.cs` — tests for: ZIP contains `notebook.json` at root, ZIP contains all referenced image files in `images/` subfolder, JSON schema matches `notebook.json` spec
- [ ] T094 [P] Write `backend/CourseNotebook.Tests/Unit/ImportServiceTests.cs` — tests for: valid ZIP restores all notebooks/pages/elements, image files written to `ImageStoragePath`, invalid ZIP returns error, duplicate notebook names allowed after import (FR-033)

### Implementation for Export & Import

- [x] T095 Implement `backend/CourseNotebook.Api/Services/ExportService.cs` — query notebook + all pages + all elements; collect referenced image filenames from element JSON blobs; stream ZIP via `System.IO.Compression.ZipArchive` with `notebook.json` + `images/` folder
- [x] T096 Implement `backend/CourseNotebook.Api/Services/ImportService.cs` — open ZIP stream; parse and validate `notebook.json`; assign new GUIDs to all entities (avoid ID collisions); copy `images/` entries to `ImageStoragePath`; insert into DB via `EfRepository`
- [x] T097 Add `GET /api/notebooks/{id}/export` (streams ZIP as `application/zip`) and `POST /api/notebooks/import` (multipart ZIP) to `backend/CourseNotebook.Api/Endpoints/NotebookEndpoints.cs`
- [x] T098 Register export/import endpoints in `backend/CourseNotebook.Api/Program.cs`
- [x] T099 [P] Add "Export" option to `NotebookItem.jsx` right-click context menu — triggers `GET /api/notebooks/{id}/export` download via anchor click
- [x] T100 [P] Add "Import Notebook" button to `Sidebar.jsx` footer — file picker for `.zip` → `POST /api/notebooks/import` → refresh notebook list

**Checkpoint**: Export a notebook, delete it, import the ZIP, verify full restoration with all pages, strokes, text, images.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Keyboard shortcuts, boundary enforcement, error handling, accessibility basics, quality gates.

- [x] T101 [P] Add global keyboard shortcut handler in `frontend/src/App.jsx` — `P`=Pen, `B`=Pencil, `E`=Eraser, `T`=Text, `M`=MindMap, `Ctrl+Z`=Undo, `Ctrl+Y`/`Ctrl+Shift+Z`=Redo, `Escape`=deselect; guard against firing inside `<input>` / `<textarea>` / `contentEditable`
- [x] T102 [P] Add zoom controls to `Toolbar.jsx` — "−" / "+" buttons + percentage display; clamp 50%–200%; sync with `DrawingCanvas` and `ElementOverlay` transform
- [x] T103 [P] Add canvas boundary clamping in `DrawingCanvas.jsx` and `ElementOverlay.jsx` — prevent any element being dragged or drawn outside 0–4000 × 0–3000 bounds (addresses edge case from spec)
- [x] T104 [P] Add save-status badge to `Toolbar.jsx` — show "Saving…" spinner (Bootstrap spinner) while `saveStatus === 'saving'`, "✓ Saved" text when `'saved'`, Bootstrap danger badge on `'error'`
- [x] T105 [P] Add Bootstrap `<Toast>` error notifications in `App.jsx` — triggered for: image upload failure (size exceeded, unsupported type), save failure, import parse error; message includes actionable fix text (Constitution V)
- [x] T106 [P] Add empty-state placeholder in `frontend/src/components/Canvas/CanvasPage.jsx` — shown when no active page selected; pink illustration + "Select or create a notebook to get started" text
- [x] T107 [P] Add `<ErrorBoundary>` wrapper in `frontend/src/App.jsx` — catches unexpected React render errors; displays user-friendly recovery message
- [x] T108 [P] Enable C# nullable reference types in `backend/CourseNotebook.Api/CourseNotebook.Api.csproj`; fix all nullable warnings
- [x] T109 [P] Run ESLint with `max-lines-per-function: 30` rule across all `frontend/src/` files; fix all violations (Constitution I)
- [x] T110 [P] Add SQLite indexes in a new EF Core migration: `Pages(NotebookId)`, `CanvasElements(PageId)`, `CanvasElements(ElementType)` — verify query plans with EXPLAIN QUERY PLAN
- [x] T111 [P] Security audit `backend/CourseNotebook.Api/Endpoints/ImageEndpoints.cs` — confirm server-side MIME type validation (not just file extension), sanitized `fileName` in static file serving, no path traversal possible (OWASP A01/A03)
- [x] T112 Run full backend test suite (`dotnet test`); verify ≥ 90% line coverage on all Service classes
- [x] T113 Run full frontend test suite (`npm test`); verify ≥ 90% line coverage on all hooks and API service files
- [x] T114 [P] Manual smoke test checklist — verify all 8 success criteria (SC-001 through SC-008) against a production build (`dotnet publish` + `npm run build`)

---

## Phase 10: Convergence

*Gaps identified by `/speckit.converge` on 2026-07-06 against spec.md, plan.md, tasks.md, and constitution.md.*

### CRITICAL — Constitution III (TDD NON-NEGOTIABLE)

- [x] T115 Create `frontend/babel.config.cjs` with `@babel/preset-env` + `@babel/preset-react`; add `"test": "jest --testEnvironment jsdom"` script and `jest` config block (`transform`, `moduleNameMapper` for CSS) to `frontend/package.json`; create `frontend/tests/unit/` and `frontend/tests/integration/` directories per Constitution III (missing)
- [x] T116 [P] Write `backend/CourseNotebook.Tests/Unit/NotebookServiceTests.cs` — tests: CreateNotebook persists, RenameNotebook updates name, DeleteNotebook cascades pages, duplicate names allowed; use in-memory SQLite via `UseInMemoryDatabase` per Constitution III (missing) — replaces placeholder T025
- [x] T117 [P] Write `backend/CourseNotebook.Tests/Unit/PageServiceTests.cs` — tests: CreatePage adds to notebook, RenamePage updates, DeletePage removes elements; in-memory SQLite per Constitution III (missing) — replaces placeholder T026
- [x] T118 [P] Write `backend/CourseNotebook.Tests/Unit/ElementServiceTests.cs` — tests: createElement, updateElement, deleteElement, deleteByPage; in-memory SQLite per Constitution III (missing) — replaces placeholder T044
- [x] T119 [P] Write `backend/CourseNotebook.Tests/Unit/ExportServiceTests.cs` — tests: ZIP contains `notebook.json`, images folder populated, missing image skipped gracefully per Constitution III (missing) — replaces placeholder T093
- [x] T120 [P] Write `backend/CourseNotebook.Tests/Unit/ImportServiceTests.cs` — tests: valid ZIP restores entities with new GUIDs, images copied, invalid ZIP throws `InvalidOperationException`, duplicate names allowed per FR-033 (missing) — replaces placeholder T094
- [x] T121 [P] Write `backend/CourseNotebook.Tests/Integration/NotebookEndpointTests.cs` — integration tests for `GET/POST/PUT/DELETE /api/notebooks` and pages using `WebApplicationFactory<Program>` + SQLite in-memory per Constitution III (missing) — replaces placeholder T027
- [x] T122 [P] Write `frontend/tests/unit/useUndoRedo.test.js` — tests: push advances history, undo restores prior state, redo re-applies, max 100 entries drops oldest, clear resets per Constitution III (missing) — replaces placeholder T042
- [x] T123 [P] Write `frontend/tests/unit/useMindMap.test.js` — tests: addNode returns id, addEdge connects, removeNode cascades edges, autoLayoutRadial spaces nodes, autoLayoutHierarchical produces rows per Constitution III (missing) — replaces placeholder T083
- [x] T124 [P] Write `frontend/tests/integration/Sidebar.test.jsx` — RTL tests: empty state renders, "New Notebook" modal opens and creates, rename inline flow, delete confirm modal flow; mock `notebookApi` + `pageApi` per Constitution III (missing) — replaces placeholder T028

### HIGH — Missing components (FR / plan gaps)

- [x] T125 [P] Create `frontend/src/assets/stickers/` directory; add 30 inline SVG sticker files across 3 subdirs (`academic/`, `emotions/`, `symbols/`, 10 each); create `frontend/src/assets/stickers/stickerRegistry.js` exporting `{ academic: [...], emotions: [...], symbols: [...] }` per FR-019 (missing)
- [x] T126 [P] Create `frontend/src/components/Canvas/StickerElement.jsx` — identical behaviour to `ImageElement.jsx`; resolves `src` from `stickerRegistry` by `data.stickerName`; no server upload; movable, resizable, rotatable, Delete-key removable per FR-020 (missing)
- [x] T127 Create `frontend/src/components/MindMap/MindMapToolbar.jsx` — shown when `activeTool === 'mindmap'`; renders node-shape selector (rect/circle/diamond/rounded), fill/border/text color pickers, "Auto-layout Radial" and "Auto-layout Hierarchical" buttons, "Export PNG" button; integrates with `useMindMap` context per FR-025, FR-026 (missing)
- [x] T128 Add text-formatting controls to `frontend/src/components/Toolbar/Toolbar.jsx` when `activeTool === 'text'`: font-family `<select>` (10 fonts), font-size `<input type="number" min="8" max="200">`, Bold/Italic/Underline/Strikethrough toggle buttons, text-color + highlight-color pickers (reuse `ColorPicker`); store selections in AppContext per FR-012, FR-013, FR-014 (missing)
- [x] T129 Add image drag-and-drop to `frontend/src/components/Canvas/CanvasPage.jsx` — `onDragOver` + `onDrop` handlers; `e.dataTransfer.files[0]` → `imageApi.uploadImage()` → `elementApi.createElement(..., elementType:'image')` → append to elements state per FR-017 (missing)
- [x] T130 [P] Add image file-picker button to `frontend/src/components/Toolbar/Toolbar.jsx` — `<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" hidden>` triggered by a toolbar button; same upload + createElement flow as drag-drop (T129) per FR-017 (missing)
- [x] T131 Add sticker panel Bootstrap `<Offcanvas>` triggered from `Toolbar.jsx` — category tabs using `stickerRegistry` categories; sticker grid; on click: `elementApi.createElement(activePageId, { elementType:'sticker', data:{ stickerName, stickerSrc } })` per FR-019 (missing)

### HIGH — Stroke restore on page load (SC-008)

- [x] T132 Wire persisted stroke restore in `frontend/src/components/Canvas/DrawingCanvas.jsx`: accept `initialStrokes` prop (array of stroke objects parsed from elementType=`stroke` elements); call `loadStrokes(initialStrokes)` from `useCanvas` inside a `useEffect` when `initialStrokes` changes; pass parsed strokes from `CanvasPage.jsx` per SC-008 (partial)

### HIGH — Missing .gitignore (T004 false-positive)

- [x] T133 [P] Create `.gitignore` at `notebook/` root with entries: `bin/`, `obj/`, `*.db`, `*.db-shm`, `*.db-wal`, `node_modules/`, `dist/`, `data/images/`, `.env`, `.DS_Store`, `Thumbs.db` per T004 (missing)

### MEDIUM — Boilerplate conflicts with Bootstrap layout

- [x] T134 [P] Replace `frontend/src/App.css` content with empty file (zero rules) — current Vite boilerplate counters and hero styles conflict with Bootstrap `d-flex` layout (unrequested)
- [x] T135 [P] Replace `frontend/src/index.css` with a minimal body reset (`body { margin: 0; padding: 0; }`) — current Vite default CSS conflicts with `--bs-body-bg` override in `theme.css` (partial)

---

## Phase 11: Bug Fixes — Drawing, Text & Mind Map

**Root-cause summary** (discovered during manual testing):

- **Drawing tools blocked**: `ElementOverlay`'s inner wrapper div has `pointerEvents: 'auto'` and spans the full 4000×3000 canvas, sitting above the `<canvas>` element and intercepting every pointer event before it reaches the drawing layer. Fix: set inner div to `pointerEvents: 'none'`; give individual elements their own `pointerEvents: 'auto'`.
- **Text tool no focus**: `TextBoxElement` never calls `.focus()` on mount so the cursor never appears; `e.preventDefault()` in the drag-start handler also blocks browser focus. Fix: auto-focus contentEditable on creation; skip `preventDefault` when clicking the text area.
- **Mind map nodes jump on drag**: `MindMapNode` drag handler records and replays raw viewport pixel coordinates (`clientX/Y`), but nodes live inside a `scale(zoom) translate(panX, panY)` CSS container. No conversion applied → nodes jump to viewport origin. Fix: convert viewport → canvas space using `(clientX − panX) / zoom`. Additionally, `persist()` reads `map.nodes` immediately after `dispatch()`, getting stale pre-dispatch state; fix by persisting inside a `useEffect` that fires after state settles.

- [x] T136 Fix `frontend/src/components/Canvas/ElementOverlay.jsx` — change inner wrapper div from `pointerEvents: 'auto'` to `pointerEvents: 'none'`; pointer events now fall through to the `<canvas>` below for drawing tools (bug: drawing blocked)
- [x] T137 [P] Add `pointerEvents: 'auto'` explicitly to the outermost `<div>` of `frontend/src/components/Canvas/TextBoxElement.jsx`, `ImageElement.jsx`, and `StickerElement.jsx` so they remain interactive after the ElementOverlay inner div change (depends on T136)
- [x] T138 Fix `frontend/src/components/Canvas/TextBoxElement.jsx` — add `useEffect` that calls `divRef.current.focus()` when `data.content` is empty (newly-created box); remove `e.preventDefault()` from `onMouseDown` so browser focus lands on the contentEditable when clicking the text area (bug: text tool no focus / no keyboard input)
- [x] T139 Fix `frontend/src/components/MindMap/MindMapNode.jsx` — convert drag coordinates from viewport space to canvas space: accept `zoom`, `panX`, `panY` props; compute `startX = (e.clientX − panX) / zoom − x` and on each move `onMove(id, (me.clientX − panX) / zoom − startX, (me.clientY − panY) / zoom − startY)` (bug: mind map nodes jump on drag)
- [x] T140 Fix `frontend/src/components/MindMap/MindMapCanvas.jsx` — pass `zoom`, `panX`, `panY` down to each `<MindMapNode>`; replace immediate `persist(map.nodes, map.edges)` calls with a `useEffect(() => { persist(...) }, [map.nodes, map.edges])` so persist fires after React state has settled (bug: stale state persisted; nodes jump)

```
Phase 1 (T001–T007)
  └─► Phase 2 (T008–T024)
        └─► Phase 3 US1 (T025–T041)  ← MVP: deliver here
              ├─► Phase 4 US2 (T042–T060)
              │     ├─► Phase 5 US3 (T061–T069)
              │     ├─► Phase 6 US4 (T070–T082)
              │     └─► Phase 7 US5 (T083–T092)
              └─► Phase 8 Export (T093–T100) ← depends on US1 + US4 images
Phase 9 Polish (T101–T114) ← runs after all feature phases
```

US3, US4, and US5 can be implemented **in parallel** once US2 (DrawingCanvas + ElementService) is complete, as they each touch different component files.

---

## Parallel Execution Examples

**After Phase 2 completes, these task groups can run in parallel:**

| Stream A (Backend US1) | Stream B (Frontend US1 shell) |
|------------------------|-------------------------------|
| T025 NotebookServiceTests | T028 Sidebar.test.jsx |
| T029 NotebookService | T034 notebookApi.js |
| T030 PageService | T035 pageApi.js |
| T031 NotebookEndpoints | T036 NotebookItem.jsx |
| T032 PageEndpoints | T037 PageItem.jsx |

**After Phase 4 (US2) completes, these can run in parallel:**

| Stream A (US3 Text) | Stream B (US4 Images) | Stream C (US5 MindMap) |
|---------------------|-----------------------|------------------------|
| T061 TextBox tests | T070 ImageService tests | T083 useMindMap tests |
| T062 TextBoxElement | T072 ImageService | T085 useMindMap hook |
| T063–T066 Toolbar fmt | T076 ImageElement | T086 MindMapNode |
| T067–T069 wire + persist | T077–T082 wire + stickers | T087–T092 canvas + persist |

---

## Implementation Strategy

| Phase | Delivers | Scope |
|-------|----------|-------|
| Phases 1–2 | Green build, DB migrated | Infrastructure |
| Phase 3 | **MVP** — organize notebooks | US1 P1 |
| Phase 4 | Draw + persist strokes | US2 P2 |
| Phase 5 | Typed + formatted text | US3 P3 |
| Phase 6 | Images + stickers | US4 P4 |
| Phase 7 | Mind maps | US5 P5 |
| Phase 8 | Backup / restore | Export |
| Phase 9 | Polished, shippable | QA |

**Total tasks**: 114 · **Parallelizable tasks**: 52 · **Test tasks (TDD gates)**: 22

**Suggested MVP scope**: Complete Phases 1–3 (T001–T041) for a shippable notebook organizer with full persistence before adding canvas features.





