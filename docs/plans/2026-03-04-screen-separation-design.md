# Screen Separation Design: Food Screens vs Token Screens

**Date:** 2026-03-04
**Status:** Approved

## Problem

The current system has one unified "Screen" concept that bundles schedule/menus, background media, foreground media, token panel, and orientation into a single configurable object. This is complex to configure and the token display has very different needs than the food/menu display.

## Decision

Split screens into two distinct types with separate data models, forms, and gallery renderers.

## Data Models

### Food Screen

```js
{
  id: 'food-screen-001',        // auto-generated
  title: 'Main Dining Hall',
  screenId: 'HALL-A-01',        // user-set tracking ID
  type: 'food',

  // Schedule
  defaultMenuId: 'menu-001',
  timeSlots: [{ id, startTime, endTime, menuId, menuName, daysOfWeek[] }],

  // Media
  backgroundMedia: 'data:...',   // required (base64 image/video)

  // Theme
  theme: 'classic-grid',         // 'classic-grid' | 'portrait-list' | 'media-focus' | 'none'

  // Fine-tuning
  showPrices: true,
  transitionDuration: 500,       // ms (0-2000)
  slideDelay: 5000,              // ms (1000-30000)

  createdAt: '...',
  updatedAt: '...'
}
```

### Token Screen

```js
{
  id: 'token-screen-001',
  title: 'Counter Token Display',
  screenId: 'TOKEN-01',
  type: 'token',
  createdAt: '...',
  updatedAt: '...'
}
```

### Theme Presets

| Theme | Orientation | Foreground Media | Description |
|-------|------------|-----------------|-------------|
| `classic-grid` | Landscape | Off | Standard horizontal grid layout with menu cards |
| `portrait-list` | Portrait | Off | Vertical layout optimized for tall screens |
| `media-focus` | Landscape | On (20vh) | Grid layout + foreground media/promo window |
| `none` | Landscape | Background shown fullscreen | No menu overlay, background media fills screen |

Themes replace the old individual `displaySettings` fields (orientation, foregroundMediaDisplay, tokenWindow). The `showPrices`, `transitionDuration`, and `slideDelay` remain as user-adjustable fine-tuning.

## Admin UI

### Screens Page (`/screens`)

Two tabs at top: **Food Screens** | **Token Screens**

**Food Screens tab:**
- Grid of food screen cards showing background preview, title, theme badge, time slot count
- "Create Food Screen" button
- Card actions: Preview, Copy URL, Edit, Delete
- Create/Edit modal with FoodScreenForm (3 tabs: Basic Info, Schedule, Appearance)

**Token Screens tab:**
- Grid of token screen cards (simpler: title, token icon, actions)
- "Create Token Screen" button
- Card actions: Preview, Copy URL, Edit, Delete
- Create/Edit modal with TokenScreenForm (flat form: title + screenId, no tabs)

### FoodScreenForm Tabs

1. **Basic Info** - Title, Screen ID
2. **Schedule** - Default menu selector, TimeSlotBuilder
3. **Appearance** - Background media upload, theme selector (visual radio cards), showPrices toggle, transition/slide duration inputs

### TokenScreenForm

Single flat form: Title + Screen ID. No tabs needed.

### Theme Selector (ThemeSelector.jsx)

Visual radio cards showing mini layout previews for each theme:
- Classic Grid: horizontal layout icon
- Portrait List: vertical layout icon
- Media Focus: layout + media overlay icon
- No Theme: fullscreen media icon

## Gallery Display

### Routes

`/gallery/:screenId` works for both types. GalleryViewPage checks `screen.type` and renders the appropriate display.

### Food Gallery (simplified TimeBasedRenderer)

- All token panel code removed (TokenPanelPortrait, TokenPanelLandscape, showTokenPanel, tokenSize)
- Layout derived from theme:
  - `classic-grid` -> landscape layout, no token panel, no foreground media
  - `portrait-list` -> portrait layout, no token panel, no foreground media
  - `media-focus` -> landscape with foreground media at 20vh
  - `none` -> fullscreen foreground media mode (background fills screen)

### Token Gallery (new TokenGalleryDisplay.jsx)

- Fullscreen dark background
- Large "Now Serving" badge + massive token number centered
- Recent tokens below (last 2-3)
- Screen title in header bar
- Current time display
- Voice announcement on token change (reuses speechUtils)
- No background media, no menus, no schedule

## DataContext Changes

- `screens` state splits into `foodScreens` + `tokenScreens`
- New localStorage keys: `canteen_food_screens`, `canteen_token_screens`
- Separate CRUD: createFoodScreen/updateFoodScreen/deleteFoodScreen + createTokenScreen/updateTokenScreen/deleteTokenScreen
- `getScreenById(id)` -> unified lookup across both types (needed for /gallery/:screenId)
- Migration: on first load, existing `canteen_screens` maps to `canteen_food_screens` (token settings stripped, theme inferred from displaySettings)
- `clearAllData` resets both

## File Changes

### New Files (~5)
- `src/components/screens/FoodScreenForm.jsx` - food screen create/edit form
- `src/components/screens/TokenScreenForm.jsx` - token screen create/edit form (minimal)
- `src/components/screens/TokenScreenCard.jsx` - card for token screen list
- `src/components/gallery/TokenGalleryDisplay.jsx` - fullscreen token-only display
- `src/components/screens/ThemeSelector.jsx` - visual theme picker

### Modified Files (~7)
- `src/pages/ScreensPage.jsx` - tab switching, separate lists/forms per type
- `src/pages/GalleryViewPage.jsx` - branch on screen.type
- `src/components/gallery/TimeBasedRenderer.jsx` - remove token panel code, theme-based layout
- `src/components/screens/ScreenCard.jsx` - becomes food-screen focused, remove token settings display
- `src/context/DataContext.jsx` - split screens state, CRUD, localStorage keys, migration
- `src/data/mockData.js` - split initialScreens into food + token
- `src/utils/validators.js` - separate validateFoodScreen and validateTokenScreen

### Removed/Relocated
- TokenPanelPortrait and TokenPanelLandscape move from TimeBasedRenderer to TokenGalleryDisplay
- foregroundMediaDisplay and tokenWindow displaySettings become theme-derived
