# Multi-Section Screen Themes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the single-content food screen system with a multi-section layout system where each screen has 1-6 independently scheduled sections.

**Architecture:** New layout registry defines 8 CSS grid layouts. Each screen picks a layout, gets N sections, each section has its own time slots and content (menu/image/video). New visual styles registry (6 styles) replaces the old 12-theme system. Gallery renderer becomes a grid of independent section renderers.

**Tech Stack:** React 19, Vite, Tailwind CSS, lucide-react, localStorage, no test framework.

**Design Doc:** `docs/plans/2026-03-10-multi-section-screen-themes-design.md`

**Verification:** `npm run lint && npm run build` after each task. Manual browser testing for UI tasks.

---

### Task 1: Create Layout Theme Registry

**Files:**
- Create: `src/components/gallery/themes/layoutRegistry.js`

**Step 1: Create the layout registry file**

```javascript
import { LayoutGrid, Columns, Rows, PanelLeft, Columns3, Grid2x2, LayoutDashboard, PanelLeftDashed } from 'lucide-react';

export const LAYOUT_THEMES = {
  'layout-1': {
    id: 'layout-1',
    label: 'Full Screen',
    description: 'Single block fills entire screen',
    icon: LayoutGrid,
    sections: 1,
    grid: { cols: '1fr', rows: '1fr' },
    areas: [
      { id: 'section-1', label: 'Main', gridArea: '1 / 1 / 2 / 2' }
    ]
  },
  'layout-2': {
    id: 'layout-2',
    label: 'Side by Side',
    description: '60% left + 40% right',
    icon: Columns,
    sections: 2,
    grid: { cols: '3fr 2fr', rows: '1fr' },
    areas: [
      { id: 'section-1', label: 'Left (60%)', gridArea: '1 / 1 / 2 / 2' },
      { id: 'section-2', label: 'Right (40%)', gridArea: '1 / 2 / 2 / 3' }
    ]
  },
  'layout-3': {
    id: 'layout-3',
    label: 'Top & Bottom',
    description: 'Stacked top and bottom',
    icon: Rows,
    sections: 2,
    grid: { cols: '1fr', rows: '1fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Top', gridArea: '1 / 1 / 2 / 2' },
      { id: 'section-2', label: 'Bottom', gridArea: '2 / 1 / 3 / 2' }
    ]
  },
  'layout-4': {
    id: 'layout-4',
    label: 'Main + Side Stack',
    description: '1 large left + 2 stacked right',
    icon: PanelLeft,
    sections: 3,
    grid: { cols: '3fr 2fr', rows: '1fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Left (large)', gridArea: '1 / 1 / 3 / 2' },
      { id: 'section-2', label: 'Top Right', gridArea: '1 / 2 / 2 / 3' },
      { id: 'section-3', label: 'Bottom Right', gridArea: '2 / 2 / 3 / 3' }
    ]
  },
  'layout-5': {
    id: 'layout-5',
    label: 'Three Columns',
    description: '3 equal columns',
    icon: Columns3,
    sections: 3,
    grid: { cols: '1fr 1fr 1fr', rows: '1fr' },
    areas: [
      { id: 'section-1', label: 'Left', gridArea: '1 / 1 / 2 / 2' },
      { id: 'section-2', label: 'Center', gridArea: '1 / 2 / 2 / 3' },
      { id: 'section-3', label: 'Right', gridArea: '1 / 3 / 2 / 4' }
    ]
  },
  'layout-6': {
    id: 'layout-6',
    label: 'Quad Grid',
    description: '2x2 equal grid',
    icon: Grid2x2,
    sections: 4,
    grid: { cols: '1fr 1fr', rows: '1fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Top Left', gridArea: '1 / 1 / 2 / 2' },
      { id: 'section-2', label: 'Top Right', gridArea: '1 / 2 / 2 / 3' },
      { id: 'section-3', label: 'Bottom Left', gridArea: '2 / 1 / 3 / 2' },
      { id: 'section-4', label: 'Bottom Right', gridArea: '2 / 2 / 3 / 3' }
    ]
  },
  'layout-7': {
    id: 'layout-7',
    label: 'Dashboard',
    description: 'Large left + 2 center + 2 right',
    icon: LayoutDashboard,
    sections: 5,
    grid: { cols: '2fr 1fr 1fr', rows: '1fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Left (large)', gridArea: '1 / 1 / 3 / 2' },
      { id: 'section-2', label: 'Center Top', gridArea: '1 / 2 / 2 / 3' },
      { id: 'section-3', label: 'Center Bottom', gridArea: '2 / 2 / 3 / 3' },
      { id: 'section-4', label: 'Right Top', gridArea: '1 / 3 / 2 / 4' },
      { id: 'section-5', label: 'Right Bottom', gridArea: '2 / 3 / 3 / 4' }
    ]
  },
  'layout-8': {
    id: 'layout-8',
    label: 'Wide + Stack',
    description: 'Large left + 2 middle + 3 right (slim)',
    icon: PanelLeftDashed,
    sections: 6,
    grid: { cols: '2fr 1fr 1fr', rows: '1fr 1fr 1fr' },
    areas: [
      { id: 'section-1', label: 'Left (large)', gridArea: '1 / 1 / 4 / 2' },
      { id: 'section-2', label: 'Middle Top', gridArea: '1 / 2 / 2 / 3' },
      { id: 'section-3', label: 'Middle Bottom', gridArea: '2 / 2 / 4 / 3' },
      { id: 'section-4', label: 'Right Top', gridArea: '1 / 3 / 2 / 4' },
      { id: 'section-5', label: 'Right Middle', gridArea: '2 / 3 / 3 / 4' },
      { id: 'section-6', label: 'Right Bottom', gridArea: '3 / 3 / 4 / 4' }
    ]
  }
};

export const VALID_LAYOUT_IDS = Object.keys(LAYOUT_THEMES);

export const getLayoutTheme = (id) => LAYOUT_THEMES[id] || LAYOUT_THEMES['layout-1'];

export const buildEmptySections = (layoutId) => {
  const layout = getLayoutTheme(layoutId);
  return layout.areas.map(area => ({
    id: area.id,
    label: area.label,
    defaultContent: { type: 'menu', menuId: '', visualStyle: 'card-grid' },
    timeSlots: []
  }));
};
```

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/gallery/themes/layoutRegistry.js
git commit -m "feat: add layout theme registry with 8 grid layouts"
```

---

### Task 2: Create Visual Styles Registry

**Files:**
- Create: `src/components/gallery/themes/visualStyleRegistry.js`
- Modify: `src/components/gallery/themes/themeRegistry.js` (will be deleted later, keep for now)

**Step 1: Create visual styles registry**

This file defines the 6 visual styles for menu rendering in sections. Each style exports metadata and an ItemRenderer component. The actual ItemRenderer components will be built in Task 7 — for now, define metadata only.

```javascript
import { LayoutGrid, Sparkles, List, Image, BookOpen, Minus } from 'lucide-react';

export const VISUAL_STYLES = {
  'card-grid': {
    id: 'card-grid',
    label: 'Card Grid',
    description: 'Cards with circular images, clean layout',
    icon: LayoutGrid
  },
  'elegant': {
    id: 'elegant',
    label: 'Elegant',
    description: 'Gold accents, script fonts, premium feel',
    icon: Sparkles
  },
  'compact': {
    id: 'compact',
    label: 'Compact List',
    description: 'Dense 2-column list, max items visible',
    icon: List
  },
  'catalog': {
    id: 'catalog',
    label: 'Catalog',
    description: 'Full-bleed images with overlay text',
    icon: Image
  },
  'menu-board': {
    id: 'menu-board',
    label: 'Menu Board',
    description: 'Chalkboard aesthetic, dotted price lines',
    icon: BookOpen
  },
  'minimal-rows': {
    id: 'minimal-rows',
    label: 'Minimal Rows',
    description: 'Clean horizontal rows, accent bar',
    icon: Minus
  }
};

export const VALID_VISUAL_STYLE_IDS = Object.keys(VISUAL_STYLES);

export const getVisualStyle = (id) => VISUAL_STYLES[id] || VISUAL_STYLES['card-grid'];
```

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/gallery/themes/visualStyleRegistry.js
git commit -m "feat: add visual styles registry with 6 menu rendering styles"
```

---

### Task 3: Update Mock Data for New Screen Model

**Files:**
- Modify: `src/data/mockData.js:311-403` (replace `initialFoodScreens`)

**Step 1: Replace the `initialFoodScreens` array (lines 311-403)**

Replace with new data model using sections. Create 2 sample screens:
- Screen 1: `layout-4` (3 sections) — Main dining hall with breakfast/lunch/dinner scheduling
- Screen 2: `layout-1` (1 section) — Simple cafeteria with single menu

Each screen must follow the new data shape from the design doc: `layoutTheme`, `backgroundType`, `backgroundMedia`, `backgroundColor`, `sections[]` with `defaultContent` and `timeSlots[]`.

Keep the existing SVG background media strings. Remove fields: `theme`, `defaultMenuId`, `timeSlots` (top-level), `foregroundMedia`, `customMessages`, `showPrices`, `transitionDuration`, `slideDelay`.

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: May fail due to downstream references — that's OK, will be fixed in subsequent tasks.

**Step 3: Commit**

```bash
git add src/data/mockData.js
git commit -m "feat: update food screen seed data to multi-section model"
```

---

### Task 4: Update Validators for New Screen Model

**Files:**
- Modify: `src/utils/validators.js:93-127` (rewrite `validateFoodScreen`)
- Modify: `src/utils/validators.js` (update imports — remove `VALID_THEME_IDS` from themeRegistry, add imports from new registries)

**Step 1: Update imports at top of file**

Replace the themeRegistry import with:
```javascript
import { VALID_LAYOUT_IDS } from '../components/gallery/themes/layoutRegistry';
import { VALID_VISUAL_STYLE_IDS } from '../components/gallery/themes/visualStyleRegistry';
```

**Step 2: Rewrite `validateFoodScreen` (lines 93-127)**

New validation logic:
```javascript
export const validateFoodScreen = (screenData) => {
  const errors = {};

  if (!screenData.title || screenData.title.trim().length === 0) {
    errors.title = 'Screen title is required';
  }

  if (!screenData.screenId || screenData.screenId.trim().length === 0) {
    errors.screenId = 'Screen ID is required';
  }

  if (!screenData.layoutTheme || !VALID_LAYOUT_IDS.includes(screenData.layoutTheme)) {
    errors.layoutTheme = 'Please select a valid layout';
  }

  if (screenData.backgroundType !== 'color' && !screenData.backgroundMedia) {
    errors.backgroundMedia = 'Background image/video is required';
  }

  if (screenData.backgroundType === 'color' && !screenData.backgroundColor) {
    errors.backgroundColor = 'Background color is required';
  }

  // Validate each section
  const sectionErrors = [];
  if (screenData.sections && screenData.sections.length > 0) {
    screenData.sections.forEach((section, idx) => {
      const se = {};

      // Validate default content
      if (!section.defaultContent || !section.defaultContent.type) {
        se.defaultContent = 'Default content is required';
      } else if (section.defaultContent.type === 'menu') {
        if (!section.defaultContent.menuId) {
          se.defaultContent = 'Please select a default menu';
        }
        if (!section.defaultContent.visualStyle || !VALID_VISUAL_STYLE_IDS.includes(section.defaultContent.visualStyle)) {
          se.defaultContentStyle = 'Please select a visual style';
        }
      } else if ((section.defaultContent.type === 'image' || section.defaultContent.type === 'video') && !section.defaultContent.media) {
        se.defaultContent = 'Please upload media for default content';
      }

      // Validate time slots — no overlaps within same section
      if (section.timeSlots && section.timeSlots.length > 0) {
        section.timeSlots.forEach((slot, slotIdx) => {
          if (!slot.startTime || !slot.endTime) {
            se[`timeSlot_${slotIdx}_time`] = 'Start and end time are required';
          }
          if (!slot.daysOfWeek || slot.daysOfWeek.length === 0) {
            se[`timeSlot_${slotIdx}_days`] = 'At least one day is required';
          }
          if (!slot.content || !slot.content.type) {
            se[`timeSlot_${slotIdx}_content`] = 'Content is required for each time slot';
          } else if (slot.content.type === 'menu' && !slot.content.menuId) {
            se[`timeSlot_${slotIdx}_content`] = 'Please select a menu';
          } else if ((slot.content.type === 'image' || slot.content.type === 'video') && !slot.content.media) {
            se[`timeSlot_${slotIdx}_content`] = 'Please upload media';
          }
        });

        // Check for overlaps within this section
        const overlaps = checkSectionTimeSlotOverlaps(section.timeSlots);
        if (overlaps.length > 0) {
          se.timeSlotOverlaps = 'Time slots must not overlap within the same section';
        }
      }

      if (Object.keys(se).length > 0) {
        sectionErrors[idx] = se;
      }
    });
  }

  if (sectionErrors.some(e => e)) {
    errors.sections = sectionErrors;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

**Step 3: Add `checkSectionTimeSlotOverlaps` helper** (near the existing `checkTimeSlotOverlaps`)

This reuses the existing overlap detection logic from `checkTimeSlotOverlaps` but operates on section-level time slots. Check if any two slots in the same section share a day AND have overlapping time ranges. Return array of overlap descriptions.

```javascript
export const checkSectionTimeSlotOverlaps = (timeSlots) => {
  const overlaps = [];
  for (let i = 0; i < timeSlots.length; i++) {
    for (let j = i + 1; j < timeSlots.length; j++) {
      const a = timeSlots[i];
      const b = timeSlots[j];
      const sharedDays = a.daysOfWeek.filter(d => b.daysOfWeek.includes(d));
      if (sharedDays.length === 0) continue;
      if (isTimeOverlapping(a.startTime, a.endTime, b.startTime, b.endTime)) {
        overlaps.push({ slotA: i, slotB: j, days: sharedDays });
      }
    }
  }
  return overlaps;
};
```

Also add the `isTimeOverlapping` helper if it doesn't exist (check existing code — the current `checkTimeSlotOverlaps` function likely has this logic inline; extract it).

**Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: PASS (or warnings about unused old imports — fix them)

**Step 5: Commit**

```bash
git add src/utils/validators.js
git commit -m "feat: rewrite food screen validation for multi-section model"
```

---

### Task 5: Update DataContext for New Screen Model

**Files:**
- Modify: `src/context/DataContext.jsx:43-75` (food screen initialization + migration)
- Modify: `src/context/DataContext.jsx:395-426` (CRUD functions)

**Step 1: Replace food screen initialization (lines 43-75)**

Remove the legacy theme migration and old unified screens migration. Replace with:
```javascript
const [foodScreens, setFoodScreens] = useState(() => {
  const saved = localStorage.getItem('canteen_food_screens');
  if (saved) {
    const parsed = JSON.parse(saved);
    // Detect old model (has 'theme' field but no 'sections') and re-seed
    if (parsed.length > 0 && parsed[0].theme && !parsed[0].sections) {
      return initialFoodScreens;
    }
    return parsed;
  }
  // Also clear old unified screens key if present
  localStorage.removeItem('canteen_screens');
  return initialFoodScreens;
});
```

**Step 2: Update CRUD functions (lines 395-426)**

Update `createFoodScreen` activity log to reference `layoutTheme` instead of `theme`:
```javascript
addActivityLog('CREATE', 'food_screen', newScreen.title, `Created food screen: ${newScreen.title}`,
  null, { title: newScreen.title, layoutTheme: newScreen.layoutTheme });
```

Update `updateFoodScreen` activity log similarly:
```javascript
addActivityLog('UPDATE', 'food_screen', updatedScreen.title, `Updated food screen: ${updatedScreen.title}`,
  { layoutTheme: oldScreen.layoutTheme }, { layoutTheme: updatedScreen.layoutTheme });
```

**Step 3: Verify**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add src/context/DataContext.jsx
git commit -m "feat: update DataContext for multi-section food screens with migration"
```

---

### Task 6: Create Layout Picker Component

**Files:**
- Create: `src/components/screens/LayoutPicker.jsx`

**Step 1: Create the component**

A visual grid showing all 8 layout thumbnails as clickable cards. Each card shows:
- A miniature wireframe SVG/div representation of the grid sections
- The layout name
- Section count badge

Props: `{ value, onChange }` where value is the selected layout ID.

Use CSS grid to render miniature previews of each layout. The selected layout gets a highlighted border (primary-100). Each preview should show the section divisions using colored blocks within a small container.

Use Tailwind classes. Import `LAYOUT_THEMES` from `layoutRegistry.js`. Import icons from lucide-react.

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/screens/LayoutPicker.jsx
git commit -m "feat: add LayoutPicker component with 8 layout theme previews"
```

---

### Task 7: Create Visual Style Renderers (6 styles)

**Files:**
- Create: `src/components/gallery/styles/CardGridRenderer.jsx`
- Create: `src/components/gallery/styles/ElegantRenderer.jsx`
- Create: `src/components/gallery/styles/CompactRenderer.jsx`
- Create: `src/components/gallery/styles/CatalogRenderer.jsx`
- Create: `src/components/gallery/styles/MenuBoardRenderer.jsx`
- Create: `src/components/gallery/styles/MinimalRowsRenderer.jsx`
- Create: `src/components/gallery/styles/index.js` (barrel export + style resolver)

**Step 1: Extract renderers from existing TimeBasedRenderer.jsx**

The current `TimeBasedRenderer.jsx` (lines 206-313) has `THEME_CONFIG` with `ItemRenderer` components for each theme. Extract the 6 we're keeping into standalone section-aware renderers.

Each renderer receives props:
```javascript
{ items, containerRef, showPrices }
```

Each renderer is responsible for:
- Its own grid/list layout
- Its own item card styling
- Auto-pagination (carousel) within its section bounds
- Fade transitions between pages
- `React.memo` wrapped

Reference the existing item rendering code in `TimeBasedRenderer.jsx` lines 38-205 for the various ItemRenderer implementations (card-grid, elegant, compact, catalog, menu-board, minimal-rows). Port each one into its own file, adding the pagination/carousel logic that currently lives in the parent.

**Step 2: Create barrel export `index.js`**

```javascript
import CardGridRenderer from './CardGridRenderer';
import ElegantRenderer from './ElegantRenderer';
import CompactRenderer from './CompactRenderer';
import CatalogRenderer from './CatalogRenderer';
import MenuBoardRenderer from './MenuBoardRenderer';
import MinimalRowsRenderer from './MinimalRowsRenderer';

const STYLE_RENDERERS = {
  'card-grid': CardGridRenderer,
  'elegant': ElegantRenderer,
  'compact': CompactRenderer,
  'catalog': CatalogRenderer,
  'menu-board': MenuBoardRenderer,
  'minimal-rows': MinimalRowsRenderer
};

export const getStyleRenderer = (styleId) =>
  STYLE_RENDERERS[styleId] || STYLE_RENDERERS['card-grid'];

export default STYLE_RENDERERS;
```

**Step 3: Verify**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/gallery/styles/
git commit -m "feat: extract 6 visual style renderers from TimeBasedRenderer"
```

---

### Task 8: Create Section Renderer Component

**Files:**
- Create: `src/components/gallery/SectionRenderer.jsx`

**Step 1: Create the section renderer**

This is the core new component. It renders a single section's content based on current time.

Props:
```javascript
{ section, items, menus, gridArea }
```

Logic:
1. Every 60 seconds, evaluate `section.timeSlots` against current time + day using `isTimeInRange` and `getCurrentTime`/`getCurrentDayOfWeek` from `timeUtils.js`
2. First matching slot → use its `content`
3. No match → use `section.defaultContent`
4. Based on resolved content type:
   - `'menu'`: look up menu by `content.menuId`, get items, render with `getStyleRenderer(content.visualStyle)`
   - `'image'`: render `<img src={content.media} className="w-full h-full object-cover" />`
   - `'video'`: render `<video src={content.media} autoPlay loop muted className="w-full h-full object-cover" />`

Wrap in `React.memo`. The section fills its grid area via the `gridArea` style prop.

Use `useState` + `useEffect` with `setInterval(60000)` for time recalculation (same pattern as current TimeBasedRenderer).

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/gallery/SectionRenderer.jsx
git commit -m "feat: add SectionRenderer with independent time-based content"
```

---

### Task 9: Create Screen Grid Renderer (replaces TimeBasedRenderer)

**Files:**
- Create: `src/components/gallery/ScreenGridRenderer.jsx`

**Step 1: Create the grid renderer**

This replaces `TimeBasedRenderer.jsx` for the gallery display.

Props:
```javascript
{ screen }
```

Logic:
1. Look up layout from `getLayoutTheme(screen.layoutTheme)`
2. Get all items and menus from `useData()`
3. Render screen background (image/video/color) as absolute positioned behind the grid
4. Render CSS grid container with `gridTemplateColumns` and `gridTemplateRows` from the layout
5. Add a configurable `gap` (use 8px default)
6. For each section in `screen.sections`, render `<SectionRenderer>` with matching `gridArea` from the layout

```jsx
<div className="relative w-screen h-screen overflow-hidden">
  {/* Background */}
  {screen.backgroundType === 'color' ? (
    <div className="absolute inset-0" style={{ backgroundColor: screen.backgroundColor }} />
  ) : screen.backgroundType === 'video' ? (
    <video src={screen.backgroundMedia} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" />
  ) : (
    <img src={screen.backgroundMedia} className="absolute inset-0 w-full h-full object-cover" alt="" />
  )}

  {/* Grid */}
  <div
    className="relative w-full h-full"
    style={{
      display: 'grid',
      gridTemplateColumns: layout.grid.cols,
      gridTemplateRows: layout.grid.rows,
      gap: '8px',
      padding: '8px'
    }}
  >
    {screen.sections.map((section, idx) => (
      <SectionRenderer
        key={section.id}
        section={section}
        items={items}
        menus={menus}
        gridArea={layout.areas[idx].gridArea}
      />
    ))}
  </div>
</div>
```

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/gallery/ScreenGridRenderer.jsx
git commit -m "feat: add ScreenGridRenderer with CSS grid layout and section rendering"
```

---

### Task 10: Update GalleryDisplay to Use New Renderer

**Files:**
- Modify: `src/components/gallery/GalleryDisplay.jsx` (38 lines — small file)

**Step 1: Replace TimeBasedRenderer with ScreenGridRenderer**

Update imports: remove `TimeBasedRenderer`, add `ScreenGridRenderer`.

Replace the rendering logic to pass the screen object to `ScreenGridRenderer`:
```jsx
<ScreenGridRenderer screen={screen} />
```

Remove any props that were specific to the old model (`theme`, `defaultMenuId`, etc.).

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/gallery/GalleryDisplay.jsx
git commit -m "feat: wire GalleryDisplay to new ScreenGridRenderer"
```

---

### Task 11: Create Section Content Editor Component

**Files:**
- Create: `src/components/screens/SectionContentEditor.jsx`

**Step 1: Create the component**

Reusable editor for a content shape (`{ type, menuId, media, visualStyle }`). Used in both default content editing and time slot content editing.

Props:
```javascript
{ content, onChange, menus, label }
```

Renders:
1. Content type toggle (3 buttons: Menu / Image / Video)
2. If menu: menu dropdown + visual style picker (6 small cards showing style name + icon from `VISUAL_STYLES`)
3. If image/video: `ImageUpload` component (from `src/components/common/`) configured for the right accept type

Call `onChange(updatedContent)` on every change.

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/screens/SectionContentEditor.jsx
git commit -m "feat: add SectionContentEditor for menu/image/video content selection"
```

---

### Task 12: Create Section Time Slot Editor Component

**Files:**
- Create: `src/components/screens/SectionTimeSlotEditor.jsx`

**Step 1: Create the component**

Editor for a single section's time slots array.

Props:
```javascript
{ timeSlots, onChange, menus }
```

Renders:
1. List of existing time slots, each showing:
   - Start time / End time inputs (type="time")
   - Days of week checkboxes (Mon-Sun)
   - `SectionContentEditor` for the slot's content
   - Delete slot button
2. "Add Time Slot" button at the bottom
3. Overlap warning (call `checkSectionTimeSlotOverlaps` from validators and display inline errors)

Uses `generateId()` from `mockData.js` for new slot IDs. Call `onChange(updatedTimeSlots)` on every change.

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/screens/SectionTimeSlotEditor.jsx
git commit -m "feat: add SectionTimeSlotEditor with overlap validation"
```

---

### Task 13: Create Section Config Tab Component

**Files:**
- Create: `src/components/screens/SectionConfigTab.jsx`

**Step 1: Create the component**

A single section's configuration panel (one tab's content).

Props:
```javascript
{ section, onChange, menus }
```

Renders two collapsible panels:
1. **Default Content** — uses `SectionContentEditor` bound to `section.defaultContent`
2. **Time Slots** — uses `SectionTimeSlotEditor` bound to `section.timeSlots`

Call `onChange(updatedSection)` when either sub-editor changes.

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/screens/SectionConfigTab.jsx
git commit -m "feat: add SectionConfigTab combining default content and time slots"
```

---

### Task 14: Rewrite FoodScreenForm

**Files:**
- Modify: `src/components/screens/FoodScreenForm.jsx` (complete rewrite, 363 lines)

**Step 1: Rewrite the form**

Three-step form:

**Tab 1 — Layout & Basic Info:**
- Title input
- Screen ID input
- `LayoutPicker` component (from Task 6)
- When layout changes, rebuild `sections[]` using `buildEmptySections(layoutId)` from layoutRegistry

**Tab 2 — Sections:**
- Sub-tabs: one per section (labeled from layout areas)
- Each sub-tab renders `SectionConfigTab`
- Active section tab state managed locally

**Tab 3 — Screen Settings:**
- Background type radio (image/video/color)
- Background media upload (via `ImageUpload`) or color picker input
- Gap size select (small=4px, medium=8px, large=12px — store as number)

**Form state:**
```javascript
{
  title: '',
  screenId: '',
  layoutTheme: 'layout-1',
  backgroundType: 'color',
  backgroundMedia: null,
  backgroundColor: '#1a1a2e',
  sections: [/* from buildEmptySections */]
}
```

**Submit handler:**
- Run `validateFoodScreen(formData)` from validators
- Show errors via `useNotification()`
- Call `createFoodScreen(formData)` or `updateFoodScreen(id, formData)` from `useData()`

**Edit mode:**
- Populate form state from existing screen data
- Lock the layout picker (changing layout would destroy section configs — or show a warning)

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/screens/FoodScreenForm.jsx
git commit -m "feat: rewrite FoodScreenForm for multi-section layout system"
```

---

### Task 15: Update ScreenCard for New Model

**Files:**
- Modify: `src/components/screens/ScreenCard.jsx`

**Step 1: Update the card preview**

Replace the old theme-based preview with:
- Show layout name and section count
- Show a miniature wireframe of the layout (reuse the grid preview logic from LayoutPicker)
- "Copy URL" and "Preview" buttons remain unchanged
- Edit and delete buttons remain unchanged

Remove references to old fields: `theme`, `defaultMenuId`, `foregroundMedia`, `customMessages`, `showPrices`, `transitionDuration`, `slideDelay`.

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/screens/ScreenCard.jsx
git commit -m "feat: update ScreenCard preview for multi-section layout model"
```

---

### Task 16: Update ScreensPage

**Files:**
- Modify: `src/pages/ScreensPage.jsx` (182 lines)

**Step 1: Update the page**

- Remove any references to old screen fields
- The create/edit flow should open the rewritten `FoodScreenForm`
- List view uses updated `ScreenCard` components
- No functional changes needed beyond wiring new components

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/pages/ScreensPage.jsx
git commit -m "feat: update ScreensPage for new food screen form and cards"
```

---

### Task 17: Clean Up Old Files

**Files:**
- Delete: `src/components/gallery/TimeBasedRenderer.jsx`
- Delete: `src/components/gallery/MenuItemDisplay.jsx`
- Delete: `src/components/gallery/themes/themeRegistry.js`
- Delete: `src/components/screens/ThemeSelector.jsx`
- Modify: `src/utils/timeUtils.js` — remove `getAllCurrentMenuIds` (lines 128-143) and any other screen-level resolution functions that are no longer used

**Step 1: Delete old files**

```bash
rm src/components/gallery/TimeBasedRenderer.jsx
rm src/components/gallery/MenuItemDisplay.jsx
rm src/components/gallery/themes/themeRegistry.js
rm src/components/screens/ThemeSelector.jsx
```

**Step 2: Clean up timeUtils.js**

Remove `getAllCurrentMenuIds` and `getAllActiveTimeSlots` if they are no longer referenced anywhere. Keep: `getCurrentTime`, `getCurrentDayOfWeek`, `isTimeInRange`, `timeToMinutes`, `getActiveTimeSlot`, `calculateTimeSlotRows`.

**Step 3: Search for broken imports**

Run: `npm run lint && npm run build`

Fix any import errors referencing deleted files. Common places to check:
- `src/components/gallery/GalleryDisplay.jsx` (should already be updated in Task 10)
- `src/utils/validators.js` (should already be updated in Task 4)
- Any page or component that imported `ThemeSelector` or `themeRegistry`

**Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: PASS with zero errors

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove old theme system files (TimeBasedRenderer, themeRegistry, ThemeSelector, MenuItemDisplay)"
```

---

### Task 18: Full Integration Verification

**Files:** None (verification only)

**Step 1: Build check**

Run: `npm run lint && npm run build`
Expected: PASS with zero errors and zero warnings

**Step 2: Manual browser testing**

Run: `npm run dev`

Test the following:
1. Login as admin (admin/admin123)
2. Navigate to /screens
3. Create a new food screen:
   - Pick layout-4 (Main + Side Stack, 3 sections)
   - Configure Section 1 with a menu + card-grid style
   - Configure Section 2 with an image
   - Configure Section 3 with a menu + elegant style + a time slot
   - Set a background color
   - Save
4. Click "Preview" on the created screen
5. Verify the gallery renders a 3-section grid with correct content
6. Verify time-based switching works (adjust time slots to current time for testing)
7. Verify token screens still work (unchanged)
8. Clear localStorage and refresh — verify seed data loads correctly

**Step 3: Fix any issues found**

Address rendering bugs, styling problems, or data flow issues.

**Step 4: Commit fixes**

```bash
git add -A
git commit -m "fix: integration fixes for multi-section screen system"
```

---

## Task Dependency Order

```
Task 1 (Layout Registry) ──┐
Task 2 (Visual Styles)  ───┤
                            ├── Task 3 (Mock Data) ── Task 5 (DataContext)
                            ├── Task 4 (Validators)
                            │
Task 1 ─── Task 6 (LayoutPicker)
Task 2 ─── Task 7 (Style Renderers) ── Task 8 (SectionRenderer) ── Task 9 (ScreenGridRenderer) ── Task 10 (GalleryDisplay)
Task 2 ─── Task 11 (ContentEditor) ── Task 12 (TimeSlotEditor) ── Task 13 (SectionConfigTab) ── Task 14 (FoodScreenForm)
Task 14 + Task 10 ── Task 15 (ScreenCard) ── Task 16 (ScreensPage)
Task 16 ── Task 17 (Cleanup) ── Task 18 (Verification)
```

**Parallelizable groups:**
- Tasks 1 + 2 (registries — no dependencies)
- Tasks 3 + 4 + 6 (after registries — independent of each other)
- Tasks 5 + 7 + 11 (after their respective dependencies)
- Tasks 8 + 12 (after renderers/editors)
- Tasks 9 + 13 (after section-level components)
- Tasks 10 + 14 (wiring — after grid renderer / form components)
