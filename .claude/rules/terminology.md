# Terminology & Domain Knowledge

## Core Entities

- **Item**: A food/beverage entry — name, price, description, ingredients, category, base64 image
- **Menu**: A named collection of item IDs (many-to-many with Items)
- **Food Screen**: A display configuration for a physical TV/monitor showing food menus. Has sections (each with time slots + menu ref + layout/visual style), background/foreground media, and `displaySettings`. Stored in `canteen_food_screens`
- **Token Screen**: A display configuration for token serving number displays. Stored separately in `canteen_token_screens`
- **Section**: A configurable block within a food screen — contains time slots, menu reference, and layout/visual style settings
- **TimeSlot**: A rule mapping a time range + days-of-week filter to a menu. Used inside screen sections
- **Token**: A serving number called out to customers (voice announcement via Web Speech API)
- **Token Archive**: Historical record of called tokens, stored in `canteen_token_archive`
- **User**: A managed account with role assignment (admin, restaurant_user, token_operator). Stored in `canteen_users`

## Food Screen Fields

| Field | Purpose |
|-------|---------|
| `title` | Screen display name |
| `screenId` | Human-readable identifier |
| `layoutTheme` | Layout ID from layoutRegistry (e.g., `layout-1`, `layout-p3`) |
| `backgroundType` | `'color'` / `'image'` / `'video'` |
| `backgroundMedia` | Base64 background (if image/video) |
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
| `media` | Array of base64 strings (if media type, max 10) |
| `slideDuration` | Seconds between slides (default 5) |
| `transition` | Transition effect: `crossfade`, `slide`, `fadeBlack`, `zoom`, `cut` |

## Gallery Styles & Themes

Food screen sections use a layout + visual style system:

- **Layout styles**: CardGrid, Catalog, Compact, Elegant, MenuBoard, MinimalRows (in `gallery/styles/`)
- **Theme registries**: `layoutRegistry.js` maps layout keys to renderer components; `visualStyleRegistry.js` maps visual style keys to style configs (in `gallery/themes/`)

## Screen IDs & Gallery URLs

- Screen `id` is auto-generated (e.g., `food-screen-001`, `token-screen-001`)
- Gallery URL format: `/gallery/food-screen-001`
- `ScreenCard` (food) and `TokenScreenCard` (token) have "Copy URL" and "Preview" buttons

## Time Logic

- Time format: `HH:MM` (24-hour, zero-padded)
- Day format: lowercase full name (`'monday'`, `'tuesday'`, etc.)
- `timeToMinutes()` converts to minutes-since-midnight for range comparisons
- **Overnight slots**: when end time < start time, the slot spans midnight (handled explicitly)
- Menu recalculation: every 60 seconds via `setInterval` (no page reload)

## localStorage Keys

All state persists under `canteen_*` prefix:

| Key | Content |
|-----|---------|
| `canteen_items` | All food items |
| `canteen_menus` | All menus |
| `canteen_food_screens` | Food screen configs |
| `canteen_token_screens` | Token screen configs |
| `canteen_users` | Managed user accounts |
| `canteen_logs` | Activity log |
| `canteen_token_history` | Last 3 tokens (most recent first) |
| `canteen_token_archive` | Historical token archive |
| `canteen_auth_user` | Logged-in user object |

## Common Gotchas

1. **Two screen types** — Food screens and token screens are separate entities with different forms (`FoodScreenForm` vs `TokenScreenForm`), cards, and localStorage keys
2. **Schedule is hidden** — The schedule feature exists in code but is not active in the current demo UI
3. **Screen ID = URL param** — The auto-generated `id` field is what appears in `/gallery/:screenId`
4. **No separate gallery admin page** — Gallery listing was merged into the Screens page
5. **Overnight time slots** — `isTimeInRange()` handles the case where end < start
6. **Base64 media** — Images/videos stored as base64 in localStorage (demo constraint). Watch for `QuotaExceededError`
7. **Boolean role checks** — `isAdmin` is a boolean, not a function. Don't call `isAdmin()`
8. **Context nesting order** — NotificationProvider → AuthProvider → DataProvider. Changing this breaks the app
9. **Asset imports** — Always through `src/assets/index.js`, never direct paths
10. **Old `canteen_screens` key** — Migrated to `canteen_food_screens`. DataContext removes the old key on init

## Future Migration Notes

- localStorage → MongoDB collections
- Base64 images → Cloud storage (S3/Cloudinary)
- Mock auth → JWT + Express API
- `canteen_*` keys → API endpoints
- `QuotaExceededError` handling becomes irrelevant
