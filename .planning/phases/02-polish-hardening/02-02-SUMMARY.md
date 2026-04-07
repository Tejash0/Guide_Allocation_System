---
phase: 02-polish-hardening
plan: "02-02"
subsystem: api, backend
tags: [sqlite, transaction, cascade-delete, admin, referential-integrity]

# Dependency graph
requires: []
provides:
  - "Atomic faculty DELETE with cascade: student_notifications, notifications, requests, faculty in one transaction"
affects:
  - backend/routes/admin.js
  - backend/db.js

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "better-sqlite3 db.transaction() wrapping multi-table DELETEs for atomic cascade"
    - "Pre-flight existence check (SELECT before transaction) for clean 404 without running transaction"
    - "Subselect pattern: DELETE FROM student_notifications WHERE student_id IN (SELECT student_id FROM requests WHERE faculty_id = ?)"

key-files:
  created: []
  modified:
    - backend/routes/admin.js
    - backend/db.js

key-decisions:
  - "Faculty existence check done before transaction — avoids empty transaction overhead and returns 404 cleanly"
  - "student_notifications deleted first via subselect on requests — deleting requests first would orphan them"
  - "500 response logs full error server-side but returns only generic message to client (no stack trace exposure)"
  - "[Rule 3] student_notifications table and Sprint 3 student columns added to db.js (worktree was missing them)"

requirements-completed:
  - REQ-25

# Metrics
duration: 8min
completed: 2026-04-07
---

# Phase 02 Plan 02: Transactional Faculty Cascade Delete Summary

**SQLite transaction wrapping 4-table cascade delete for faculty removal: student_notifications (subselect) -> notifications -> requests -> faculty, with pre-flight 404 guard**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-04-07
- **Tasks:** 1
- **Files created:** 0
- **Files modified:** 2

## Accomplishments

- Replaced the bare `DELETE FROM faculty WHERE id = ?` handler in `backend/routes/admin.js` with a `db.transaction()` cascade
- Pre-flight `SELECT id FROM faculty WHERE id = ?` check returns 404 before any DELETE runs for unknown IDs
- Cascade order inside transaction:
  1. `DELETE FROM student_notifications WHERE student_id IN (SELECT student_id FROM requests WHERE faculty_id = ?)` — avoids orphaned student notifications
  2. `DELETE FROM notifications WHERE faculty_id = ?` — clears faculty-side notifications
  3. `DELETE FROM requests WHERE faculty_id = ?` — clears all guide requests for this faculty
  4. `DELETE FROM faculty WHERE id = ?` — removes the faculty row
- try/catch wraps the transaction call: transaction failure returns HTTP 500 with generic message, logs full error server-side
- Added `student_notifications` table creation and Sprint 3 student columns to `backend/db.js` (worktree was missing them — required for the DELETE statement to succeed at runtime)

## Task Commits

1. **Task 1: Replace faculty DELETE route with transactional cascade** — `feat(02-02): wrap faculty DELETE in SQLite transaction with cascade`

## Files Created/Modified

- `backend/routes/admin.js` — `DELETE /faculty/:id` handler replaced; pre-flight 404 guard + `db.transaction()` cascade replacing single bare DELETE
- `backend/db.js` — Added Sprint 3 student columns (`project_title`, `project_description`, `tech_stack`) and `student_notifications` table (were missing from this worktree's schema)

## Decisions Made

- Cascade order is `student_notifications` before `requests`: the subselect `SELECT student_id FROM requests WHERE faculty_id = ?` must run while the requests rows still exist, otherwise it returns no rows and student notifications would be orphaned.
- The 404 pre-flight check is outside the transaction: starting a transaction just to SELECT and return nothing is unnecessary overhead. Checking first is cleaner.
- `console.error` logs the full error (including stack) server-side; client receives only `{ error: 'Failed to remove faculty' }` to avoid information leakage.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing student_notifications table to db.js**
- **Found during:** Task 1
- **Issue:** The worktree's `backend/db.js` did not include `CREATE TABLE IF NOT EXISTS student_notifications` or Sprint 3 student column additions. The transaction's first DELETE statement (`DELETE FROM student_notifications`) would fail at runtime with "no such table", rolling back the entire transaction.
- **Fix:** Added Sprint 3 student columns (`ALTER TABLE ... ADD COLUMN` try/catch blocks) and the `student_notifications` table creation block to `backend/db.js`, matching the main project's schema.
- **Files modified:** `backend/db.js`

## Known Stubs

None.

## Self-Check

- `backend/routes/admin.js` line 40+: `router.delete('/faculty/:id', ...)` uses `db.transaction()` — VERIFIED
- Cascade order: student_notifications -> notifications -> requests -> faculty — VERIFIED
- Pre-flight `SELECT id FROM faculty WHERE id = ?` before transaction — VERIFIED
- 404 returned when faculty not found, before any DELETE runs — VERIFIED
- 500 returned with generic message on transaction failure — VERIFIED
- `backend/db.js`: `student_notifications` table creation block present — VERIFIED

## Self-Check: PASSED

---
*Phase: 02-polish-hardening*
*Completed: 2026-04-07*
