# Architecture Rules

**Applies to:** `src/**/*`

## Directory Structure

```
src/
├── api/             # Backend API services (axios calls)
│   ├── client.js    # Axios instance, auth interceptor, base URL config
│   ├── auth.api.js  # Login, logout, getMe
│   ├── items.api.js # CRUD + paginated list
│   ├── menus.api.js
│   ├── foodScreens.api.js
│   ├── tokenScreens.api.js
│   ├── tokens.api.js       # Current token, history, archive
│   ├── users.api.js
│   ├── logs.api.js
│   ├── upload.api.js        # Presigned URLs for R2 cloud storage
│   └── screens.api.js       # Public unified screen lookup
├── assets/          # Images, index.js barrel export
├── components/      # Presentational components (by domain)
│   ├── common/      # Reusable (ConfirmDialog, ImageUpload, Modal, Layout, Pagination, etc.)
│   ├── gallery/     # Gallery display system
│   │   ├── styles/  # Layout renderers (CardGrid, Catalog, Compact, Elegant, MenuBoard, MinimalRows)
│   │   └── themes/  # layoutRegistry.js, visualStyleRegistry.js
│   ├── items/       # Item management (ItemCard, ItemForm, ItemList)
│   ├── menus/       # Menu management (MenuCard, MenuForm, MenuItemSelector, MenuList)
│   ├── schedules/   # Schedule management (hidden — not active)
│   ├── screens/     # Screen configuration (FoodScreenForm, TokenScreenForm, ScreenCard, TokenScreenCard)
│   ├── token/       # Token archive display (TokenArchiveFilters, TokenArchiveGroup, TokenArchiveSection)
│   ├── users/       # User management (UserForm, UserList)
│   └── logs/        # Activity logging (ActivityTable, LogFilters)
├── context/         # React Context providers
│   ├── AuthContext.jsx        # Auth state (PENDING: still localStorage-based)
│   ├── DataContext.jsx        # Legacy localStorage CRUD (PENDING DELETION)
│   └── NotificationContext.jsx # Toast notifications
├── data/            # mockData.js (legacy seed data, PENDING DELETION)
├── hooks/           # Domain state management + custom hooks
│   ├── useItems.js         # API-based items CRUD + pagination
│   ├── useMenus.js         # API-based menus CRUD + pagination
│   ├── useFoodScreens.js   # API-based food screen CRUD
│   ├── useTokenScreens.js  # API-based token screen CRUD
│   ├── useTokens.js        # API-based token management + archive
│   ├── useUsers.js         # API-based user management
│   ├── useLogs.js          # API-based activity logs
│   ├── usePagination.js    # Reusable pagination state
│   ├── useSocketTokens.js  # Socket.io real-time token listener
│   └── useTokenArchive.js  # Legacy hook (PENDING DELETION)
├── pages/           # Container components (state + business logic)
└── utils/           # Utilities (validators, timeUtils, fileUtils, mediaUtils, speechUtils)
```

## Hybrid Architecture (Migration In Progress)

The codebase has two parallel state management systems:

### Legacy System (still active in pages)
- `DataContext.jsx` — ~700-line context with all CRUD operations, syncs to localStorage
- Pages call `useData()` to access items, menus, screens, etc.
- Data persisted under `canteen_*` localStorage keys

### New System (built, not yet wired to pages)
- `src/api/` — Axios service layer calling Express backend
- `src/hooks/` — Domain hooks (`useItems`, `useMenus`, etc.) with fetch-on-mount + pagination
- `useSocketTokens.js` — Socket.io real-time token updates
- Cookie-based auth (httpOnly JWT)

**Migration direction:** Pages will be migrated one-by-one from `useData()` → domain hooks. Once all pages are migrated, `DataContext.jsx` and `mockData.js` will be deleted.

## API Client Architecture

```
src/api/client.js
  → Axios instance with baseURL: VITE_API_URL + '/api/v1'
  → withCredentials: true (cookie auth)
  → 401 interceptor calls registerAuthExpiredHandler() callback
  → Error normalizer extracts message from response

src/api/*.api.js
  → Pure functions returning promises (no React logic)
  → Each file covers one domain entity
  → Pagination via { page, limit } params
```

## Domain Hook Pattern

```
src/hooks/use[Entity].js
  → Calls corresponding API service on mount
  → Manages local state (items, loading, error)
  → Uses usePagination() for paginated lists
  → Returns { data, loading, pagination, CRUD functions }
  → Uses useNotification() for error/success feedback
```

## Context Model (Current)

Three Context providers nested in `main.jsx`:

```
NotificationProvider (outermost)
  → AuthProvider
    → DataProvider (innermost — WILL BE REMOVED after migration)
      → App
```

**This order is mandatory** — DataProvider calls `useAuth()` internally.

Access via hooks: `useAuth()`, `useData()` (legacy), `useNotification()`

### Context Performance Rules

- All context values memoized with `useMemo`
- All mutation functions wrapped in `useCallback`
- New functions added to a context MUST follow this pattern

## Data Model Relationships

```
Items ←(many-to-many)→ Menus ←(referenced by)→ Food Screens
                                                      ↓
                                              Sections (time slots + menu + layout config)

Token Screens (independent — display token serving numbers)
Users (managed via admin panel)
```

- **Items**: name, price, ingredients, category, image (base64 in legacy, cloud URL in production)
- **Menus**: title + array of item IDs
- **Food Screens**: Display config with sections + background/foreground media + `displaySettings`
- **Token Screens**: Token display configuration (separate from food screens)
- **Users**: Managed accounts with role assignments

## Routing

Two route types in `App.jsx`:

**Public (no auth):**
- `/login`
- `/gallery/:screenId` — Full-screen display for TVs/monitors

**Protected (auth required, wrapped in Layout):**
- `/dashboard`, `/items`, `/menus`, `/screens`, `/users`, `/logs`, `/token`
- Index → redirects to `/dashboard`
- Catch-all → redirects to `/dashboard`

Route guards check `loading` state to prevent race conditions during auth initialization.

## Time-Based Display Logic

Core logic in `src/utils/timeUtils.js`:

1. Get screen's time slots
2. Filter by current day-of-week
3. Find slots containing current time (handles overnight spans)
4. Fall back to screen's `defaultMenuId` if no match

Gallery components recalculate active menu every 60 seconds via `setInterval`.

## Gallery Rendering Pipeline

```
GalleryDisplay → ScreenGridRenderer → SectionRenderer → Layout Renderer (from styles/)
                                                         ↑
                                                   layoutRegistry.js + visualStyleRegistry.js (from themes/)
```

- **Layout renderers** in `gallery/styles/`: CardGrid, Catalog, Compact, Elegant, MenuBoard, MinimalRows
- **Theme registries** in `gallery/themes/`: map layout/visual style keys to renderer components and style configs
- `MediaSlideshow` handles background/foreground media cycling
- `TokenGalleryDisplay` renders token-type screens separately

## Real-Time Token Updates

- `useSocketTokens.js` connects to `VITE_API_URL/tokens` Socket.io namespace
- Listens for `token-updated` events with `{ currentToken, history }` payload
- Used by gallery token displays for live serving number updates

## Performance

- Gallery components wrapped in `React.memo`
- Grid container measured with `useRef` for responsive sizing
