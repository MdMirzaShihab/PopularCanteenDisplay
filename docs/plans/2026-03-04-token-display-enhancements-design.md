# Token Display Enhancements Design

**Date:** 2026-03-04
**Status:** Approved

## Requirements

1. Background options: video, image, or solid color (configurable per token screen)
2. Previous token numbers (min 2) shown in a fixed bottom bar
3. Clock + date in right corner (format: Wednesday, 04 March 2026)
4. Voice reading of token (already complete — no changes)

## Approach

Extend the token screen data model with background fields. Add an Appearance tab to TokenScreenForm. Modify TokenGalleryDisplay to render dynamic backgrounds, a fixed bottom bar for previous tokens, and a date alongside the clock.

## Data Model

```javascript
{
  id: 'token-screen-001',
  title: 'Main Counter Token Display',
  screenId: 'TOKEN-01',
  type: 'token',
  backgroundType: 'color',       // 'image' | 'video' | 'color'
  backgroundMedia: null,          // base64 for image/video
  backgroundColor: '#1f2937',     // hex color
  createdAt: '...',
  updatedAt: '...'
}
```

## Component Changes

### TokenScreenForm — Add Tabs

Two tabs: **Basic Info** | **Appearance**

Appearance tab:
- Radio selector: Image / Video / Solid Color
- Image/Video: reuse `ImageUpload` component
- Color: `<input type="color">` with preset swatches

### TokenGalleryDisplay — 3 Changes

1. **Dynamic background**: Render image (`object-cover`), video (`autoPlay muted loop`), or solid color based on `screen.backgroundType`. Semi-transparent dark overlay for text readability.

2. **Fixed bottom bar**: Move previous tokens from center to full-width bottom bar. Always visible. Shows 2 previous tokens horizontally. Placeholder text when empty.

3. **Date display**: Add date next to existing clock in header. Format: `Wednesday, 04 March 2026`. New `formatDateDisplay()` in `timeUtils.js`. Updates every 60 seconds with the clock.

### Validator

Update `validateTokenScreen()` to validate:
- `backgroundType` must be one of `image`, `video`, `color`
- If `image`/`video`: `backgroundMedia` is required
- If `color`: `backgroundColor` is required

## Files Modified

| File | Change |
|------|--------|
| `src/data/mockData.js` | Add background fields to `initialTokenScreens` |
| `src/utils/validators.js` | Update `validateTokenScreen()` |
| `src/utils/timeUtils.js` | Add `formatDateDisplay()` |
| `src/components/screens/TokenScreenForm.jsx` | Add tabs + appearance section |
| `src/components/gallery/TokenGalleryDisplay.jsx` | Dynamic background, bottom bar, date |

## Voice

Already implemented in `speechUtils.js`. No changes needed.
