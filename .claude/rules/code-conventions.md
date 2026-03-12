# Code Conventions

**Applies to:** `src/**/*`

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase + `.jsx` | `ScreenCard.jsx`, `FoodScreenForm.jsx` |
| Utilities | camelCase + `.js` | `timeUtils.js`, `validators.js` |
| Context | PascalCase + `.jsx` | `AuthContext.jsx`, `DataContext.jsx` |
| Custom hooks | camelCase + `.js` | `useTokenArchive.js` |
| Data | camelCase + `.js` | `mockData.js` |

## Exports

- **Components**: default export only
- **Utilities**: named exports
- **Context hooks**: named exports (`useAuth`, `useData`, `useNotification`)
- **Custom hooks**: named exports from `src/hooks/` (e.g., `useTokenArchive`)
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
- IDs: auto-generated format `[entity]-[number]` (e.g., `screen-001`, `item-001`)

## JavaScript Only

No TypeScript. No `.ts`/`.tsx` files, type annotations, or TS configs.
