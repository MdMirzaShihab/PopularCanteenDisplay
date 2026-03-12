# Development Workflows

## New Feature Workflow

1. Read the relevant page in `src/pages/` to understand current state
2. Check data model — does it need new fields in `DataContext`?
3. If new entity fields: update `mockData.js` seed data
4. Add validation rules in `src/utils/validators.js`
5. Create/update components in `src/components/[domain]/`
6. Wire up the page in `src/pages/`
7. Add route in `src/App.jsx` if needed
8. Run `npm run lint` and `npm run build`

## Adding a New Context Function

1. Add the function in the relevant context file (`DataContext.jsx`, `AuthContext.jsx`, etc.)
2. Wrap it in `useCallback` with correct dependencies
3. Add it to the context value object (already memoized with `useMemo`)
4. Log mutations to the activity log (DataContext pattern: `addLog()` after every state change)

## Adding a New Screen Display Feature

1. Determine if the feature applies to food screens, token screens, or both
2. Update `displaySettings` shape in the relevant form (`FoodScreenForm.jsx` or `TokenScreenForm.jsx`)
3. Update the relevant validator in `validators.js`
4. Update gallery rendering: `GalleryDisplay.jsx` → `ScreenGridRenderer.jsx` → `SectionRenderer.jsx` as needed
5. If adding a new layout style: create renderer in `gallery/styles/`, register in `gallery/themes/layoutRegistry.js`
6. Test in both portrait and landscape orientations
7. Test with the `3xl` breakpoint if relevant to large displays

## Adding a New Gallery Layout Style

1. Create a new renderer component in `src/components/gallery/styles/` (e.g., `NewStyleRenderer.jsx`)
2. Export it from `src/components/gallery/styles/index.js`
3. Register the layout key in `src/components/gallery/themes/layoutRegistry.js`
4. Optionally add visual style variants in `visualStyleRegistry.js`
5. Add the option to `FoodScreenForm.jsx` section layout picker

## Debugging Checklist

- **Blank screen on gallery**: Check screen ID in URL matches an existing screen's `id` field
- **Wrong menu showing**: Check time slots — log `getCurrentTime()` and `getCurrentDayOfWeek()` output
- **Data not persisting**: Check localStorage quota. Look for `QuotaExceededError` in console
- **Auth redirect loop**: Check `loading` state in ProtectedRoute — may be resolving auth before redirect
- **Broken images**: Ensure assets imported via `src/assets/index.js`, not hardcoded paths
- **Context undefined**: Verify provider nesting order in `main.jsx`

## localStorage Management

- All keys prefixed with `canteen_`
- To reset demo data: clear all `canteen_*` keys from localStorage, then refresh
- `DataContext` initializes from localStorage with fallback to `mockData.js` defaults
- `QuotaExceededError` is caught gracefully — logs warning, continues without persisting

## Build & Deploy

```bash
npm run dev      # Dev server at http://localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

- Deployed on Vercel with `vercel.json` SPA fallback routing
- No environment variables required
- No test framework configured

## Future Migration Workflow

When transitioning to MERN stack:
1. Replace `DataContext` CRUD with API service layer + backend calls
2. Replace `AuthContext` mock auth with JWT-based auth
3. Replace localStorage with MongoDB via Express API
4. Replace base64 media with cloud storage uploads
5. Keep: component structure, time logic, validation patterns, routing layout
