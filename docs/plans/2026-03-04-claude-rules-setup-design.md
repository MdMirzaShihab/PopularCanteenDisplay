# .claude Rules Setup Design

**Date:** 2026-03-04
**Status:** Approved

## Goal

Create a `.claude/rules/` folder with domain-specific rule files following the same structure as the DoctorAppointmentFrontend reference project. Slim down CLAUDE.md to avoid duplication.

## Structure

```
.claude/
└── rules/
    ├── styling.md           # Tailwind theme, fonts, colors, breakpoints
    ├── architecture.md      # Three-context model, directory layout, provider nesting
    ├── code-conventions.md  # File naming, exports, component structure
    ├── auth-roles.md        # Three roles, boolean checks, mock auth
    ├── terminology.md       # Canteen domain terms, data relationships, gotchas
    └── workflows.md         # Dev/debug workflows, localStorage patterns
```

## CLAUDE.md Changes

Slimmed to ~40 lines: project one-liner, commands, credentials, deployment, pointer to rules.

## Scope

Rules reflect current demo state (localStorage, no backend) with migration notes where relevant for future MERN stack transition.
