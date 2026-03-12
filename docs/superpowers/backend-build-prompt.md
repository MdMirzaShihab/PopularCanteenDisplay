# Backend Build Prompt

> Copy everything below the line and paste it into Claude Code at `/Users/mirza/Documents/codeLib/Infyta/PMCHcanteen/`

---

Build the complete Node.js/Express backend for the Canteen Management System. The backend folder should be created as `PopularCanteenBackend/` at the same level as the `PopularCanteenDisplay/` frontend folder.

## Reference Documents (READ THESE FIRST)

1. **Design Spec** (what to build): `PopularCanteenDisplay/docs/superpowers/specs/2026-03-12-canteen-backend-design.md`
2. **Implementation Plan** (how to build it, 25 tasks): `PopularCanteenDisplay/docs/superpowers/plans/2026-03-13-canteen-backend.md`

Read both documents completely before starting. The plan has complete code for every file — follow it exactly.

## Directory Structure

```
PMCHcanteen/
├── PopularCanteenDisplay/    ← existing frontend (DO NOT modify)
└── PopularCanteenBackend/    ← create this (new git repo)
```

Initialize `PopularCanteenBackend/` as a new git repo (`git init`) before starting work.

## Execution Instructions

1. Use `superpowers:subagent-driven-development` to execute the implementation plan with parallel subagents where the task dependency graph allows it
2. Use `superpowers:verification-before-completion` after each chunk to verify the work before moving to the next chunk
3. Follow the plan's 8 chunks in order — each chunk's tasks can be parallelized per the dependency graph at the bottom of the plan
4. Commit after each task as specified in the plan
5. After all 25 tasks are done, start the server and verify the health endpoint responds

## Environment Setup

Before Task 1, create a `.env` file in `PopularCanteenBackend/` with my actual MongoDB Atlas URI and R2 credentials. Ask me for these values before proceeding — do not use placeholders.

## Verification Checklist (after all tasks)

- [ ] `npm install` succeeds
- [ ] `node server.js` starts without errors
- [ ] `GET /api/v1/health` returns `{ status: 'ok', dbStatus: 'connected' }`
- [ ] `node seed.js` populates the database
- [ ] `POST /api/v1/auth/login` with `{ "username": "admin", "password": "admin123" }` returns a JWT
- [ ] All route files are mounted in `app.js`
- [ ] Socket.IO `/tokens` namespace accepts connections

## Key Constraints

- JavaScript only (no TypeScript)
- Follow the flat Express architecture: routes → controllers → services → models
- All code must match the plan exactly — do not add extra features or refactor
- Every mutating operation must log to ActivityLog
- Public endpoints (gallery screens, token current, health) must work without auth
- Socket.IO broadcasts globally on `/tokens` namespace (no rooms)
