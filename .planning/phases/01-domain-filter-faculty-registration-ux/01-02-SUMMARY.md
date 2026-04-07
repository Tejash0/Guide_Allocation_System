---
phase: 01-domain-filter-faculty-registration-ux
plan: "02"
subsystem: ui
tags: [react, ux, auth, faculty, pending-approval]

requires: []
provides:
  - Post-registration success state with explicit "pending admin approval" messaging and numbered "What happens next" list
  - Login page 403 pending-approval detection with amber notice distinct from red error box
affects: [faculty-registration, login, admin-approval-flow]

tech-stack:
  added: []
  patterns:
    - "Distinguish error types in login (403 pending vs wrong password) using separate state variables"
    - "Amber/gold color palette (rgba(201,168,76,...)) for pending/warning states, red for hard errors"

key-files:
  created: []
  modified:
    - frontend/src/pages/FacultyRegister.jsx
    - frontend/src/pages/Login.jsx

key-decisions:
  - "Use separate pendingApproval boolean state in Login.jsx instead of embedding detection in error string — cleaner JSX branching"
  - "Amber card with numbered list in success state chosen over plain text to make approval flow unambiguous and scannable"

patterns-established:
  - "Pending-approval visual treatment: rgba(201,168,76,0.1) background, rgba(201,168,76,0.35) border — reuse this for any pending-state notices"

requirements-completed: []

duration: 5min
completed: 2026-04-07
---

# Phase 01 Plan 02: Faculty Registration Pending State UX Summary

**Explicit "pending admin approval" UX added at both registration success and login 403 — amber notices replace ambiguous generic states**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-07T15:36:00Z
- **Completed:** 2026-04-07T15:36:44Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- FacultyRegister.jsx success state now reads "You will not be able to log in until an admin approves your account" with a numbered "What happens next" list inside an amber card
- Login.jsx detects the exact backend error string "Account pending admin approval" and renders a distinct amber/gold notice box instead of the red error box
- Typing in login form fields after seeing the amber notice resets both pendingApproval and error states

## Task Commits

Each task was committed atomically:

1. **Task 1: Strengthen faculty registration pending approval success state** - `d6e638a` (feat)
2. **Task 2: Detect 403 pending approval on login and show amber notice** - `92360b6` (feat)

## Files Created/Modified
- `frontend/src/pages/FacultyRegister.jsx` - Replaced generic success text with explicit pending message + "What happens next" numbered list in amber card
- `frontend/src/pages/Login.jsx` - Added pendingApproval state, 403 detection in handleSubmit, amber notice block above existing red error block, handleChange resets both states

## Decisions Made
- Used a dedicated `pendingApproval` boolean state (separate from `error`) to keep JSX branching clean — the amber and red blocks are independent and cannot both show simultaneously
- handleChange now clears both error and pendingApproval so either notice disappears as soon as the user starts correcting their input

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Both faculty UX touch points (post-registration and login 403) are now unambiguous about the pending-approval state
- Admin approval flow is unchanged; this only improves feedback for faculty users
- No blockers for other plans in this phase

---
*Phase: 01-domain-filter-faculty-registration-ux*
*Completed: 2026-04-07*
