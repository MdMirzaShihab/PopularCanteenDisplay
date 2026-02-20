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

All application state flows through three React Context providers (wrapped in `main.jsx`):

1. **AuthContext** (`src/context/AuthContext.jsx`) — Authentication and role-based access. Three roles: `admin`, `restaurant_user`, `token_operator`. Mock auth accepts any credentials; predefined accounts are in `mockData.js`.
2. **DataContext** (`src/context/DataContext.jsx`) — Central CRUD for all domain entities (items, menus, schedules, screens). Every mutation is logged to an activity log. All state persists to localStorage under `canteen_*` keys.
3. **NotificationContext** (`src/context/NotificationContext.jsx`) — Toast notifications with 3-second auto-dismiss.

Access via hooks: `useAuth()`, `useData()`, `useNotification()`.

### Data Model Relationships

```
Items ←(many-to-many)→ Menus ←(referenced by)→ Schedules/Screens
                                                      ↓
                                              TimeSlots (time ranges + day filters + menu reference)
```

- **Items**: Food/beverage entries with base64-encoded images
- **Menus**: Collections of item IDs
- **Schedules**: Named collections of time slots, each slot maps a time range to a menu
- **Screens**: Display configurations with background/foreground media, their own time slots, and a screenId used in gallery URLs

### Routing

Defined in `src/App.jsx`. Two route types:
- **Public**: `/login`, `/gallery/:screenId` (the display screen URL meant for TVs/monitors)
- **Protected**: Everything else, wrapped in `ProtectedRoute` which checks `useAuth()`

The gallery route (`/gallery/:screenId`) is the key customer-facing feature — a full-screen 16:9 display that auto-refreshes every 60 seconds and switches menus based on the current time.

### Time-Based Display Logic

The core business logic lives in `src/utils/timeUtils.js` (375+ lines). This determines which menu to show on a screen at any given moment by:
1. Getting the screen's time slots
2. Filtering by current day-of-week
3. Finding slots that contain the current time
4. Falling back to the screen's default menu if no slot matches

The `TimeBasedRenderer` component (`src/components/gallery/TimeBasedRenderer.jsx`) orchestrates this at runtime.

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

## Deployment

Deployed on Vercel. `vercel.json` configures SPA fallback routing. No environment variables are required.

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Manager | manager | manager123 |
| Token Operator | operator | operator123 |
