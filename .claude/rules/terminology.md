# Terminology & Domain Knowledge

## Core Entities

- **Item**: A food/beverage entry — name, price, description, ingredients, category, image
- **Menu**: A named collection of item IDs (many-to-many with Items)
- **Food Screen**: A display configuration for a physical TV/monitor showing food menus. Has sections (each with time slots + menu ref + layout/visual style), background/foreground media, and `displaySettings`
- **Token Screen**: A display configuration for token serving number displays (separate from food screens)
- **Section**: A configurable block within a food screen — contains time slots, menu reference, and layout/visual style settings
- **TimeSlot**: A rule mapping a time range + days-of-week filter to a menu. Used inside screen sections
- **Token**: A serving number called out to customers (voice announcement via Web Speech API)
- **Token Archive**: Historical record of called tokens
- **User**: A managed account with role assignment (admin, restaurant_user, token_operator)

## Food Screen Fields

| Field | Purpose |
|-------|---------|
| `title` | Screen display name |
| `screenId` | Human-readable identifier |
| `layoutTheme` | Layout ID from layoutRegistry (e.g., `layout-1`, `layout-p3`) |
| `backgroundType` | `'color'` / `'image'` / `'video'` |
| `backgroundMedia` | Background media (base64 in legacy, cloud URL in production) |
| `backgroundColor` | Hex color (if color type) |
| `sections` | Array of section configs (count must match layout) |
| `gap` | Pixel gap between sections (4, 8, or 12; default 8) |

## Section Content Fields

Each section has `defaultContent` and optional `timeSlots[].content` with:

| Field | Purpose |
|-------|---------|
| `type` | `'menu'` or `'media'` |
| `menuId` | Menu reference (if menu type) |
| `visualStyle` | Style renderer ID: `card-grid`, `elegant`, `compact`, `catalog`, `menu-board`, `minimal-rows` |
| `titleFont` | Font class for section title (e.g., `font-heading`) |
| `titleColor` | Hex color for section title |
| `media` | Array of media URLs/base64 strings (if media type, max 10) |
| `slideDuration` | Seconds between slides (default 5) |
| `transition` | Transition effect: `crossfade`, `slide`, `fadeBlack`, `zoom`, `cut` |

## Gallery Styles & Themes

Food screen sections use a layout + visual style system:

- **Layout styles**: CardGrid, Catalog, Compact, Elegant, MenuBoard, MinimalRows (in `gallery/styles/`)
- **Theme registries**: `layoutRegistry.js` maps layout keys to renderer components; `visualStyleRegistry.js` maps visual style keys to style configs (in `gallery/themes/`)

## Screen IDs & Gallery URLs

- Screen `id`: MongoDB `_id` in production, auto-generated `food-screen-001` format in legacy
- Gallery URL format: `/gallery/:screenId`
- `ScreenCard` (food) and `TokenScreenCard` (token) have "Copy URL" and "Preview" buttons

## Time Logic

- Time format: `HH:MM` (24-hour, zero-padded)
- Day format: lowercase full name (`'monday'`, `'tuesday'`, etc.)
- `timeToMinutes()` converts to minutes-since-midnight for range comparisons
- **Overnight slots**: when end time < start time, the slot spans midnight (handled explicitly)
- Menu recalculation: every 60 seconds via `setInterval` (no page reload)

## API Endpoints

Backend base URL: `VITE_API_URL/api/v1`

| Endpoint | Methods | Notes |
|----------|---------|-------|
| `/auth/login`, `/auth/logout`, `/auth/me` | POST, POST, GET | Cookie-based JWT |
| `/items` | GET, POST, PUT, DELETE | Paginated list |
| `/menus` | GET, POST, PUT, DELETE | Paginated list |
| `/food-screens` | GET, POST, PUT, DELETE | |
| `/token-screens` | GET, POST, PUT, DELETE | |
| `/tokens` | GET, POST | Current token, history, archive |
| `/users` | GET, POST, PUT, DELETE | Admin only |
| `/logs` | GET | Activity logs |
| `/upload/presigned-url` | POST | R2 cloud storage upload |
| `/screens/:screenId` | GET | Public unified lookup (food or token) |

## Common Gotchas

1. **Two screen types** — Food screens and token screens are separate entities with different forms, cards, and storage
2. **Hidden pages** — `SchedulesPage` and `CurrentMenuPage` still reference deleted DataContext. They need a rewrite if re-enabled
3. **Schedule is hidden** — The schedule feature exists in code but is not active in the UI
4. **Screen ID = URL param** — The `id` field is what appears in `/gallery/:screenId`
5. **No separate gallery admin page** — Gallery listing was merged into the Screens page
6. **Overnight time slots** — `isTimeInRange()` handles the case where end < start
7. **Boolean role checks** — `isAdmin` is a boolean, not a function. Don't call `isAdmin()`
8. **Context nesting order** — NotificationProvider → AuthProvider → DataProvider. Changing this breaks the app
9. **Asset imports** — Always through `src/assets/index.js`, never direct paths
10. **Cookie auth** — API client uses `withCredentials: true`. Backend sets httpOnly cookie. No manual token management needed
