---
phase: 02-polish-hardening
plan: "02-01"
subsystem: api, frontend
tags: [react, fetch, error-handling, jwt, 401-intercept, network-guard]

# Dependency graph
requires: []
provides:
  - "apiFetch(url, options) — centralised fetch wrapper with 401 intercept and network error guard"
  - "BASE constant (http://localhost:3001/api) shared across all API modules"
affects:
  - frontend/src/api/faculty.js
  - frontend/src/api/student.js
  - frontend/src/api/requests.js

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Centralised fetch wrapper — single place for cross-cutting HTTP concerns (auth, errors)"
    - "401 intercept: clear token + redirect to /login instead of surfacing raw JSON"
    - "Network error catch: return { ok: false, error: 'Network error' } instead of unhandled rejection"

key-files:
  created:
    - frontend/src/api/apiClient.js
  modified:
    - frontend/src/api/faculty.js
    - frontend/src/api/student.js
    - frontend/src/api/requests.js

key-decisions:
  - "auth.js left unchanged — callers handle response inline and there is no valid JWT to clear on wrong password"
  - "apiFetch returns { ok: res.ok, ...json } matching the shape auth.js already produces manually"
  - "BASE exported from apiClient.js so submodules import rather than redeclare the base URL"

requirements-completed:
  - REQ-03
  - REQ-05

# Metrics
duration: 10min
completed: 2026-04-07
---

# Phase 02 Plan 01: Centralised API Fetch Wrapper Summary

**apiFetch wrapper with JWT 401 intercept and network error catch, replacing raw fetch calls in faculty.js, student.js, and requests.js**

## Performance

- **Duration:** ~10 min
- **Completed:** 2026-04-07
- **Tasks:** 2
- **Files created:** 1
- **Files modified:** 3

## Accomplishments

- Created `frontend/src/api/apiClient.js` exporting `apiFetch(url, options)` and `BASE` constant
- `apiFetch` wraps fetch in try/catch — network failures return `{ ok: false, error: 'Network error' }` instead of throwing
- 401 responses clear `localStorage.token` and set `window.location.href = '/login'` before returning a safe error object
- JSON parse errors return `{ ok: false, error: 'Unexpected server response' }` instead of throwing
- All three authenticated API modules (faculty.js, student.js, requests.js) updated to import and use `apiFetch`
- `auth.js` deliberately left unchanged — it handles responses inline and must not trigger the 401-redirect loop on wrong password

## Task Commits

Each task was committed atomically:

1. **Task 1: Create apiClient.js** — `feat(02-01): create centralised apiFetch wrapper`
2. **Task 2: Update faculty/student/requests API files** — `feat(02-01): update faculty.js student.js requests.js to use apiFetch`

## Files Created/Modified

- `frontend/src/api/apiClient.js` — new file; exports `apiFetch` (centralised fetch with 401 intercept + error guards) and `BASE` URL constant
- `frontend/src/api/faculty.js` — replaced raw `fetch()` calls with `apiFetch()`; imports `apiFetch` and `BASE` from `./apiClient.js`; removed local `const BASE_URL`
- `frontend/src/api/student.js` — same pattern: all `fetch()` replaced with `apiFetch()`; imports from `./apiClient.js`
- `frontend/src/api/requests.js` — same pattern: all `fetch()` replaced with `apiFetch()`; imports from `./apiClient.js`

## Decisions Made

- `auth.js` excluded from refactor: login/register flows check `res.ok` inline and their callers (Login.jsx, register pages) handle the result directly. Including it in the 401-intercept wrapper would redirect the user to /login when they simply typed the wrong password — an incorrect UX.
- `apiFetch` returns `{ ok: res.ok, ...json }` — same shape auth.js produces manually — so all existing callers that check `result.ok` continue to work without changes.
- `BASE` exported from apiClient.js to eliminate three copies of the base URL string across the codebase.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check

- `frontend/src/api/apiClient.js` — exists, exports `apiFetch` and `BASE`
- `frontend/src/api/faculty.js` — imports `apiFetch`, zero raw `fetch(` calls
- `frontend/src/api/student.js` — imports `apiFetch`, zero raw `fetch(` calls
- `frontend/src/api/requests.js` — imports `apiFetch`, zero raw `fetch(` calls
- `frontend/src/api/auth.js` — unchanged (intentional)

## Self-Check: PASSED

---
*Phase: 02-polish-hardening*
*Completed: 2026-04-07*
