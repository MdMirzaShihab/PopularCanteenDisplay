

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **Canteen Management System** for digital menu displays at Popular Medical College Hospital. Built with React 19 + Vite + Tailwind CSS + date-fns. Full MERN stack with Express + MongoDB backend. All pages use API-based domain hooks. Cookie-based auth via httpOnly JWT.

Key concepts: **food screens** (menu displays with sections, layouts, themes), **token screens** (serving number displays), and **media** (uploaded images/videos for gallery and screen backgrounds) are separate entities. Users are managed via an admin panel.

**Note:** `SchedulesPage` and `CurrentMenuPage` are hidden/inactive and still reference the deleted `DataContext`. They need a rewrite if re-enabled.

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
| `workflows.md` | Feature steps, debugging checklist, build/deploy |

## Deployment

Deployed on **AWS Lightsail** (single Ubuntu 22.04 instance at `canteen.mirzashihab.com`).

- **Server:** Nginx serves static files from `/var/www/canteen/dist/`, reverse proxies `/api/` and `/socket.io/` to Node.js on port 5000
- **SSL:** Let's Encrypt via Certbot with auto-renewal
- **Auto-deploy:** GitHub Actions on push to `main` (Node.js 22) — builds frontend, rsyncs `dist/` to the instance via SSH
- **Workflow:** `.github/workflows/deploy.yml`

## Default Accounts

Managed via the backend Users API. Default accounts are seeded on first deploy:

| Role | Username |
|------|----------|
| Admin | admin |
| Manager | manager |
| Token Operator | operator |
