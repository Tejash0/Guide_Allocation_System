# Integrations

**Analysis Date:** 2026-04-07

## Database

**Type:** SQLite (embedded, file-based)
- Driver: `better-sqlite3` 9.4.3 — synchronous API
- File: `backend/guide_allocation.db` (committed to repo)
- Schema management: inline DDL in `backend/db.js` via `db.exec()` on startup
- Migration strategy: `try/catch` ALTER TABLE calls for additive schema changes (no migration tool)

**Tables:**
- `students` — id, name, email, student_id, password_hash, preferred_faculty_id, interests, project_title, project_description, tech_stack
- `faculty` — id, name, email, department, domain, password_hash, approved, max_teams
- `requests` — id, student_id, faculty_id, status, created_at (UNIQUE on student+faculty pair)
- `notifications` — id, faculty_id, message, read, created_at
- `student_notifications` — id, student_id, message, read, created_at

## Authentication

**Strategy:** JWT (JSON Web Tokens) via `jsonwebtoken` 9.0.2
- Password hashing: `bcryptjs` 2.4.3, cost factor 10
- Token payload: `{ id, role, name }`
- Token expiry: 24 hours
- Secret: `process.env.JWT_SECRET` with hardcoded fallback `'guide-allocation-secret-key'` (`backend/routes/auth.js` line 7)
- Token storage: `localStorage` on the frontend (`frontend/src/api/requests.js`)
- Token transmission: `Authorization: Bearer <token>` header

**Admin account:** Hardcoded credentials in `backend/routes/auth.js` (email: `admin@gmail.com`). No DB record — role injected directly into JWT at login.

**Roles:** `student`, `faculty`, `admin` — stored in JWT, not in DB sessions

**Protected routes (frontend):** `frontend/src/components/ProtectedRoute.jsx`

## External APIs

None — no third-party HTTP API calls detected. All data operations are against the local SQLite database.

## Key Dependencies

**Backend:**
- `express` 4.18.2 — REST API server, route handling (`backend/server.js`, `backend/routes/`)
- `better-sqlite3` 9.4.3 — SQLite client, synchronous, no async/await needed (`backend/db.js`)
- `bcryptjs` 2.4.3 — password hashing at registration and comparison at login (`backend/routes/auth.js`)
- `jsonwebtoken` 9.0.2 — JWT signing and verification (`backend/routes/auth.js`)
- `cors` 2.8.5 — CORS middleware, origin locked to `http://localhost:5173` (`backend/server.js`)

**Frontend:**
- `react` 18.2.0 — component rendering (`frontend/src/`)
- `react-dom` 18.2.0 — DOM mounting (`frontend/src/main.jsx`)
- `react-router-dom` 6.22.0 — `BrowserRouter`, `Routes`, `Route`, `Navigate`, `ProtectedRoute` (`frontend/src/App.jsx`)
- Native `fetch` API — all HTTP calls use browser-native fetch, no axios or similar (`frontend/src/api/`)

## API Surface (Backend Routes)

- `POST   /api/register/student` — student registration
- `POST   /api/register/faculty` — faculty registration (pending approval)
- `POST   /api/login` — unified login for all roles
- `GET/PATCH /api/admin/*` — admin operations (`backend/routes/admin.js`)
- `GET/PATCH /api/faculty/*` — faculty operations (`backend/routes/faculty.js`)
- `GET/PATCH /api/student/*` — student operations (`backend/routes/student.js`)
- `POST/GET/PATCH/DELETE /api/requests/*` — guide request lifecycle (`backend/routes/requests.js`)

## Environment Configuration

**Required variables:**
- `JWT_SECRET` — signing secret for JWTs (falls back to hardcoded value if unset)

**No `.env` file detected** — no dotenv package in dependencies; `process.env.JWT_SECRET` is read directly, meaning it must be set in the shell environment or the fallback is used.
