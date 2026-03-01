# Merge Gallery Into Screens — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the Gallery page and consolidate all screen management + preview + URL copying into the single Screens page.

**Architecture:** Delete the Gallery page, its route, and its sidebar entry. Add a "Copy URL" button to `ScreenCard`. Update the Dashboard quick action link. Update `CLAUDE.md` routing docs.

**Tech Stack:** React 19, React Router, lucide-react, Tailwind CSS

**Design Doc:** `docs/plans/2026-03-01-merge-gallery-into-screens-design.md`

---

### Task 1: Add "Copy URL" button to ScreenCard

**Files:**
- Modify: `src/components/screens/ScreenCard.jsx`

**Step 1: Add `Link2` icon import and `useNotification` hook**

In `src/components/screens/ScreenCard.jsx`, change the import line and add the notification hook:

```jsx
// Line 1: add Link2 to the icon imports
import { Edit2, Trash2, ExternalLink, Monitor, Copy, Link2 } from 'lucide-react';
```

```jsx
// After line 4, add:
import { useNotification } from '../../context/NotificationContext';
```

```jsx
// Inside the component, after line 8 (const navigate = useNavigate();), add:
const { success } = useNotification();
```

**Step 2: Add `handleCopyUrl` function**

After the `handlePreview` function (after line 13), add:

```jsx
const handleCopyUrl = async () => {
  const url = `${window.location.origin}/gallery/${screen.id}`;
  try {
    await navigator.clipboard.writeText(url);
    success('Display URL copied to clipboard!');
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    success('Display URL copied to clipboard!');
  }
};
```

**Step 3: Add the Copy URL button to the actions grid**

Change the actions grid from `grid-cols-4` to `grid-cols-5` and add the new button. Replace the entire `{/* Actions */}` block (lines 81-103) with:

```jsx
{/* Actions */}
<div className="grid grid-cols-5 gap-2 mt-4">
  <button
    onClick={handlePreview}
    className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-200 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100"
  >
    <ExternalLink className="w-4 h-4" />
    <span className="hidden sm:inline">Preview</span>
  </button>
  <button
    onClick={handleCopyUrl}
    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-100 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100"
    title="Copy Display URL"
  >
    <Link2 className="w-4 h-4" />
  </button>
  <button
    onClick={() => onDuplicate(screen)}
    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-accent-100 bg-accent-100/10 rounded-lg hover:bg-accent-100/20 transition-all duration-200 border border-transparent hover:border-accent-100"
    title="Duplicate Screen"
  >
    <Copy className="w-4 h-4" />
  </button>
  <button
    onClick={() => onEdit(screen)}
    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-100 bg-primary-100/10 rounded-lg hover:bg-primary-100/20 transition-all duration-200 border border-transparent hover:border-primary-100"
  >
    <Edit2 className="w-4 h-4" />
  </button>
</div>
```

**Step 4: Verify in browser**

Run: `npm run dev`
Navigate to `/screens`, verify:
- Copy URL button appears between Preview and Duplicate
- Clicking it copies the URL and shows a success toast
- Preview button still opens fullscreen view

**Step 5: Commit**

```bash
git add src/components/screens/ScreenCard.jsx
git commit -m "feat: add Copy URL button to ScreenCard"
```

---

### Task 2: Remove Gallery route and import from App.jsx

**Files:**
- Modify: `src/App.jsx`

**Step 1: Remove the GalleryPage import**

Delete line 15:
```jsx
import GalleryPage from './pages/GalleryPage';
```

**Step 2: Remove the `/gallery` protected route**

Delete line 92:
```jsx
                  <Route path="gallery" element={<GalleryPage />} />
```

**Step 3: Verify in browser**

Run: `npm run dev`
- Navigate to `/gallery` — should redirect to `/dashboard` (caught by the `*` fallback route)
- Navigate to `/gallery/screen-001` — should still load the fullscreen display (public route on line 73 is untouched)

**Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "refactor: remove Gallery protected route from App.jsx"
```

---

### Task 3: Remove Gallery from Sidebar

**Files:**
- Modify: `src/components/common/Sidebar.jsx`

**Step 1: Remove the Gallery nav item**

Delete line 28:
```jsx
    { path: '/gallery', icon: ImageIcon, label: 'Gallery', roles: ['admin', 'restaurant_user'] },
```

**Step 2: Remove the unused `ImageIcon` import**

In line 8, remove `Image as ImageIcon` from the lucide-react import. Change:
```jsx
import {
  LayoutDashboard,
  UtensilsCrossed,
  BookOpen,
  Clock,
  Monitor,
  Image as ImageIcon,
  FileText,
  ChefHat,
  Hash,
  X
} from 'lucide-react';
```
To:
```jsx
import {
  LayoutDashboard,
  UtensilsCrossed,
  BookOpen,
  Clock,
  Monitor,
  FileText,
  ChefHat,
  Hash,
  X
} from 'lucide-react';
```

**Step 3: Verify in browser**

- Sidebar should show: Dashboard, Current Menu, Token Display, Items, Menus, Schedule, Screens, Activity Logs
- "Gallery" should no longer appear

**Step 4: Commit**

```bash
git add src/components/common/Sidebar.jsx
git commit -m "refactor: remove Gallery entry from sidebar navigation"
```

---

### Task 4: Update Dashboard quick action

**Files:**
- Modify: `src/pages/Dashboard.jsx`

**Step 1: Change the Gallery quick action to Screens**

Replace lines 89-97:
```jsx
          <Link
            to="/gallery"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-bg-300 hover:border-accent-200"
          >
            <div className="w-10 h-10 bg-accent-200/20 rounded-lg flex items-center justify-center">
              <Monitor className="w-5 h-5 text-accent-200" />
            </div>
            <span className="font-medium text-text-100">View Gallery</span>
          </Link>
```

With:
```jsx
          <Link
            to="/screens"
            className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-bg-300 hover:border-accent-200"
          >
            <div className="w-10 h-10 bg-accent-200/20 rounded-lg flex items-center justify-center">
              <Monitor className="w-5 h-5 text-accent-200" />
            </div>
            <span className="font-medium text-text-100">View Screens</span>
          </Link>
```

**Step 2: Verify in browser**

- Dashboard quick actions: 4th card should say "View Screens" and link to `/screens`

**Step 3: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "refactor: update Dashboard quick action from Gallery to Screens"
```

---

### Task 5: Delete GalleryPage.jsx

**Files:**
- Delete: `src/pages/GalleryPage.jsx`

**Step 1: Delete the file**

```bash
rm src/pages/GalleryPage.jsx
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors (no remaining imports of GalleryPage)

**Step 3: Commit**

```bash
git add src/pages/GalleryPage.jsx
git commit -m "refactor: delete GalleryPage.jsx (merged into Screens)"
```

---

### Task 6: Update CLAUDE.md routing docs

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Replace the routing section**

Replace the routing subsection (lines 46-53) from:
```markdown
### Routing

Defined in `src/App.jsx`. Two route types:
- **Public**: `/login`, `/gallery/:screenId` (full-screen display for TVs/monitors, no auth required)
- **Protected**: Everything else, wrapped in `ProtectedRoute` which checks `useAuth()`

Two distinct gallery pages exist:
- **GalleryPage** (`/gallery`, protected) — Admin-facing listing of all screens as clickable cards, linking to their full-screen views.
- **GalleryViewPage** (`/gallery/:screenId`, public) — The customer-facing full-screen display. Uses the screen's auto-generated `id` as the URL param. Recalculates the active menu every 60 seconds based on the current time (no page reload). Auto-enters browser fullscreen on mount.
```

With:
```markdown
### Routing

Defined in `src/App.jsx`. Two route types:
- **Public**: `/login`, `/gallery/:screenId` (full-screen display for TVs/monitors, no auth required)
- **Protected**: Everything else, wrapped in `ProtectedRoute` which checks `useAuth()`

The gallery listing was merged into the Screens page — there is no separate `/gallery` admin page. The public fullscreen display route remains:
- **GalleryViewPage** (`/gallery/:screenId`, public) — The customer-facing full-screen display. Uses the screen's auto-generated `id` as the URL param. Recalculates the active menu every 60 seconds based on the current time (no page reload). Auto-enters browser fullscreen on mount.
- Each `ScreenCard` on `/screens` has a "Copy URL" button to copy the public display URL and a "Preview" button to open it.
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md routing section after Gallery merge"
```

---

### Task 7: Final verification

**Step 1: Run the linter**

```bash
npm run lint
```
Expected: No new errors

**Step 2: Run production build**

```bash
npm run build
```
Expected: Build succeeds

**Step 3: Manual smoke test**

Run: `npm run dev`

Verify:
1. Sidebar has no "Gallery" entry
2. `/screens` page shows screen cards with Preview, Copy URL, Duplicate, Edit, Delete buttons
3. Clicking "Copy URL" copies the display URL and shows a toast
4. Clicking "Preview" opens the fullscreen display
5. `/gallery/screen-001` still works as a public route (no login required)
6. Dashboard "View Screens" quick action links to `/screens`
7. Navigating to `/gallery` redirects to `/dashboard`

**Step 4: Final commit (if any lint/build fixes were needed)**

```bash
git add -A
git commit -m "fix: address lint/build issues from Gallery merge"
```
