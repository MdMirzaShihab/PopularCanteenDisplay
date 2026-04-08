# Code Conventions

**Applies to:** `src/**/*`

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase + `.jsx` | `ScreenCard.jsx`, `FoodScreenForm.jsx` |
| Utilities | camelCase + `.js` | `timeUtils.js`, `validators.js` |
| Context | PascalCase + `.jsx` | `AuthContext.jsx`, `NotificationContext.jsx` |
| Custom hooks | camelCase + `.js` | `useItems.js`, `usePagination.js` |
| API services | camelCase + `.api.js` | `items.api.js`, `auth.api.js` |
| Data | camelCase + `.js` | `mockData.js` |

## Exports

- **Components**: default export only
- **Utilities**: named exports
- **Context hooks**: named exports (`useAuth`, `useNotification`)
- **Domain hooks**: named exports from `src/hooks/` (e.g., `useItems`, `useMenus`)
- **API services**: named exports from `src/api/` (e.g., `getItems`, `createItem`)
- **Gallery styles**: barrel export from `src/components/gallery/styles/index.js`
- **Assets**: barrel export from `src/assets/index.js`

## Component Structure Order

1. Imports
2. Props destructuring with defaults
3. Hooks (context, state, refs, effects)
4. Handler functions
5. Render logic
6. Default export

## Container/Presenter Pattern

- `src/pages/` — containers (state management, hooks, business logic)
- `src/components/` — presenters (display, receive data via props)

## API Service Pattern

API services are pure functions (no React logic) that return promises:

```javascript
// src/api/[entity].api.js
import apiClient from './client';

export const getEntities = ({ page, limit } = {}) =>
  apiClient.get('/entities', { params: { page, limit } }).then((r) => r.data);

export const createEntity = (data) =>
  apiClient.post('/entities', data).then((r) => r.data);
```

## Domain Hook Pattern

Domain hooks manage state + API calls for one entity:

```javascript
// src/hooks/use[Entity].js
export const useEntity = ({ limit = 20 } = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const pagination = usePagination({ defaultLimit: limit });
  const notification = useNotification();

  const fetchData = useCallback(async () => { /* API call */ }, [deps]);
  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, pagination, createEntity, updateEntity, deleteEntity };
};
```

## Validation Pattern

All validators return the same shape:

```javascript
export const validateEntity = (data) => {
  const errors = {};
  // field checks...
  return {
    isValid: Object.keys(errors).length === 0,
    errors  // field-keyed object for form display
  };
};
```

One validator per entity: `validateItem`, `validateMenu`, `validateFoodScreen`, `validateTokenScreen`, `validateTimeSlot`, `validateUser`

## Asset Imports

Always import via `src/assets/index.js`:
```javascript
import { hospitalLogo } from '../assets';
```

**Never** hardcode `/src/assets/` paths — they break in production builds.

## User Feedback

- Errors/success: `useNotification()` — never `alert()`
- Confirmations: `ConfirmDialog` component — never `window.confirm()`
- `ImageUpload` accepts `onError` callback for validation errors — always pass it

## Naming Conventions

- Event handlers: `handle[Event]` (e.g., `handleSubmit`, `handleDelete`)
- Booleans: `is`/`has` prefix (e.g., `isAdmin`, `hasItems`)
- IDs: MongoDB `_id` (ObjectId strings) in production; legacy format `[entity]-[number]` in localStorage

## JavaScript Only

No TypeScript. No `.ts`/`.tsx` files, type annotations, or TS configs.
