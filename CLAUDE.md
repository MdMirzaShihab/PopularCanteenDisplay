

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **Canteen Management System** for digital menu displays, currently **mid-migration** from a localStorage demo to a full MERN stack backend. Built with React 19 + Vite + Tailwind CSS + date-fns. The backend (Express + MongoDB) is production-ready; the frontend is in a **hybrid state** where API infrastructure (services, hooks, Socket.io) is built but pages still consume the legacy `DataContext`.

Key concepts: **food screens** (menu displays with sections, layouts, themes) and **token screens** (serving number displays) are separate entities. Users are managed via an admin panel.

## Migration Status

The project follows an 8-phase migration plan (see `../IMPLEMENTATION_PLAN.md`):

| Layer | Status |
|-------|--------|
| API client + services (`src/api/`) | Done |
| Domain hooks (`src/hooks/`) | Done |
| Socket.io real-time tokens | Done |
| Pagination hook + component | Done |
| AuthContext rewrite | Pending |
| Page migration (useData → hooks) | Pending |
| Gallery migration | Pending |
| Cleanup (delete DataContext, mockData) | Pending |

**Pages still call `useData()` from DataContext (localStorage).** The new domain hooks (`useItems`, `useMenus`, etc.) are ready but not yet wired into pages.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

No test framework is configured.

## Environment Variables

```bash
VITE_API_URL=http://localhost:5001   # Local dev backend (see .env.local)
```

In production, `VITE_API_URL` is set to `https://canteen.mirzashihab.com` via GitHub Actions secrets during build.

## Detailed Rules

Architecture, styling, code conventions, auth/roles, terminology, and development workflows are documented in `.claude/rules/`:

| File | Covers |
|------|--------|
| `architecture.md` | Directory layout, API layer, hooks, context model, routing, gallery pipeline |
| `styling.md` | Tailwind theme, color palette, fonts, breakpoints, icons |
| `code-conventions.md` | File naming, exports, component patterns, API/hook patterns |
| `auth-roles.md` | Three roles, boolean checks, route protection, cookie-based auth |
| `terminology.md` | Domain entities, data relationships, API endpoints, gotchas |
| `workflows.md` | Feature steps, migration workflow, debugging checklist, build/deploy |

## Deployment

Deployed on **AWS Lightsail** (single Ubuntu 22.04 instance at `canteen.mirzashihab.com`).

- **Server:** Nginx serves static files from `/var/www/canteen/dist/`, reverse proxies `/api/` and `/socket.io/` to Node.js on port 5000
- **SSL:** Let's Encrypt via Certbot with auto-renewal
- **Auto-deploy:** GitHub Actions on push to `main` — builds frontend, rsyncs `dist/` to the instance via SSH
- **Workflow:** `.github/workflows/deploy.yml`
- **No Vercel** — `vercel.json` is legacy and unused

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Manager | manager | manager123 |
| Token Operator | operator | operator123 |
