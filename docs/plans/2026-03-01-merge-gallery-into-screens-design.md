# Design: Merge Gallery Page into Screens Page

**Date:** 2026-03-01
**Status:** Approved
**Problem:** Two sidebar entries ("Screens" and "Gallery") for one concept causes navigation confusion. The Gallery page is a thin read-only launcher that duplicates functionality already present on ScreenCard.

## Decision

Remove the Gallery page entirely. Enhance the Screens page with a "Copy URL" button on each ScreenCard. The public fullscreen route (`/gallery/:screenId`) is untouched — TVs continue using direct URLs.

## What Changes

### Remove
- **`src/pages/GalleryPage.jsx`** — delete the file
- **`/gallery` protected route** in `App.jsx` — remove the route entry
- **"Gallery" sidebar entry** in `Sidebar.jsx` — remove from `allNavItems`

### Modify

#### `src/components/screens/ScreenCard.jsx`
- Add a **"Copy URL"** button that copies the public display URL (`{origin}/gallery/{screen.id}`) to the clipboard
- Show a toast notification on successful copy ("Display URL copied!")
- Keep the existing "Preview" button (already navigates to `/gallery/:screenId`)

#### `src/pages/Dashboard.jsx`
- Change the "View Gallery" quick action (line 90) to link to `/screens` with label "View Screens"

#### `CLAUDE.md`
- Update routing docs to remove Gallery page references
- Note that Gallery listing was merged into Screens

### Keep Untouched
- `src/pages/GalleryViewPage.jsx` — the public fullscreen display route
- `src/components/gallery/*` — all display engine components
- `/gallery/:screenId` route in `App.jsx` — stays public and unauthenticated

## ScreenCard Button Layout (After)

```
[ Preview (opens fullscreen) ] [ Copy URL ] [ Duplicate ] [ Edit ]
[                    Delete Screen                                ]
```

## Data Flow

```
Admin Panel                          TV/Monitor
-----------                          ----------
/screens                             /gallery/:screenId
  |                                      |
  |- Create/Edit/Delete screens          |- Auto-fullscreen
  |- Copy public URL  -----(URL)-------> |- Time-based menu display
  |- Click Preview (new tab) ----------> |- 60s auto-refresh
```

## Files Affected

| File | Action |
|------|--------|
| `src/pages/GalleryPage.jsx` | Delete |
| `src/components/screens/ScreenCard.jsx` | Add Copy URL button |
| `src/App.jsx` | Remove `/gallery` protected route, remove GalleryPage import |
| `src/components/common/Sidebar.jsx` | Remove Gallery nav item |
| `src/pages/Dashboard.jsx` | Change "View Gallery" to "View Screens" pointing to `/screens` |
| `CLAUDE.md` | Update routing docs |
