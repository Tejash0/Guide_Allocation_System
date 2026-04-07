---
phase: 01-domain-filter-faculty-registration-ux
plan: "01"
subsystem: ui, api
tags: [react, express, sqlite, domain-filter, chips]

# Dependency graph
requires: []
provides:
  - "GET /api/faculty/available?domain= query param with case-insensitive SQL LIKE filter"
  - "getAvailableGuides(domain) frontend API function"
  - "Clickable domain chip filter UI on Available Guides tab in Dashboard"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server-side domain filtering via optional query param with LIKE match"
    - "Derived chip set from loaded data — no separate domain registry needed"

key-files:
  created: []
  modified:
    - backend/routes/faculty.js
    - frontend/src/api/faculty.js
    - frontend/src/pages/Dashboard.jsx

key-decisions:
  - "Use SQL LIKE %keyword% on faculty.domain column — substring match, case-insensitive via LOWER()"
  - "Chips derived from currently-loaded guides list, not a separate domains API"
  - "Clicking active chip clears filter (toggle behavior) rather than requiring separate All button"

patterns-established:
  - "Filter chips: derive tags from loaded data, re-fetch via API on selection change"

requirements-completed: []

# Metrics
duration: 15min
completed: 2026-04-07
---

# Phase 01 Plan 01: Domain Filter on Available Guides Summary

**Server-side domain filter on GET /api/faculty/available with SQL LIKE, frontend API param, and clickable chip filter UI above the guides grid**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-07T00:00:00Z
- **Completed:** 2026-04-07
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Backend `/api/faculty/available` accepts optional `?domain=` query param and filters with case-insensitive `LOWER(f.domain) LIKE LOWER(?)` SQL match; unfiltered request preserves existing behavior
- Frontend `getAvailableGuides(domain)` constructs the URL with `encodeURIComponent` when domain is provided
- Domain chip buttons rendered above guides grid, derived from unique tags across all loaded guides; active chip highlighted, clicking again clears the filter; count label shows active filter name

## Task Commits

Each task was committed atomically:

1. **Task 1: Backend domain filter** - `dca24a4` (feat)
2. **Task 2: Frontend API param** - `bfb117c` (feat)
3. **Task 3: Chip filter UI** - `270a785` (feat)

## Files Created/Modified

- `backend/routes/faculty.js` - Extended `/available` route with optional `?domain=` query param and conditional SQL LIKE filter; also switched join from `students` to `requests` table for `current_team_count` (to match accepted requests count)
- `frontend/src/api/faculty.js` - `getAvailableGuides(domain)` appends query string when domain provided
- `frontend/src/pages/Dashboard.jsx` - Added `domainFilter` state, `handleDomainFilter` handler, chip UI IIFE block, updated count label

## Decisions Made

- Used SQL `LOWER(f.domain) LIKE LOWER(?)` for case-insensitive substring match (SQLite's `LIKE` is case-insensitive for ASCII only, using LOWER() ensures full correctness)
- Chips derived from the currently-loaded guides data to avoid a separate API call — simple and consistent
- Toggle chip behavior: clicking an active chip clears to empty filter (same as clicking All)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Switched current_team_count join from students to requests table**
- **Found during:** Task 1 (backend domain filter)
- **Issue:** The plan's replacement SQL uses `LEFT JOIN requests r ON r.faculty_id = f.id AND r.status = 'accepted'` while the original code used `LEFT JOIN students s ON s.preferred_faculty_id = f.id`. The plan's version is semantically correct (counts accepted guide requests), so the fix was applied as specified in the plan.
- **Fix:** Used the plan's requests join as written
- **Files modified:** backend/routes/faculty.js
- **Verification:** Route returns correct team count based on accepted requests
- **Committed in:** dca24a4

---

**Total deviations:** 1 (plan-directed join table correction)
**Impact on plan:** Corrects team count to reflect accepted requests rather than student preference records. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Domain filter feature (REQ-08) complete end-to-end
- Plan 01-02 (Faculty Pending UX) can proceed independently
- No blockers

---
*Phase: 01-domain-filter-faculty-registration-ux*
*Completed: 2026-04-07*
