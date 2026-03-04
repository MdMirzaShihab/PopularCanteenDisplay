# Token Display Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add configurable background (image/video/color), fixed bottom bar for previous tokens, and clock+date display to the token gallery screen.

**Architecture:** Extend the token screen data model with background fields. Add an Appearance tab to TokenScreenForm using existing ImageUpload component. Modify TokenGalleryDisplay to render dynamic backgrounds, relocate previous tokens to a fixed bottom bar, and add date alongside the existing clock.

**Tech Stack:** React 19, Tailwind CSS, lucide-react icons, Web Speech API (already implemented)

**No test framework configured** — verification is `npm run lint` and `npm run build`.

---

### Task 1: Add `formatDateDisplay()` to timeUtils

**Files:**
- Modify: `src/utils/timeUtils.js` (append after line 222)

**Step 1: Add the function**

Add this after the existing `formatTimeDisplay` function (after line 222):

```javascript
/**
 * Format current date for display
 * @returns {string} - Formatted date like "Wednesday, 04 March 2026"
 */
export const formatDateDisplay = () => {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayName = days[now.getDay()];
  const date = String(now.getDate()).padStart(2, '0');
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  return `${dayName}, ${date} ${month} ${year}`;
};
```

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/utils/timeUtils.js
git commit -m "feat: add formatDateDisplay utility for token screen date display"
```

---

### Task 2: Update mock data with background fields

**Files:**
- Modify: `src/data/mockData.js` (lines 381-390)

**Step 1: Add background fields to initialTokenScreens**

Replace the token screen object (lines 382-389) with:

```javascript
{
  id: 'token-screen-001',
  title: 'Main Counter Token Display',
  screenId: 'TOKEN-01',
  type: 'token',
  backgroundType: 'color',
  backgroundMedia: null,
  backgroundColor: '#1f2937',
  createdAt: '2024-01-23T09:00:00Z',
  updatedAt: '2024-01-23T09:00:00Z'
}
```

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/data/mockData.js
git commit -m "feat: add background fields to token screen mock data"
```

---

### Task 3: Update validateTokenScreen with background validation

**Files:**
- Modify: `src/utils/validators.js` (lines 130-145)

**Step 1: Replace validateTokenScreen**

Replace the existing `validateTokenScreen` function (lines 130-145) with:

```javascript
export const validateTokenScreen = (screenData) => {
  const errors = {};

  if (!screenData.title || screenData.title.trim().length === 0) {
    errors.title = 'Screen title is required';
  }

  if (!screenData.screenId || screenData.screenId.trim().length === 0) {
    errors.screenId = 'Screen ID is required';
  }

  const validBgTypes = ['image', 'video', 'color'];
  if (screenData.backgroundType && !validBgTypes.includes(screenData.backgroundType)) {
    errors.backgroundType = 'Invalid background type';
  }

  if (screenData.backgroundType === 'image' || screenData.backgroundType === 'video') {
    if (!screenData.backgroundMedia) {
      errors.backgroundMedia = 'Background media is required for image/video type';
    }
  }

  if (screenData.backgroundType === 'color') {
    if (!screenData.backgroundColor) {
      errors.backgroundColor = 'Background color is required';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/utils/validators.js
git commit -m "feat: add background validation to validateTokenScreen"
```

---

### Task 4: Add Appearance tab to TokenScreenForm

**Files:**
- Modify: `src/components/screens/TokenScreenForm.jsx` (full rewrite)

**Step 1: Rewrite TokenScreenForm with tabs and appearance settings**

The form needs:
- Two tabs: Basic Info | Appearance
- Appearance tab: background type radio selector (Image, Video, Solid Color)
- When image/video selected: show `ImageUpload` component
- When color selected: show `<input type="color">` with preset swatches
- Import `ImageUpload` from `../common/ImageUpload`
- Import `Image, Video, Palette` from `lucide-react`

Full form data shape:

```javascript
{
  title: '',
  screenId: '',
  backgroundType: 'color',
  backgroundMedia: null,
  backgroundColor: '#1f2937',
}
```

Key implementation details:
- Reuse the tab pattern from `FoodScreenForm.jsx` (lines 112-132)
- Reuse `ImageUpload` component with `accept="image/*"` for image type, `accept="video/*"` for video type
- Color presets: `['#1f2937', '#0f172a', '#1a2e1a', '#2d1b1b', '#000000', '#1e3a5f']`
- When switching background type, clear the other type's data
- Load existing screen data in useEffect (same pattern as current form, but include new fields)

**Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/screens/TokenScreenForm.jsx
git commit -m "feat: add appearance tab with background settings to TokenScreenForm"
```

---

### Task 5: Update TokenGalleryDisplay with all 3 enhancements

**Files:**
- Modify: `src/components/gallery/TokenGalleryDisplay.jsx` (full rewrite)

**Step 1: Implement dynamic background**

Replace the hardcoded `bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900` on line 40.

Render based on `screen.backgroundType`:
- `'image'`: `<img src={screen.backgroundMedia} className="fixed inset-0 w-full h-full object-cover" />` with a dark overlay div on top
- `'video'`: `<video src={screen.backgroundMedia} autoPlay muted loop className="fixed inset-0 w-full h-full object-cover" />` with a dark overlay div on top
- `'color'`: `<div className="fixed inset-0" style={{ backgroundColor: screen.backgroundColor || '#1f2937' }} />`

Always add a semi-transparent overlay: `<div className="fixed inset-0 bg-black/40" />` for text readability (on image/video types).

**Step 2: Add date to header clock**

Import `formatDateDisplay` from `../../utils/timeUtils`.

Add a `currentDate` state alongside `currentTime`:
```javascript
const [currentDate, setCurrentDate] = useState(formatDateDisplay());
```

Update the interval to also refresh the date:
```javascript
setCurrentDate(formatDateDisplay());
```

In the header, modify the clock area (lines 51-56) to show date + time stacked:
```jsx
<div className="flex flex-col items-end gap-1 px-5 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
  <div className="flex items-center gap-2">
    <Calendar className="w-4 h-4 text-white/80" />
    <span className="text-sm text-white/90 font-body">{currentDate}</span>
  </div>
  <div className="flex items-center gap-2">
    <Clock className="w-5 h-5 text-white" />
    <span className="text-lg font-bold text-white font-heading tracking-wider">
      {formatTimeDisplay(currentTime)}
    </span>
  </div>
</div>
```

Import `Calendar` from `lucide-react`.

**Step 3: Move previous tokens to fixed bottom bar**

Remove the "Recently Called" section from center (lines 88-108).
Remove the existing footer (lines 119-128).

Add a new fixed bottom bar that replaces both:

```jsx
{/* Fixed Bottom Bar - Previous Tokens */}
<div className="px-8 py-4 border-t border-white/10 bg-black/50 backdrop-blur-sm">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-yellow-400 text-sm">
      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
      <span>Live Updates</span>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-400 uppercase tracking-wide">Previous:</span>
      {tokenHistory.length > 1 ? (
        tokenHistory.slice(1, 3).map((token) => (
          <div key={token.updatedAt}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-lg border border-white/20">
            <Hash className="w-4 h-4 text-gray-400" />
            <span className="text-2xl font-bold text-gray-300">{token.number}</span>
          </div>
        ))
      ) : (
        <span className="text-sm text-gray-500 italic">No previous tokens</span>
      )}
    </div>
  </div>
</div>
```

**Step 4: Verify**

Run: `npm run lint && npm run build`
Expected: No errors

**Step 5: Manual test**

1. Run `npm run dev`
2. Login as admin (admin/admin123)
3. Go to Screens page
4. Edit the existing token screen — verify Appearance tab shows with background options
5. Set a solid color background, save
6. Open gallery view (`/gallery/token-screen-001`) — verify:
   - Background uses the selected color
   - Date shows in top-right (e.g., "Wednesday, 04 March 2026")
   - Clock shows below date
   - Bottom bar shows "Previous:" with placeholder text
7. Go to Token management, call a few tokens — verify:
   - Voice announces each token
   - Previous tokens appear in the bottom bar
   - At least 2 previous tokens shown

**Step 6: Commit**

```bash
git add src/components/gallery/TokenGalleryDisplay.jsx
git commit -m "feat: add dynamic background, date display, and bottom bar to token gallery"
```

---

### Task 6: Final verification and combined commit

**Step 1: Full lint and build**

Run: `npm run lint && npm run build`
Expected: Clean pass, no warnings

**Step 2: Test localStorage migration**

Clear `canteen_token_screens` from localStorage and reload — verify the app initializes with the updated mock data including background fields.

**Step 3: Test existing token screens**

Existing token screens without background fields should gracefully fall back:
- `backgroundType` defaults to `'color'`
- `backgroundColor` defaults to `'#1f2937'`

This is handled by the `||` fallbacks in both `TokenScreenForm` (useEffect) and `TokenGalleryDisplay` (render).

---

## File Summary

| File | Change Type | Task |
|------|-------------|------|
| `src/utils/timeUtils.js` | Add function | Task 1 |
| `src/data/mockData.js` | Modify seed data | Task 2 |
| `src/utils/validators.js` | Modify validator | Task 3 |
| `src/components/screens/TokenScreenForm.jsx` | Rewrite with tabs | Task 4 |
| `src/components/gallery/TokenGalleryDisplay.jsx` | Rewrite with 3 features | Task 5 |

## Dependencies Between Tasks

- Tasks 1, 2, 3 are independent — can run in parallel
- Task 4 depends on Task 3 (validator must exist before form uses it)
- Task 5 depends on Tasks 1 and 2 (needs `formatDateDisplay` and updated data model)
- Task 6 depends on all previous tasks
