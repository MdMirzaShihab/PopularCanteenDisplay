# Architecture Rules

**Applies to:** `src/**/*`

## Directory Structure

```
src/
├── assets/          # Images, index.js barrel export
├── components/      # Presentational components (by domain)
│   ├── common/      # Reusable (ConfirmDialog, ImageUpload, etc.)
│   ├── gallery/     # Gallery display (MenuGrid, PageIndicators, TokenPanels)
│   ├── items/       # Item management
│   ├── menus/       # Menu management
│   ├── schedules/   # Schedule management (hidden — not active in current demo)
│   ├── screens/     # Screen configuration
│   └── logs/        # Activity logging
├── context/         # React Context providers (AuthContext, DataContext, NotificationContext)
├── data/            # mockData.js (seed data)
├── pages/           # Container components (state + business logic)
└── utils/           # Utilities (validators, timeUtils, fileUtils, speechUtils)
```

## Three-Context State Model

All state flows through three Context providers nested in `main.jsx`:

```
NotificationProvider (outermost)
  → AuthProvider
    → DataProvider (innermost)
      → App
```

**This order is mandatory** — DataProvider calls `useAuth()` internally.

Access via hooks: `useAuth()`, `useData()`, `useNotification()`

### Context Performance Rules

- All context values memoized with `useMemo`
- All mutation functions wrapped in `useCallback`
- New functions added to a context MUST follow this pattern

## Data Model Relationships

```
Items ←(many-to-many)→ Menus ←(referenced by)→ Screens
                                                      ↓
                                              TimeSlots (time range + days + menu ref)
```

- **Items**: name, price, ingredients, category, base64 image
- **Menus**: title + array of item IDs
- **Screens**: Display config + own time slots + `defaultMenuId` + `displaySettings`

<!-- Schedule feature is hidden in current demo. Code exists but is not exposed in the UI.
- **Schedules**: Single named collection of time slots + `defaultMenuId`
- **Single-schedule constraint**: Only one schedule exists — createSchedule()/deleteSchedule() always error
-->

## Routing

Two route types in `App.jsx`:

**Public (no auth):**
- `/login`
- `/gallery/:screenId` — Full-screen display for TVs/monitors

**Protected (auth required, wrapped in Layout):**
- `/dashboard`, `/items`, `/menus`, `/screens`, `/logs`, `/token`
<!-- /schedules and /current-menu routes exist but are hidden in current demo -->
- Index → redirects to `/dashboard`
- Catch-all → redirects to `/dashboard`

Route guards check `loading` state to prevent race conditions during auth initialization.

## Time-Based Display Logic

Core logic in `src/utils/timeUtils.js`:

1. Get screen's time slots
2. Filter by current day-of-week
3. Find slots containing current time (handles overnight spans)
4. Fall back to screen's `defaultMenuId` if no match

`TimeBasedRenderer` recalculates active menu every 60 seconds via `setInterval`.

## Performance

- Child gallery components (`MenuGrid`, `PageIndicators`, `TokenPanelPortrait`, `TokenPanelLandscape`) wrapped in `React.memo`
- Grid container measured with `useRef` for responsive sizing

## Future Migration Note

Production will use MERN stack (MongoDB, Express.js, React.js, Node.js). The context layer will be replaced with API calls + server-side state. The component/page structure and time logic will carry over.
