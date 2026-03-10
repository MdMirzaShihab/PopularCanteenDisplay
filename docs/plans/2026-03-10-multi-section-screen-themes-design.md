# Multi-Section Screen Themes — Design Document

**Date**: 2026-03-10
**Status**: Approved

## Overview

Replace the current single-content food screen system with a multi-section layout system. Each screen picks a layout theme (1-8 sections arranged in a CSS grid), and each section independently schedules its own content (menu, image, or video) with its own time slots.

## Requirements

- 8 layout themes (1 to 6 sections per screen)
- Each section has independent time-slot scheduling
- Section content types: menu, image, or video
- Menu sections pick from 6 visual styles independently
- Each time slot carries its own content (menu reference OR uploaded media)
- Each section has a default fallback content when no time slot matches
- No overlapping time slots within the same section
- Screen-level background visible in gaps between sections
- Token screens remain unchanged
- Landscape only (no portrait layouts)

## Data Model

### Food Screen

```javascript
{
  id: 'screen-001',
  title: 'Main Hall Display',
  screenId: 'main-hall',
  type: 'food',

  layoutTheme: 'layout-4',
  backgroundType: 'image' | 'video' | 'color',
  backgroundMedia: 'base64...',
  backgroundColor: '#1a1a2e',

  sections: [
    {
      id: 'section-1',
      label: 'Left (large)',
      defaultContent: {
        type: 'menu' | 'image' | 'video',
        menuId: 'menu-001',       // if type=menu
        media: 'base64...',       // if type=image/video
        visualStyle: 'card-grid'  // if type=menu
      },
      timeSlots: [
        {
          id: 'ts-1',
          startTime: '07:00',
          endTime: '11:00',
          daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          content: {
            type: 'menu',
            menuId: 'menu-002',
            visualStyle: 'elegant'
          }
        },
        {
          id: 'ts-2',
          startTime: '11:00',
          endTime: '13:00',
          daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          content: {
            type: 'image',
            media: 'base64...'
          }
        }
      ]
    }
    // ... more sections based on layout theme
  ],

  createdAt: '...',
  updatedAt: '...'
}
```

### Content Shape (shared by defaultContent and timeSlot.content)

```javascript
{
  type: 'menu' | 'image' | 'video',
  menuId: string | undefined,      // when type=menu
  media: string | undefined,       // when type=image/video (base64)
  visualStyle: string | undefined  // when type=menu
}
```

## Layout Themes (8 total)

All landscape-oriented. Rendered as CSS grid.

| ID | Name | Sections | Grid (cols x rows) | Description |
|----|------|----------|---------------------|-------------|
| layout-1 | Full Screen | 1 | 1fr x 1fr | Single block fills entire screen |
| layout-2 | Side by Side | 2 | 3fr 2fr x 1fr | 60% left + 40% right |
| layout-3 | Top & Bottom | 2 | 1fr x 1fr 1fr | Stacked horizontally |
| layout-4 | Main + Side Stack | 3 | 3fr 2fr x 1fr 1fr | 1 large left + 2 stacked right |
| layout-5 | Three Columns | 3 | 1fr 1fr 1fr x 1fr | 3 equal columns |
| layout-6 | Quad Grid | 4 | 1fr 1fr x 1fr 1fr | 2x2 equal grid |
| layout-7 | Dashboard | 5 | 2fr 1fr 1fr x 1fr 1fr | Large left + 2 center stacked + 2 right stacked |
| layout-8 | Wide + Stack | 6 | 2fr 1fr 1fr x 1fr 1fr 1fr | Large left + 2 middle stacked + 3 right stacked (slim) |

Each layout defines `grid` (CSS grid-template-columns/rows) and `areas[]` with `gridArea` values for each section.

## Visual Styles (6 total, per-section for menus)

| ID | Name | Description |
|----|------|-------------|
| card-grid | Card Grid | Cards with circular images, clean layout |
| elegant | Elegant | Gold accents, script fonts, premium feel |
| compact | Compact List | Dense 2-column list, max items visible |
| catalog | Catalog | Full-bleed images with overlay text |
| menu-board | Menu Board | Chalkboard aesthetic, dotted price lines |
| minimal-rows | Minimal Rows | Clean horizontal rows, accent bar |

Each style adapts responsively to its section's size.

## Screen Creation UX

### Step 1 — Layout + Basic Info
- Title and screen ID fields
- Visual grid of 8 layout thumbnails (miniature wireframes)

### Step 2 — Section Configuration (Tabs)
- One tab per section, labeled from layout registry (e.g., "Left (large)", "Top Right")
- Each tab contains:
  - **Default Content**: content type toggle (menu/image/video), menu selector + visual style picker OR media upload
  - **Time Slots**: add/remove slots, each with start/end time, day checkboxes, content type + content selection
  - Overlap validation: reject overlapping slots within same section (same day + overlapping time)

### Step 3 — Screen Settings
- Background type: image/video/color
- Background media upload or color picker
- Gap size between sections (small/medium/large)

## Gallery Rendering

1. Load screen -> read `layoutTheme` -> apply CSS grid from layout registry
2. For each section independently (every 60 seconds):
   - Check section's `timeSlots` against current time + day
   - First matching slot -> render its content
   - No match -> render `defaultContent`
3. Content rendering:
   - `menu`: fetch items, render with section's `visualStyle`, auto-paginate carousel within section bounds
   - `image`: `<img>` filling section (object-fit: cover)
   - `video`: `<video>` looping, muted, filling section
4. Screen background visible in gaps between sections
5. Each section is an independent rendering unit (own pagination, timer, transitions)

## Validation Rules

- Title and screenId required
- layoutTheme must be valid layout ID
- sections[] length must match layout's section count
- Each section must have valid defaultContent
- defaultContent.type required; menuId required if type=menu; media required if type=image/video
- visualStyle required if content type=menu, must be valid style ID
- Time slots: no overlaps within same section (same day + overlapping time range = error)
- backgroundMedia required if backgroundType is image/video

## Scope of Changes

### Deleted/Replaced
- `themeRegistry.js` -> layout theme registry + visual styles registry
- `ThemeSelector.jsx` -> layout picker + per-section style picker
- `TimeBasedRenderer.jsx` -> new grid-based section renderer
- `FoodScreenForm.jsx` -> rewritten for new flow
- Theme configs in TimeBasedRenderer (card dimensions, ItemRenderers)
- `MenuItemDisplay.jsx` -> refactored into per-style renderers
- `GalleryDisplay.jsx` -> updated to use new renderer
- `mockData.js` -> food screen seed data updated
- `validators.js` -> validateFoodScreen() rewritten
- `DataContext.jsx` -> food screen CRUD updated
- `timeUtils.js` -> remove screen-level menu resolution (getAllCurrentMenuIds)

### Kept As-Is
- Token screens (model, form, gallery)
- AuthContext, NotificationContext
- Items and Menus CRUD
- timeUtils.js core functions (isTimeInRange, timeToMinutes, getCurrentTime, etc.)
- ScreensPage.jsx (updated but same role)
- ScreenCard.jsx (updated preview)
- All src/components/common/ components

### Migration
- Existing food screens in localStorage will break
- Migration clears old food screen data and re-seeds from updated mockData.js
