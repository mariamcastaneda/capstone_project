# Feature Specification: Course Notebook App

**Feature Branch**: `001-course-notebook-app`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "Interactive notebook for organizing course notes with canvas, drawing tools, text formatting, and mind maps"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Course & Notebook Management (Priority: P1)

A student opens the app and creates a new notebook for their "Data Structures" course. They create additional notebooks for other courses, rename them, reorder them in the sidebar, and later delete one they no longer need. All notebooks persist across sessions.

**Why this priority**: Without the ability to organize notes by course, the entire value proposition of the app collapses. Everything else is built on top of this structure.

**Independent Test**: Can be fully tested by creating, renaming, reordering, and deleting notebooks in the sidebar without touching any canvas feature, and delivers a working course-organization MVP.

**Acceptance Scenarios**:

1. **Given** the app is open with no notebooks, **When** the user clicks "New Notebook" and enters "Data Structures", **Then** a notebook named "Data Structures" appears in the sidebar and opens to a blank first page.
2. **Given** a notebook exists, **When** the user right-clicks it and selects "Rename", **Then** the notebook's name is updated everywhere it appears.
3. **Given** multiple notebooks exist, **When** the user drags a notebook in the sidebar, **Then** the order is updated and persisted after refresh.
4. **Given** a notebook is selected, **When** the user creates a new page within it, **Then** a new blank canvas page is added to that notebook.
5. **Given** a notebook exists, **When** the user deletes it, **Then** a confirmation dialog appears; on confirm, the notebook and all its pages are removed.

---

### User Story 2 - Free-Form Canvas with Drawing Tools (Priority: P2)

A student opens a notebook page and uses the pencil tool to sketch a diagram. They switch to the pen tool for clean lines, use the eraser to fix mistakes, and use the color picker to color-code different concepts. They can draw anywhere on the infinite canvas by panning.

**Why this priority**: The canvas and drawing tools are the core differentiator. A canvas-only MVP already delivers significant value for visual learners.

**Independent Test**: Can be fully tested by opening a page, switching between pencil/pen/eraser, drawing strokes in different colors, and panning the canvas — all without text or mind-map features.

**Acceptance Scenarios**:

1. **Given** a page is open, **When** the user selects the Pencil tool and drags on the canvas, **Then** a pressure-sensitive freehand stroke is drawn with soft edges.
2. **Given** a page is open, **When** the user selects the Pen tool and draws, **Then** a smooth vector stroke is drawn with consistent width.
3. **Given** a stroke exists, **When** the user selects the Eraser tool and moves it over the stroke, **Then** the stroke is erased in the area touched.
4. **Given** the Pen tool is active, **When** the user selects a color from the color palette, **Then** subsequent strokes are drawn in that color.
5. **Given** the canvas has content, **When** the user holds Space and drags (or uses two-finger scroll), **Then** the viewport pans smoothly revealing more canvas area.
6. **Given** a stroke is drawn, **When** the user presses Ctrl+Z, **Then** the stroke is undone; Ctrl+Y/Ctrl+Shift+Z redoes it.

---

### User Story 3 - Rich Text Areas with Formatting (Priority: P3)

A student double-clicks anywhere on the canvas to place a text box. They type lecture notes and format words with bold, italic, different font families, font sizes, and text colors. They resize and reposition the text box freely.

**Why this priority**: Many notes are primarily text. Keyboard-based text input with formatting covers the majority of students' note-taking needs and pairs naturally with drawings.

**Independent Test**: Can be fully tested by placing text boxes, typing content, applying formatting options, and repositioning the boxes — without using drawing or mind-map tools.

**Acceptance Scenarios**:

1. **Given** the Text tool is active, **When** the user clicks on the canvas, **Then** a resizable text box is created at that position with a blinking cursor.
2. **Given** a text box has text selected, **When** the user picks a font family from the toolbar, **Then** the selected text changes to that font.
3. **Given** a text box has text selected, **When** the user picks a font size, **Then** the text resizes accordingly.
4. **Given** a text box has text selected, **When** the user clicks Bold (or Ctrl+B), **Then** the selected text becomes bold.
5. **Given** a text box has text selected, **When** the user picks a text color, **Then** the selected text changes to that color.
6. **Given** a text box exists, **When** the user drags its position handle, **Then** it moves freely on the canvas and its new position is persisted.

---

### User Story 4 - Images & Stickers (Priority: P4)

A student inserts a screenshot of a formula by dragging an image file onto the canvas. They also browse a sticker panel and place a "important!" sticker next to a key concept. Both can be resized, rotated, and repositioned.

**Why this priority**: Visual assets and stickers enrich notes but are supplementary to the core drawing and text experience.

**Independent Test**: Can be tested by dropping an image file onto the canvas and verifying it appears as a movable, resizable element, plus browsing and placing a sticker.

**Acceptance Scenarios**:

1. **Given** a page is open, **When** the user drags an image file (PNG, JPEG, WebP, SVG) onto the canvas, **Then** the image is placed as a canvas element at the drop position.
2. **Given** an image element exists, **When** the user drags a corner handle, **Then** the image scales proportionally.
3. **Given** an image element is selected, **When** the user rotates the rotation handle, **Then** the image rotates and the angle is persisted.
4. **Given** the sticker panel is open, **When** the user clicks a sticker, **Then** it is placed on the canvas and can be moved, scaled, and rotated.
5. **Given** an image or sticker is selected, **When** the user presses Delete, **Then** the element is removed from the canvas.

---

### User Story 5 - Mind Map Builder (Priority: P5)

A student switches to the Mind Map section within a notebook page. They place a central concept node and branch out child nodes connected by arrows. They label each node and arrow, rearrange the layout, and change node shapes and colors to categorize ideas visually.

**Why this priority**: Mind maps are a specialized and self-contained feature. They add high value for idea organization but are the most complex piece, so they come last in priority.

**Independent Test**: Can be fully tested by creating a mind map with at least 5 connected nodes, labeling them, and rearranging the layout — isolated on its own canvas layer without interfering with other tools.

**Acceptance Scenarios**:

1. **Given** the Mind Map tool is active, **When** the user clicks on the canvas, **Then** a central node is created with an editable label.
2. **Given** a node exists, **When** the user hovers it and clicks the "+" handle on an edge, **Then** a new child node is created and connected by an arrow.
3. **Given** two nodes are connected, **When** the user clicks the arrow, **Then** a label field appears on the arrow and is editable.
4. **Given** a node is selected, **When** the user picks a shape from the toolbar (rectangle, circle, diamond, rounded rectangle), **Then** the node changes to that shape.
5. **Given** a node is selected, **When** the user picks a fill color, **Then** the node fills with that color.
6. **Given** a node is dragged, **When** it is released in a new position, **Then** all connected arrows reroute and the layout is updated.
7. **Given** a mind map exists, **When** the user clicks "Auto-layout", **Then** the nodes rearrange into a clean hierarchical or radial layout.

---

### Edge Cases

- What happens when the user draws on a page that is currently saving — is data loss prevented?
- What happens when a user tries to drag a canvas element outside the 4000×3000 canvas boundary — is it clamped to the edge?
- How does the canvas handle images larger than 10 MB? Images exceeding 10 MB are rejected with a clear error message. JPEG and PNG files up to 10 MB are accepted and auto-compressed by the backend to ≤ 2 MB before saving; SVG and GIF files are stored as-is.
- What happens if the user creates a circular connection in the mind map (A → B → A)?
- How does undo/redo interact across switching between canvas tools and text editing?
- Duplicate notebook and page names are explicitly allowed; identity is always the internal GUID, never the display name.
- How does the app behave if local storage is full and a save is attempted?
- What is the maximum number of pages per notebook before performance degrades?
- What happens if a font loaded from a custom source fails to load?

---

## Requirements *(mandatory)*

### Functional Requirements

**Notebook & Organization**
- **FR-001**: Users MUST be able to create, rename, reorder, and delete notebooks, each representing a course or class.
- **FR-002**: Users MUST be able to create, rename, reorder, and delete pages within a notebook.
- **FR-003**: The system MUST persist all notebooks, pages, and their contents across browser sessions (local storage or backend).
- **FR-004**: Users MUST be able to duplicate an existing page or notebook.

**Canvas & Drawing Tools**
- **FR-005**: Each page canvas MUST be a fixed-size workspace of 4000×3000 px (logical units). Users pan the viewport by holding Space+drag or using two-finger scroll; zoom is supported (50%–200% range). No content can be placed outside the 4000×3000 boundary.
- **FR-006**: Users MUST be able to draw freehand strokes with a Pencil tool (soft, pressure-like edges) and a Pen tool (smooth, consistent-width strokes).
- **FR-007**: Users MUST be able to erase strokes with an Eraser tool. The default mode is **stroke-level** — clicking or dragging over a stroke removes the entire stroke instantly. A **pixel-level** mode (carves a circular region from strokes) MUST be available as a toggle button in the toolbar. The active eraser mode is shown in the toolbar.
- **FR-008**: Users MUST be able to select a stroke color from a palette with at least 32 preset colors plus a custom hex/HSL color picker.
- **FR-009**: Users MUST be able to adjust stroke width/thickness for both Pencil and Pen tools.
- **FR-010**: The system MUST support unlimited undo/redo for all canvas operations within a session.

**Text Areas**
- **FR-011**: Users MUST be able to place free-floating text boxes anywhere on the canvas.
- **FR-012**: Text boxes MUST support at least 10 font families (serif, sans-serif, monospace, handwritten styles).
- **FR-013**: Users MUST be able to set font size (range: 8pt – 200pt), font weight (normal/bold), italic, underline, and strikethrough per text selection.
- **FR-014**: Users MUST be able to set text color and highlight color per text selection.
- **FR-015**: Text boxes MUST be resizable by dragging handles and repositionable by dragging the box.
- **FR-016**: Users MUST be able to copy and paste text (including from external sources) into text boxes, preserving plain text; rich paste is optional.

**Images & Stickers**
- **FR-017**: Users MUST be able to insert images by drag-and-drop or file picker; supported formats: PNG, JPEG, WebP, SVG, GIF. Files exceeding 10 MB MUST be rejected with an actionable error message. JPEG, PNG, and WebP files up to 10 MB MUST be auto-compressed by the backend to ≤ 2 MB before saving to disk. SVG and GIF files MUST be stored as-is.
- **FR-018**: Inserted images MUST be placeable, resizable (with aspect-ratio lock option), and rotatable on the canvas.
- **FR-019**: The system MUST provide a built-in sticker library with at least 3 categories (e.g., Academic, Emotions, Symbols) and at least 30 stickers total.
- **FR-020**: Stickers MUST behave identically to images (movable, resizable, rotatable, deletable).

**Mind Map Tool**
- **FR-021**: The system MUST provide a dedicated Mind Map tool mode accessible from the toolbar.
- **FR-022**: Users MUST be able to create, label, and delete nodes; node shapes MUST include rectangle, circle, diamond, and rounded rectangle.
- **FR-023**: Users MUST be able to connect nodes with directed arrows; arrows MUST be labeled.
- **FR-024**: Arrows MUST reroute automatically when connected nodes are moved.
- **FR-025**: Users MUST be able to assign fill color, border color, and text color to individual nodes.
- **FR-026**: The system MUST provide an Auto-layout action (hierarchical and radial options) for the mind map.
- **FR-027**: Mind map content MUST be exportable as a PNG image.

**General UX**
- **FR-028**: The toolbar MUST remain accessible without scrolling and highlight the active tool at all times.
- **FR-029**: The system MUST support keyboard shortcuts for the most common tools (e.g., P = Pen, B = Pencil, E = Eraser, T = Text, M = Mind Map, Ctrl+Z/Y = Undo/Redo).
- **FR-030**: All canvas content MUST be auto-saved no later than 5 seconds after the last change.
- **FR-031**: Users MUST be able to export a selected notebook as a ZIP archive containing a `notebook.json` file (full metadata and element data) plus all referenced image files in an `images/` subfolder.
- **FR-032**: Users MUST be able to import a previously exported notebook ZIP back into the app, restoring all notebooks, pages, and canvas elements exactly as exported.
- **FR-033**: Notebook and page names are display labels only; duplicate names MUST be allowed at all scopes. Identity is always the internal GUID. No uniqueness validation is performed on name fields.

### Key Entities

- **Course/Notebook**: Top-level container representing a course or class; has a name, color tag, icon, creation date, and ordered list of Pages.
- **Page**: A single canvas within a Notebook; has a name, creation date, and an ordered collection of CanvasElements.
- **CanvasElement**: Abstract base for anything on the canvas; has position (x, y), z-order, and dimensions. Subtypes: DrawingStroke, TextBox, ImageElement, StickerElement, MindMapLayer.
- **DrawingStroke**: A sequence of points with tool type (pencil/pen), color, and width.
- **TextBox**: A bounded text container with font settings, text content (as formatted runs), and transform (position, size, rotation).
- **ImageElement**: A reference to stored image data with transform (position, size, rotation).
- **MindMapLayer**: A container holding MindMapNodes and MindMapEdges for one mind map on a page.
- **MindMapNode**: A node with label, shape, fill color, border color, text color, and position.
- **MindMapEdge**: A directed connection between two MindMapNodes with an optional label.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can create a new notebook, add 3 pages, and place content on each page within 3 minutes from first launch.
- **SC-002**: Drawing a 10-second continuous freehand stroke anywhere on the 4000×3000 canvas produces no visible frame drops (target ≥ 60 fps) on a mid-range laptop.
- **SC-003**: Auto-save completes within 5 seconds of the last user interaction with zero data loss on browser refresh.
- **SC-004**: A mind map with 20 nodes and 25 edges renders and responds to drag within 200ms on a mid-range device.
- **SC-005**: Inserting a 5 MB JPEG image (which compresses to ≤ 2 MB) onto the canvas completes (image visible and interactive) within 2 seconds including backend compression.
- **SC-006**: The app loads to a usable state (sidebar + blank canvas visible) within 2 seconds on a standard broadband connection.
- **SC-007**: 100% of defined keyboard shortcuts function correctly with no conflicts across all tool modes.
- **SC-008**: All content (notebooks, pages, drawings, text) is fully restored after a hard browser refresh with no data loss.

---

## Assumptions

- The app is a web application running in a modern desktop browser (Chrome, Firefox, Edge latest two versions); mobile support is out of scope for v1.
- A tablet/stylus device is a stretch goal for v1; pressure sensitivity is implemented via Pointer Events API where available, but mouse input is the primary target.
- User authentication and multi-user collaboration are out of scope for v1; all data is stored locally (IndexedDB or localStorage) on the user's machine.
- Cloud sync / backend persistence is a v2 feature; v1 operates fully offline.
- The sticker library ships as bundled SVG assets; no third-party sticker CDN integration is required for v1.
- PDF export is out of scope for v1. Supported exports: mind-map PNG (FR-027) and full notebook ZIP (FR-031). ZIP export is the primary backup mechanism given fully offline operation.
- No real-time collaboration or shared notebooks are required.
- Accessibility (WCAG 2.1 AA) is a v2 goal; basic keyboard navigation for non-canvas UI (sidebar, toolbar) is required in v1.

---

## Clarifications

### Session 2026-07-06

- Q: What is the canvas page size model — truly infinite, large fixed canvas, or fixed paper size? → A: Large fixed canvas, 4000×3000 px logical units, with pan (Space+drag / two-finger scroll) and zoom (50%–200%). No content outside the boundary.
- Q: Should the app support notebook export for backup/sharing? → A: Yes — export one notebook as a ZIP (JSON metadata + image files), importable back into the app. PDF export is out of scope for v1.
- Q: Are duplicate notebook or page names allowed? → A: Yes — names are display labels only; identity is the internal GUID. No uniqueness enforcement at any scope.
- Q: What is the maximum image size and compression policy? → A: Max 10 MB accepted; JPEG/PNG/WebP auto-compressed by backend to ≤ 2 MB; SVG and GIF stored as-is; files over 10 MB rejected with an error.
- Q: What is the default eraser behavior — stroke-level or pixel-level? → A: Stroke-level by default (removes entire stroke on contact); pixel-level available as a toolbar toggle.

