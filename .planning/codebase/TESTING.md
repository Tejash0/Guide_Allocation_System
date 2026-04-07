# Testing

## Test Setup

- **No test framework installed** — neither `jest`, `vitest`, `mocha`, nor any testing library appears in either `package.json`
- No test scripts in `backend/package.json` (only `start` and `dev`)
- No test scripts in `frontend/package.json` (only `dev`, `build`, `preview`)
- No test config files (`jest.config.*`, `vitest.config.*`, etc.)
- No test files found anywhere in the repository

## Coverage

**Estimated: 0%** — no tests exist.

## Test Patterns

None — no test patterns to document.

## Gaps (everything is untested)

### Auth Flow
- Registration validation, login, JWT issuance, hardcoded admin credentials
- `requireAuth` / `requireAdmin` middleware paths

### Business Rules (highest risk)
- `max_teams` cap enforcement on faculty
- Single accepted guide constraint per student
- `UNIQUE(student_id, faculty_id)` request deduplication
- Auto-reject cascade when faculty accepts a request

### Backend Routes
- Student: preference, interests, project, notifications CRUD (`backend/routes/student.js`)
- Faculty: profile update, notifications, available listing (`backend/routes/faculty.js`)
- Request lifecycle: send, view, accept/reject (with auto-reject side-effects), withdraw (`backend/routes/requests.js`)
- Admin: all admin operations (`backend/routes/admin.js`)

### Frontend
- API client functions (`frontend/src/api/*.js`) — all untested
- Pages: Login, StudentRegister, FacultyRegister, Dashboard (`frontend/src/pages/`)

### Infrastructure
- DB schema migrations (the try/catch `ALTER TABLE` pattern in `backend/db.js`)
- No rollback coverage on multi-step DB operations
