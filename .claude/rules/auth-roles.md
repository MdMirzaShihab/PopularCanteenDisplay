# Authentication & Roles

**Applies to:** `src/context/AuthContext.jsx`, `src/pages/**/*`, `src/components/**/*`

## Three Roles

| Role | Username | Password | Access |
|------|----------|----------|--------|
| `admin` | admin | admin123 | Full system access |
| `restaurant_user` | manager | manager123 | Menu/item/screen management |
| `token_operator` | operator | operator123 | Token management only |

## Auth Rules

- Only predefined accounts in `mockData.js` are accepted
- Unknown credentials are **always rejected** — no registration
- Password is stripped from the stored user object before saving to context/localStorage
- User persisted to localStorage key: `canteen_auth_user`

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

## Future Migration Note

Production will use JWT-based auth with a Node.js/Express backend. Roles will be stored server-side. The `useAuth()` hook interface and boolean role checks will remain the same — only the auth mechanism (localStorage → JWT + API) changes.
