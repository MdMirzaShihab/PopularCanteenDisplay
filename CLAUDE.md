

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **client-side demo** of a Canteen Management System for digital menu displays. Built with React 19 + Vite + Tailwind CSS. All data is stored in browser localStorage — there is no backend or database. The production version will use MERN stack (see `ProjectContext.md`).

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

No test framework is configured.

## Detailed Rules

Architecture, styling, code conventions, auth/roles, terminology, and development workflows are documented in `.claude/rules/`:

| File | Covers |
|------|--------|
| `architecture.md` | Three-context model, directory layout, routing, time-based display logic |
| `styling.md` | Tailwind theme, color palette, fonts, breakpoints, icons |
| `code-conventions.md` | File naming, exports, component patterns, validation shape |
| `auth-roles.md` | Three roles, boolean checks, route protection |
| `terminology.md` | Domain entities, data relationships, localStorage keys, gotchas |
| `workflows.md` | New feature steps, debugging checklist, build/deploy |

## Deployment

Deployed on Vercel. `vercel.json` configures SPA fallback routing. No environment variables are required.

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Manager | manager | manager123 |
| Token Operator | operator | operator123 |
