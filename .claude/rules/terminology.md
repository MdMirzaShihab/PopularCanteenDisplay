# Terminology & Domain Knowledge

## Core Entities

- **Item**: A food/beverage entry — name, price, description, ingredients, category, base64 image
- **Menu**: A named collection of item IDs (many-to-many with Items)
- **Screen**: A display configuration for a physical TV/monitor. Has its own time slots, `defaultMenuId`, background/foreground media, and `displaySettings`
- **TimeSlot**: A rule mapping a time range + days-of-week filter to a menu. Used inside Screens

<!-- Schedule feature is hidden in current demo. Code exists but is not exposed in the UI.
- **Schedule**: A single named collection of time slots plus a `defaultMenuId` fallback. Only one schedule exists — creation/deletion always errors
-->
- **Token**: A serving number called out to customers (voice announcement via Web Speech API)

## Display Settings

Each Screen has a `displaySettings` object:

| Field | Purpose |
|-------|---------|
| `orientation` | Portrait or landscape layout |
| `tokenWindow` | Show/hide token serving panel |
| `foregroundMediaDisplay` | How foreground media is displayed |
| `showPrices` | Toggle price visibility |
| `transitionDuration` | Animation duration between pages |
| `slideDelay` | Auto-advance delay between pages |

## Screen IDs & Gallery URLs

- Screen `id` is auto-generated (e.g., `screen-001`) — there is no separate user-set screenId
- Gallery URL format: `/gallery/screen-001`
- Each `ScreenCard` has "Copy URL" and "Preview" buttons

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
<!-- | `canteen_schedules` | The single schedule (hidden feature) | -->
| `canteen_screens` | All screen configs |
| `canteen_logs` | Activity log |
| `canteen_token_history` | Last 3 tokens (most recent first) |
| `canteen_auth_user` | Logged-in user object |

## Common Gotchas

1. **Schedule is hidden** — The schedule feature exists in code but is not active in the current demo UI
2. **Screen ID = URL param** — The auto-generated `id` field is what appears in `/gallery/:screenId`
3. **No separate gallery admin page** — Gallery listing was merged into the Screens page
4. **Overnight time slots** — `isTimeInRange()` handles the case where end < start
5. **Base64 media** — Images/videos stored as base64 in localStorage (demo constraint). Watch for `QuotaExceededError`
6. **Boolean role checks** — `isAdmin` is a boolean, not a function. Don't call `isAdmin()`
7. **Context nesting order** — NotificationProvider → AuthProvider → DataProvider. Changing this breaks the app
8. **Asset imports** — Always through `src/assets/index.js`, never direct paths

## Future Migration Notes

- localStorage → MongoDB collections
- Base64 images → Cloud storage (S3/Cloudinary)
- Mock auth → JWT + Express API
- `canteen_*` keys → API endpoints
- `QuotaExceededError` handling becomes irrelevant
