# Architecture Rules

**Applies to:** `src/**/*`

## Directory Structure

```
src/
├── assets/          # Images, index.js barrel export
├── components/      # Presentational components (by domain)
│   ├── common/      # Reusable (ConfirmDialog, ImageUpload, Modal, Layout, etc.)
│   ├── gallery/     # Gallery display system
│   │   ├── styles/  # Layout renderers (CardGrid, Catalog, Compact, Elegant, MenuBoard, MinimalRows)
│   │   └── themes/  # layoutRegistry.js, visualStyleRegistry.js
│   ├── items/       # Item management (ItemCard, ItemForm, ItemList)
│   ├── menus/       # Menu management (MenuCard, MenuForm, MenuItemSelector, MenuList)
│   ├── schedules/   # Schedule management (hidden — not active in current demo)
│   ├── screens/     # Screen configuration (FoodScreenForm, TokenScreenForm, ScreenCard, TokenScreenCard)
│   ├── token/       # Token archive display (TokenArchiveFilters, TokenArchiveGroup, TokenArchiveSection)
│   ├── users/       # User management (UserForm, UserList)
│   └── logs/        # Activity logging
├── context/         # React Context providers (AuthContext, DataContext, NotificationContext)
├── data/            # mockData.js (seed data)
├── hooks/           # Custom hooks (useTokenArchive)
├── pages/           # Container components (state + business logic)
└── utils/           # Utilities (validators, timeUtils, fileUtils, mediaUtils, speechUtils, tokenArchiveUtils)
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
Items ←(many-to-many)→ Menus ←(referenced by)→ Food Screens
                                                      ↓
                                              Sections (time slots + menu + layout config)

Token Screens (independent — display token serving numbers)
Users (managed via admin panel)
```

- **Items**: name, price, ingredients, category, base64 image
- **Menus**: title + array of item IDs
- **Food Screens**: Display config with sections (each section has time slots, menu ref, layout/visual style) + background/foreground media + `displaySettings`
- **Token Screens**: Token display configuration (separate from food screens)
- **Users**: Managed accounts with role assignments

## Routing

Two route types in `App.jsx`:

**Public (no auth):**
- `/login`
- `/gallery/:screenId` — Full-screen display for TVs/monitors

**Protected (auth required, wrapped in Layout):**
- `/dashboard`, `/items`, `/menus`, `/screens`, `/users`, `/logs`, `/token`
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

Gallery components (`GalleryDisplay`, `ScreenGridRenderer`, `SectionRenderer`) recalculate active menu every 60 seconds via `setInterval`.

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

## Performance

- Gallery components wrapped in `React.memo`
- Grid container measured with `useRef` for responsive sizing

## Future Migration Note

Production will use MERN stack (MongoDB, Express.js, React.js, Node.js). The context layer will be replaced with API calls + server-side state. The component/page structure and time logic will carry over.
