# Project State

## Current Position

- **Milestone**: v1.0 — Complete Guide Allocation System
- **Current Phase**: None started — ready for Phase 1
- **Next Action**: `/gsd:plan-phase 1`

## Project Summary

Guide Allocation System — web app for student-faculty guide matching at an academic institution. React + Vite frontend, Express backend, SQLite database. JWT auth with 3 roles: student, faculty, admin.

## What's Built

All 10 user stories from the User Stories document are substantially implemented. The system is functional end-to-end:
- Student/faculty registration and login (with admin approval gate for faculty)
- Available guides listing (approved faculty only)
- Guide request lifecycle (send → accept/reject → auto-cascade)
- In-app notifications for both students and faculty
- Admin dashboard with capacity management
- Final allocation visible on student dashboard

## Remaining Gaps

1. **REQ-08**: Domain filter on available guides list — no filter UI or backend support
2. **UX gap**: Faculty who register don't get clear "pending approval" feedback; they just get a 403 on next login attempt

## Key Files

- Backend entry: `backend/server.js`
- Database schema: `backend/db.js`
- Auth middleware: `backend/middleware/auth.js`
- Routes: `backend/routes/{auth,admin,faculty,student,requests}.js`
- Frontend routing: `frontend/src/App.jsx`
- Main dashboard: `frontend/src/pages/Dashboard.jsx`
- API clients: `frontend/src/api/{auth,student,faculty,requests,admin}.js`

## Decisions Log

| Date | Decision |
|------|----------|
| 2026-04-07 | Initialized project — brownfield, all core user stories validated |
| 2026-04-07 | Email notifications out of scope (no SMTP infrastructure) |
| 2026-04-07 | Mode: interactive, Granularity: coarse, Model: balanced |

## Session Notes

- Codebase mapped on 2026-04-07 (`.planning/codebase/` — 7 documents)
- User stories source: `User Stories_merged.pdf` (10 stories, release plan W1-W8)
