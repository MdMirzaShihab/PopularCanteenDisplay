# Development Workflows

## New Feature Workflow

1. Read the relevant page in `src/pages/` to understand current state
2. Check if the page has been migrated to domain hooks or still uses `useData()`
3. Add API endpoint in `src/api/[entity].api.js` if needed
4. Add/update domain hook in `src/hooks/use[Entity].js` if needed
5. Add validation rules in `src/utils/validators.js`
6. Create/update components in `src/components/[domain]/`
7. Wire up the page in `src/pages/`
8. Add route in `src/App.jsx` if needed
9. Run `npm run lint` and `npm run build`

## Adding a New API Service

1. Create `src/api/[entity].api.js`
2. Import `apiClient` from `./client`
3. Export pure functions (no React logic) that return promises
4. Follow existing pattern: `.then((r) => r.data)` to unwrap axios response
5. Support pagination params `{ page, limit }` for list endpoints
6. For file uploads, use `upload.api.js` helpers (`uploadFile`, `uploadFileAndCreateMedia`)

## Adding a New Domain Hook

1. Create `src/hooks/use[Entity].js`
2. Import the corresponding API service
3. Use `usePagination()` for paginated lists
4. Use `useNotification()` for error/success feedback
5. Fetch data on mount via `useEffect` + `useCallback`
6. Return `{ data, loading, pagination, CRUD functions }`
7. Export as named export

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
- **API errors**: Check browser Network tab. Verify `VITE_API_URL` in `.env.local`. Check CORS on backend
- **401 errors**: Cookie may have expired. Check that `withCredentials: true` is set. Verify backend cookie config
- **Auth redirect loop**: Check `loading` state in ProtectedRoute — may be resolving auth before redirect
- **Broken images**: Ensure assets imported via `src/assets/index.js`, not hardcoded paths
- **Context undefined**: Verify provider nesting order in `main.jsx`
- **Socket.io not connecting**: Verify `VITE_API_URL` is correct. Check backend Socket.io `/tokens` namespace is running

## Build & Deploy

```bash
npm run dev      # Dev server at http://localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

- Deployed on **AWS Lightsail** via GitHub Actions auto-deploy on push to `main`
- Local dev: `.env.local` → `VITE_API_URL=http://localhost:5001`
- Production: `VITE_API_URL=https://canteen.mirzashihab.com` (set via GitHub Actions secret)
- Nginx serves `dist/` and proxies `/api/` + `/socket.io/` to backend on port 5000
- No test framework configured
