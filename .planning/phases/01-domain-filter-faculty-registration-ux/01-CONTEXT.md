# Phase 1 Context: Domain Filter & Faculty Registration UX

## Phase Goal

Complete US4 (filter by domain on available guides list) and improve US2 post-registration feedback so faculty know their account is pending approval.

## Decisions

### Filter Implementation

**Decision: Server-side `?domain=` query param**

Add a `domain` query param to `GET /api/faculty/available`. When a domain tag is clicked, the frontend calls `/api/faculty/available?domain=ML` (or similar). Backend filters with SQL `WHERE domain LIKE ?`.

- The `/api/faculty/available` endpoint in `backend/routes/faculty.js` (line 57) needs to accept optional `?domain=` query param
- Filter is case-insensitive, substring match (LIKE `%keyword%`)
- If no `?domain=` param provided, return all approved faculty (existing behavior preserved)

**Decision: Domain tag buttons (clickable chips) as the filter UI**

- Collect all unique domain values from the loaded guides list
- Display them as clickable chip/tag buttons above the guides list
- Clicking a chip selects that domain filter and fires a new API call with `?domain=<value>`
- Active chip should be visually highlighted (different background/color)
- An "All" chip (or clearing the selection) resets to unfiltered list
- Tags already rendered per guide at Dashboard.jsx line ~487 — reuse same tag style for the filter chips

### Faculty Pending UX

**Decision: Show pending message on both registration success AND login 403**

Two touch points:

1. **After faculty registration success** (`frontend/src/pages/FacultyRegister.jsx`):
   - Current: shows generic success state
   - Change: include a prominent notice — "Your account is pending admin approval. You will be able to log in once approved."
   - Keep the existing success styling, just add this message clearly

2. **On login page 403 error** (`frontend/src/pages/Login.jsx`):
   - Current: shows raw `"Account pending admin approval"` string as error (from backend JSON)
   - Change: detect the specific error string from the backend and render a friendlier message — e.g., "Your account is awaiting admin approval. Please check back later." — styled differently from a generic login failure

## Canonical Refs

- `backend/routes/faculty.js` — `/available` endpoint (line 57–70): add `?domain=` query param support
- `frontend/src/api/faculty.js` — `getAvailableGuides()` (line 10): add optional `domain` param to fetch URL
- `frontend/src/pages/Dashboard.jsx` — guides section (lines ~437–500): add chip filter UI, wire to API call
- `frontend/src/pages/FacultyRegister.jsx` — post-registration success state: add pending approval message
- `frontend/src/pages/Login.jsx` — error handling: detect 403 "pending" error and show friendly message

## Out of Scope for This Phase

- Full-text search across faculty name or department (just domain filtering)
- Multi-select domain filtering (one active filter at a time is sufficient)
- Animated transitions on filter change
