# Authentication & Roles

**Applies to:** `src/context/AuthContext.jsx`, `src/api/auth.api.js`, `src/pages/**/*`, `src/components/**/*`

## Three Roles

| Role | Username | Password | Access |
|------|----------|----------|--------|
| `admin` | admin | admin123 | Full system access |
| `restaurant_user` | manager | manager123 | Menu/item/screen management |
| `token_operator` | operator | operator123 | Token management only |

## Auth Architecture

- API endpoints: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- httpOnly cookie-based JWT auth (`withCredentials: true` in axios client)
- 401 interceptor in `src/api/client.js` calls `registerAuthExpiredHandler()` to trigger logout
- No JWT stored in localStorage — cookie is managed by the browser
- Session restored on mount via `GET /auth/me`

## Role Checks

Role checks are exposed as **boolean properties**, NOT functions:

```javascript
// CORRECT
const { isAdmin, isRestaurantUser, isTokenOperator } = useAuth();
if (isAdmin) { /* ... */ }

// WRONG — these are not functions
if (isAdmin()) { /* ... */ }
```

## Route Protection

- `ProtectedRoute` checks `isAuthenticated` from `useAuth()`
- Shows `LoadingSpinner` while `loading` is true (prevents flash)
- Unauthenticated users redirected to `/login`
- `PublicRoute` redirects authenticated users to `/dashboard`
- Gallery route (`/gallery/:screenId`) is **unprotected** — no auth required
