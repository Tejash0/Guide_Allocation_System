# Roadmap

## Milestone: v1.0 — Complete Guide Allocation System

**Goal**: Close all remaining user story gaps so every acceptance criterion in the User Stories document is satisfied.

**Status**: 🟡 In Progress — core system functional, 2 gaps remain

---

## Phase 1 — Domain Filter & Faculty Registration UX

**Goal**: Complete US4 (filter by domain) and improve US2 post-registration feedback so faculty know their account is pending approval rather than getting a confusing login block.

**Scope**:
- Add domain/keyword filter input to the available guides list (frontend + backend)
- After faculty registration success, show a clear "pending admin approval" message on the login page or in a dedicated state
- Filter should work client-side (no extra API needed if list is small) OR add `?domain=` query param to `/api/faculty/available`

**Requirements covered**: REQ-08, REQ-04 (UX improvement)

**Canonical refs**:
- `backend/routes/faculty.js` — `/available` endpoint
- `frontend/src/pages/Dashboard.jsx` — available guides section (lines ~480-500)
- `frontend/src/api/faculty.js` — `getAvailableGuides()`
- `frontend/src/pages/FacultyRegister.jsx` — post-registration flow
- `frontend/src/pages/Login.jsx` — where faculty lands after approval block

**Effort**: Easy
**Wave**: 1

---

## Phase 2 — Polish & Hardening

**Goal**: Address the highest-impact concerns from CONCERNS.md that affect correctness and user experience without requiring new infrastructure.

**Scope**:
- Add a global 401 interceptor on frontend (expired token → redirect to login instead of raw JSON)
- Add try/catch + proper error handling to frontend API files (`requests.js`, `student.js`, `faculty.js`)
- Fix `INSERT OR REPLACE` resetting `created_at` in requests route
- Ensure admin faculty delete cleans up orphaned notifications and requests
- Add React error boundary so a component crash doesn't blank the whole page

**Requirements covered**: REQ-09 to REQ-16 (reliability), REQ-17 to REQ-19 (notification reliability)

**Canonical refs**:
- `frontend/src/api/requests.js`
- `frontend/src/api/student.js`
- `frontend/src/api/faculty.js`
- `backend/routes/requests.js` — line 26 (INSERT OR REPLACE)
- `backend/routes/admin.js` — line 41 (faculty delete)
- `frontend/src/App.jsx` — add ErrorBoundary wrapper

**Effort**: Normal
**Wave**: 1

---

## Phase Status

| Phase | Name | Status | Requirements |
|-------|------|--------|-------------|
| 1 | Domain Filter & Faculty Registration UX | 🔲 Not started | REQ-08, REQ-04 |
| 2 | Polish & Hardening | 🔲 Not started | Cross-cutting reliability |

## Requirements Coverage

| REQ-ID | Phase |
|--------|-------|
| REQ-01 to REQ-07 | ✓ Already implemented |
| REQ-08 | Phase 1 |
| REQ-09 to REQ-26 | ✓ Already implemented |
