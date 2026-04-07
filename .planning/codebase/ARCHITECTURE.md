# Architecture

## System Overview

Full-stack guide allocation system for managing student-faculty guide assignments. Three user roles: `student`, `faculty`, `admin` (admin is hardcoded, not in DB). Frontend is a React SPA, backend is an Express REST API, data stored in SQLite.

## Component Diagram (text)

```
┌─────────────────────────────────────────┐
│         Browser (localhost:5173)        │
│  React SPA (Vite)                       │
│  ┌──────────┐  ┌──────────┐            │
│  │  Pages   │  │ API Layer│            │
│  │ Login    │  │ /api/*   │            │
│  │ Dashboard│  │          │            │
│  │ Admin    │  └────┬─────┘            │
│  └──────────┘       │ fetch            │
└────────────────────────────────────────┘
                       │ HTTP (localhost:3001)
┌──────────────────────▼─────────────────┐
│         Express Server (backend/)       │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │  Middleware  │  │     Routes      │ │
│  │  auth.js     │  │ auth, admin,    │ │
│  │  requireAuth │  │ faculty,student,│ │
│  │  requireAdmin│  │ requests        │ │
│  └──────────────┘  └────────┬────────┘ │
└───────────────────────────────────────┘
                               │ better-sqlite3
┌──────────────────────────────▼─────────┐
│         SQLite (guide_allocation.db)    │
│  students, faculty, requests,           │
│  notifications, student_notifications   │
└─────────────────────────────────────────┘
```

## Data Flow

1. Client sends request with `Authorization: Bearer <JWT>` header
2. `requireAuth` middleware validates JWT, attaches `req.user` (id, role)
3. Route handler executes parameterized SQL via `better-sqlite3` prepared statements
4. JSON response returned to client
5. Frontend API layer (`/src/api/*.js`) handles fetch and surfaces errors

## Key Patterns

- **REST API**: Express routes organized by role (auth, admin, faculty, student, requests)
- **JWT Auth**: 24h expiry, stored in `localStorage`, sent as Bearer token
- **Raw SQL**: No ORM — parameterized prepared statements throughout
- **Role-based access**: Middleware guards per route, three roles
- **Cascade auto-reject**: When faculty accepts a student request, all other pending requests from that student are auto-rejected
- **Notification system**: Dual tables (`notifications` for faculty, `student_notifications` for students)

## Authentication Flow

1. User submits credentials to `POST /api/auth/login`
2. Backend bcrypt-compares password, issues JWT (24h) signed with `JWT_SECRET`
3. Token stored in `localStorage` on client
4. Every protected API call sends token in `Authorization: Bearer` header
5. `requireAuth` decodes token, sets `req.user`; `requireAdmin` additionally checks role === 'admin'
6. Frontend `ProtectedRoute` component blocks unauthorized access, redirects to login

## Database Schema Summary

| Table | Key Fields |
|-------|-----------|
| `students` | id, name, email, password, department, year |
| `faculty` | id, name, email, password, department, specialization, max_students |
| `requests` | id, student_id, faculty_id, status (pending/accepted/rejected), message, created_at |
| `notifications` | id, faculty_id, message, is_read, created_at |
| `student_notifications` | id, student_id, message, is_read, created_at |

- No foreign key enforcement at DB level (SQLite FK pragma not enabled)
- No ORM — raw parameterized SQL
- Admin user hardcoded, not stored in DB
