# Guide Allocation System

## What This Is

A web application that automates the process of matching students with faculty guides for final-year projects. Students register, browse available faculty, submit guide requests, and receive approval or rejection. Faculty manage incoming requests and their availability. An admin oversees the system, approves faculty accounts, and controls guide capacity limits.

## Core Value

Eliminate the manual, informal process of guide allocation — replacing email chains and notice boards with a structured, transparent, auditable system where every stakeholder (student, faculty, admin) has a dedicated interface and real-time status visibility.

## Users

| Role | Primary Need |
|------|-------------|
| Student | Find and request a suitable faculty guide |
| Faculty | Manage incoming student requests and availability |
| Admin | Oversee allocations, approve faculty, set capacity |

## Context

- **Stack**: React + Vite frontend (port 5173), Express backend (port 3001), SQLite via better-sqlite3
- **Auth**: JWT (24h), bcryptjs password hashing, role-based access
- **State**: brownfield — core system is functional, specific user story gaps remain

## Requirements

### Validated (already in production code)

- ✓ Student registration with form validation
- ✓ Faculty registration (pending admin approval by default)
- ✓ Student & faculty login with JWT authentication
- ✓ Unapproved faculty blocked from login (403 response)
- ✓ Admin can approve faculty accounts
- ✓ Admin can set max student slots per faculty
- ✓ Students can view available (approved) faculty guides
- ✓ Students can submit guide requests with message
- ✓ Students can withdraw pending requests
- ✓ Faculty can accept or reject student requests
- ✓ Auto-reject cascade: when one faculty accepts, all other pending requests from that student are rejected
- ✓ In-app notification system for both students and faculty
- ✓ Student can view their final allocation on dashboard
- ✓ Admin dashboard with stats, faculty list, student list

### Active (gaps to implement)

- [ ] Domain/department filter on the available guides list (US4 acceptance criteria)
- [ ] Faculty approval pending state communicated to faculty after registration (currently just blocked silently on login)

### Out of Scope (v1)

- Email notifications — linked in user stories but in-app notifications satisfy acceptance criteria; email requires SMTP infrastructure not present
- Password reset / forgot-password flow — no email infrastructure
- File uploads for project submissions — not in any user story acceptance criteria
- Pagination on admin lists — single-institution scale doesn't require it

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SQLite over PostgreSQL | Single-institution deployment, no concurrency requirements | Accepted |
| JWT in localStorage | Simplicity for academic project; HttpOnly cookies would be safer in production | Accepted — known trade-off |
| No ORM | better-sqlite3 prepared statements are sufficient; avoids abstraction overhead | Accepted |
| Admin hardcoded | Single admin per institution; DB-stored admin adds complexity without value | Accepted |
| In-app notifications only | Email requires SMTP setup; in-app satisfies acceptance criteria | Accepted |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions

---
*Last updated: 2026-04-07 after initialization*
