# Deployment & Server Infrastructure

**Applies to:** `.github/workflows/*`, build configuration

## Production Environment

- **Host:** AWS Lightsail, same instance as backend (`canteen.popular-hospital.com`)
- **Served from:** `/var/www/canteen/dist/` (Nginx static file serving)
- **Build tool:** Vite (output to `dist/`)
- **SSL:** Let's Encrypt via Certbot (shared with backend Nginx config)

## Auto-Deploy (GitHub Actions)

Push to `main` triggers `.github/workflows/deploy.yml`:

1. Checkout code
2. Node.js 22, `npm ci`
3. `npm run build` with `VITE_API_URL` from secrets
4. `rsync --delete dist/` to Lightsail instance at `/var/www/canteen/dist/`

No server restart needed — Nginx serves static files directly.

**GitHub Secrets required:**

| Secret | Purpose |
|--------|---------|
| `LIGHTSAIL_SSH_KEY` | SSH private key for deploy user |
| `LIGHTSAIL_HOST` | Lightsail instance IP/hostname |
| `LIGHTSAIL_USER` | SSH username on the instance |
| `VITE_API_URL` | `https://canteen.popular-hospital.com` (injected at build time) |

## Environment Variables

**Build-time only** (no runtime env vars — Vite inlines them during build):

| Variable | Local (`.env.local`) | Production (GitHub Secret) |
|----------|---------------------|---------------------------|
| `VITE_API_URL` | `http://localhost:5001` | `https://canteen.popular-hospital.com` |

## Nginx (frontend-relevant settings)

Full config maintained by backend. Frontend-relevant parts:

- `/` — `try_files $uri $uri/ /index.html` (SPA client-side routing)
- `/assets/` — 1-year cache with `immutable` (Vite hashes filenames, safe to cache forever)
- `/api/` and `/socket.io/` — proxied to backend on port 5000
- Gzip enabled for JS, CSS, JSON, SVG

## How Frontend Connects to Backend

- `VITE_API_URL` is baked into the build — the axios client in `src/api/client.js` uses `VITE_API_URL + '/api/v1'` as base URL
- Cookie auth with `withCredentials: true` — works because frontend and backend share the same domain
- Socket.io connects to `VITE_API_URL/tokens` namespace for real-time token updates

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Blank page after deploy | Check Nginx is serving from correct `dist/` path; check browser console for JS errors |
| API calls fail (404) | `VITE_API_URL` wrong at build time — check GitHub secret value |
| Stale content after deploy | Hard refresh (Ctrl+Shift+R); check rsync completed in Actions log |
| Login redirect loop | `loading` state race condition in `ProtectedRoute`; check auth cookie |
| Images broken | R2 public URL or CORS issue — see backend `deployment.md` for R2 CORS policy |
| Socket.io not connecting | Check `VITE_API_URL` matches production domain; check Nginx WebSocket proxy config |
