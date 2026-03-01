# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **client-side demo** of a Canteen Management System for digital menu displays. Built with React 19 + Vite + Tailwind CSS. All data is stored in browser localStorage — there is no backend or database. The production version will use MERN stack (see `ProjectContext.md`).

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

No test framework is configured.

## Architecture

### Three-Context State Model

All application state flows through three React Context providers nested in `main.jsx` in this specific order (outer → inner): **NotificationProvider → AuthProvider → DataProvider**. This order matters because DataProvider calls `useAuth()` internally.

1. **AuthContext** (`src/context/AuthContext.jsx`) — Authentication and role-based access. Three roles: `admin`, `restaurant_user`, `token_operator`. Only predefined accounts in `mockData.js` are accepted; unknown credentials are rejected. Role checks are exposed as **booleans** (e.g., `isAdmin`, not `isAdmin()`). Context value is memoized with `useMemo`.
2. **DataContext** (`src/context/DataContext.jsx`) — Central CRUD for all domain entities (items, menus, schedules, screens). Every mutation is logged to an activity log. All state persists to localStorage under `canteen_*` keys. All getter and mutation functions are wrapped in `useCallback`, and the context value is memoized with `useMemo`. **Single-schedule constraint**: only one schedule exists in the system — `createSchedule()` and `deleteSchedule()` always return errors.
3. **NotificationContext** (`src/context/NotificationContext.jsx`) — Toast notifications with 3-second auto-dismiss. This is the single source of truth for notification timing.

Access via hooks: `useAuth()`, `useData()`, `useNotification()`.

### Data Model Relationships

```
Items ←(many-to-many)→ Menus ←(referenced by)→ Schedules/Screens
                                                      ↓
                                              TimeSlots (time ranges + day filters + menu reference)
```

- **Items**: Food/beverage entries with name, price, ingredients, category, and base64-encoded images
- **Menus**: Collections of item IDs with a title
- **Schedules**: A single named collection of time slots (only one allowed), each slot maps a time range + days-of-week to a menu, plus a `defaultMenuId` fallback
- **Screens**: Display configurations with background/foreground media, their own time slots, a `defaultMenuId`, and `displaySettings` (orientation, tokenWindow, foregroundMediaDisplay, showPrices, transitionDuration, slideDelay). The auto-generated `id` field (e.g., `screen-001`) is used in gallery URLs — there is no separate user-set screenId

### Routing

Defined in `src/App.jsx`. Two route types:
- **Public**: `/login`, `/gallery/:screenId` (full-screen display for TVs/monitors, no auth required)
- **Protected**: Everything else, wrapped in `ProtectedRoute` which checks `useAuth()`

The gallery listing was merged into the Screens page — there is no separate `/gallery` admin page. The public fullscreen display route remains:
- **GalleryViewPage** (`/gallery/:screenId`, public) — The customer-facing full-screen display. Uses the screen's auto-generated `id` as the URL param. Recalculates the active menu every 60 seconds based on the current time (no page reload). Auto-enters browser fullscreen on mount.
- Each `ScreenCard` on `/screens` has a "Copy URL" button to copy the public display URL and a "Preview" button to open it.

### Time-Based Display Logic

The core business logic lives in `src/utils/timeUtils.js` (375+ lines). This determines which menu to show on a screen at any given moment by:
1. Getting the screen's time slots
2. Filtering by current day-of-week
3. Finding slots that contain the current time
4. Falling back to the screen's default menu if no slot matches

The `TimeBasedRenderer` component (`src/components/gallery/TimeBasedRenderer.jsx`) orchestrates this at runtime. Child components (`MenuGrid`, `PageIndicators`, `TokenPanelPortrait`, `TokenPanelLandscape`) are wrapped in `React.memo` for performance.

### File/Media Handling

`src/utils/fileUtils.js` converts uploaded images/videos to base64 strings stored directly in localStorage. This is a demo constraint — production would use cloud storage.

### Voice/Speech

`src/utils/speechUtils.js` wraps the Web Speech API for token-number announcements on the token management page.

## Key Conventions

- **Styling**: Tailwind CSS utility classes exclusively. Custom theme extensions (colors, fonts, breakpoints including `3xl: 2000px`) are in `tailwind.config.js`.
- **Components**: Container/presenter pattern — `src/pages/` components manage state, `src/components/` handle presentation.
- **Validation**: Centralized in `src/utils/validators.js` with functions per entity type (`validateItem`, `validateMenu`, `validateSchedule`, `validateScreen`, `validateTimeSlot`).
- **Icons**: `lucide-react` for all icons.
- **Date/Time**: `date-fns` for formatting, custom utils in `timeUtils.js` for schedule logic.
- **Currency**: Bangladeshi Taka (৳). Prices display with `toFixed(0)` (whole numbers).
- **Assets**: Always import via `src/assets/index.js` (e.g., `import { hospitalLogo } from '../assets'`). Never hardcode `/src/assets/` paths — they break in production builds.
- **User feedback**: Use `useNotification()` for error/success messages — never `alert()`. Use `ConfirmDialog` component for confirmations — never `window.confirm()`.
- **Context performance**: Context values are memoized. When adding new functions to a context, wrap them in `useCallback`. When adding new derived values, use `useMemo`.
- **ImageUpload**: Accepts an `onError` callback prop for validation/processing errors. Always pass it from the parent form.

## Deployment

Deployed on Vercel. `vercel.json` configures SPA fallback routing. No environment variables are required.

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Manager | manager | manager123 |
| Token Operator | operator | operator123 |
