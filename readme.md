# Guide Allocation System

A web application for managing student-faculty guide allocation in academic settings. Students request faculty members as project guides; faculty review and accept or reject requests; admins oversee the system.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite (port 5173) |
| Backend | Express 4 + better-sqlite3 (port 3001) |
| Database | SQLite (`backend/guide_allocation.db`) |
| Auth | JWT (24h), stored in localStorage |

## Getting Started

### Prerequisites

- Node.js via NVM (`nvm use 22`) — **do not use system Node v25**, `better-sqlite3` was compiled against NVM Node.

### Backend

```bash
cd backend
npm install
npm run dev       # dev with auto-restart
# npm start       # production
```

Runs at `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev       # Vite dev server
```

Runs at `http://localhost:5173`.

> CORS is hardcoded: backend only accepts `http://localhost:5173`.

## Roles

| Role | Access |
|------|--------|
| **Student** | Browse faculty, send guide requests with problem statements, view request status |
| **Faculty** | Toggle availability, view incoming requests, accept/reject students |
| **Admin** | Approve faculty accounts, configure student guide limits |

Admin credentials (hardcoded): `admin@gmail.com` / `Tejash007`

## Request Lifecycle

1. Student sends a request — requires a `problem_statement`, subject to their `max_teams` limit
2. Faculty reviews the request and accepts or rejects
3. On acceptance, student's `preferred_faculty_id` is set; if the student hits their `max_teams` limit, remaining pending requests are auto-rejected with notifications

## Project Structure

```
frontend/
  src/
    api/          # thin wrappers over apiFetch, one file per route group
    pages/        # Dashboard.jsx (student+faculty), AdminDashboard.jsx, auth pages
    components/   # shared UI components

backend/
  db.js           # SQLite init + inline schema migrations
  server.js       # Express entry point
  middleware/
    auth.js       # requireAuth, requireAdmin guards
  routes/         # auth.js, admin.js, faculty.js, student.js, requests.js
```

## Database

Inspect with:

```bash
sqlite3 backend/guide_allocation.db ".tables"
sqlite3 backend/guide_allocation.db ".schema <table>"
```

Key tables: `students`, `faculty`, `requests`, `notifications`, `student_notifications`, `project_comments`

## Troubleshooting

**`invalid ELF header` on `better-sqlite3`** — Node version mismatch. Fix:

```bash
nvm use 22
cd backend && npm rebuild better-sqlite3
```
