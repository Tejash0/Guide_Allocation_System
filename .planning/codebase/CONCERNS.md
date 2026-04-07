# Concerns & Technical Debt

## Security Concerns

**Hardcoded admin credentials** — `backend/routes/auth.js` lines 74–79: email `admin@gmail.com` and password `Tejash007` are plaintext in source. Cannot be rotated without a code deploy.

**Hardcoded JWT secret fallback** — `backend/middleware/auth.js` line 2 and `backend/routes/auth.js` line 7: `process.env.JWT_SECRET || 'guide-allocation-secret-key'`. No `.env` file exists, so the fallback is always active — tokens can be forged by anyone who reads the source.

**No rate limiting** on `/login`, `/register/student`, `/register/faculty` — brute-force is unconstrained.

**`/api/faculty/available` is unauthenticated** — `backend/routes/faculty.js` line 57, unlike all other faculty routes.

**No input length limits** on free-text fields (interests, project description, name, email).

**Admin faculty delete doesn't cascade** — `backend/routes/admin.js` line 41 leaves orphaned rows in `requests`, `notifications`, `student_notifications` because `PRAGMA foreign_keys` is never enabled.

**`localStorage` token storage** is XSS-vulnerable; `HttpOnly` cookies would be safer.

## Missing Error Handling

**All frontend API files lack try/catch** — `frontend/src/api/requests.js`, `student.js`, `faculty.js`. Network failures throw unhandled promise rejections. Only `auth.js` checks `res.ok`.

**`res.json()` called unconditionally** regardless of HTTP status — a non-JSON error response throws.

**No per-route try/catch in most backend routes** — only `POST /requests` is wrapped. `admin.js`, `student.js`, `faculty.js` all let SQLite errors propagate uncaught.

**No global Express error handler** in `backend/server.js` — Express default HTML 500 responses leak stack traces.

**No global 401 interceptor** on frontend — expired tokens show raw error JSON instead of redirecting to login.

## Technical Debt

**Sprint migrations via silent try/catch ALTER TABLE** — `backend/db.js` lines 29–31, 57–59. Schema errors are swallowed; app can start with an incomplete schema.

**Project data stored as columns on `students`** — `project_title`, `project_description`, `tech_stack` should be a separate `projects` table.

**`preferred_faculty_id` is redundant with `requests` table** — updated in three places and can drift out of sync.

**`INSERT OR REPLACE` resets `created_at`** — `backend/routes/requests.js` line 26.

**Hardcoded `localhost:3001`** duplicated in all four frontend API files — one env variable needed.

**Dashboard.jsx is a monolith** — all student, faculty, and admin views in one massive file with inline CSS strings.

**No transactions** — multi-step operations (accept + auto-reject cascade + notify) run as sequential statements with no rollback on failure.

## Scalability Concerns

**SQLite** — single-file, single-process; no horizontal scaling.

**No indexes on FK columns** — `requests.faculty_id`, `requests.student_id`, `notifications.faculty_id`, `student_notifications.student_id` all do full table scans on joins.

**Unbounded admin list endpoints** — `/api/admin/students` and `/api/admin/faculty` return all rows with no pagination.

## Missing Features / Incomplete Implementation

- No password reset / forgot-password flow
- No email verification on registration
- No logout/token invalidation (JWT in localStorage, no server-side blocklist)
- No file upload for project submissions
- Admin faculty delete doesn't notify or protect students with active requests

## Dependency Concerns

- No linting or test runner in either `package.json`
- `bcryptjs` (pure-JS, slower) used instead of native `bcrypt`

## UX / Frontend Concerns

- No React error boundaries — component crash = blank screen
- Nav items are unstyled `div` elements — not keyboard-accessible, no ARIA roles
- No loading skeletons on data fetches — UI shows empty state briefly on every load
