---
phase: 01-domain-filter-faculty-registration-ux
verified: 2026-04-07T00:00:00Z
status: passed
score: 3/3 success criteria verified
gaps: []
---

# Phase 1 Verification Report

**Phase Goal:** Complete US4 (filter by domain) and improve US2 post-registration feedback so faculty know their account is pending approval rather than getting a confusing login block.
**Verified:** 2026-04-07
**Status:** PASS
**Re-verification:** No — initial verification

---

## Success Criteria

### SC1: Student can filter the available guides list by domain keyword and see only matching faculty

**Result: PASS**

Full end-to-end chain verified:

**Backend** (`backend/routes/faculty.js`, lines 57-87):
- `GET /api/faculty/available` accepts `?domain=` query param.
- When `domain` is non-empty it runs a `LIKE LOWER(?)` query with `%domain%` wrapping — case-insensitive substring match, returns only `approved = 1` faculty.
- When `domain` is absent or empty, returns all approved faculty.
- Returns `current_team_count` from the same query — no extra round-trip needed.

**API layer** (`frontend/src/api/faculty.js`, lines 10-16):
- `getAvailableGuides(domain)` builds the URL conditionally: if `domain` is non-empty, appends `?domain=encodeURIComponent(domain.trim())`. If absent/empty, omits the param entirely. URL construction is correct.

**Dashboard chip rendering** (`frontend/src/pages/Dashboard.jsx`, lines 459-512):
- Domain chips are derived live from the current `guides` array: collects all `domain` tags across loaded faculty, deduplicates, sorts, and renders one chip per tag plus an "All" reset chip.
- Chips are only shown when `allTags.length > 0`, so the bar doesn't appear on an empty list.

**handleDomainFilter wiring** (lines 245-254):
- Clicking a chip calls `handleDomainFilter(tag)`. Toggle logic: clicking the active chip clears the filter.
- Calls `getAvailableGuides(next || undefined)` — passes `undefined` (not an empty string) when clearing, which correctly triggers the no-param branch in the API helper.
- Response is passed to `setGuides(...)` — React state update, no page reload, no `window.location`.

No `window.location`, `router.push`, or page-level reload found in the filter path.

---

### SC2: Faculty who register see a clear "pending admin approval" message before their first login attempt

**Result: PASS**

**Post-registration success screen** (`frontend/src/pages/FacultyRegister.jsx`, lines 56-105):
- When `success === true` the component renders a dedicated screen (not a redirect to login).
- Primary message (line 72): "Your account is pending admin approval. **You will not be able to log in until an admin approves your account.**" — explicit, bold "cannot log in yet" language.
- A numbered "What happens next" card explains the admin review step, notification on approval, and when they can sign in.
- The only action available is "Back to Sign In" — faculty cannot accidentally proceed.

**Pre-submission notice** (lines 137-150):
- A persistent amber info banner on the registration form itself reads "Faculty accounts require admin approval before activation." — faculty know this before they even submit.

Both the pre-submit warning and the post-submit success screen meet the criterion.

---

### SC3: Filter works without a page reload

**Result: PASS**

Already confirmed under SC1. `handleDomainFilter` is a fully async React handler:
1. Sets `domainFilter` state (updates chip highlight immediately via React).
2. Awaits `getAvailableGuides()` and calls `setGuides()` — DOM updates through React reconciliation.
3. No calls to `window.location`, `location.reload()`, `router.navigate`, or `history.push` exist in this code path.

The guides list and chip selection both update in-place without any navigation event.

---

### Bonus: Login.jsx 403 handling (listed in files-to-verify)

**Result: PASS (exceeds requirement)**

**Backend** (`backend/routes/auth.js`, lines 100-102):
- Login endpoint checks `user.approved === 0` for faculty and returns `HTTP 403` with `{ error: 'Account pending admin approval' }`.

**API helper** (`frontend/src/api/auth.js`, lines 21-28):
- `login()` spreads the JSON body into the return value, so `result.error` will equal `'Account pending admin approval'` exactly.

**Login.jsx** (lines 34-36, 66-81):
- Checks `result.error === 'Account pending admin approval'` — exact string match against the backend message.
- Sets `pendingApproval = true` and clears `error` — the amber notice block (lines 66-81) is rendered instead of the generic red error div.
- Amber notice reads "Account awaiting approval" / "Your faculty account has not been approved yet. An admin will review your registration and you'll receive an in-app notification once it's active."
- The generic red error block is gated on `error` being non-empty, which is explicitly cleared in the pending-approval branch — no double-display.

---

## Artifact Summary

| File | Level 1 (Exists) | Level 2 (Substantive) | Level 3 (Wired) | Status |
|---|---|---|---|---|
| `backend/routes/faculty.js` — GET /available | Yes | Yes — real SQL LIKE query, not stub | Yes — registered in express router | VERIFIED |
| `frontend/src/api/faculty.js` — getAvailableGuides | Yes | Yes — conditional URL construction with encodeURIComponent | Yes — imported and called in Dashboard.jsx | VERIFIED |
| `frontend/src/pages/Dashboard.jsx` — chip UI + handler | Yes | Yes — chips, toggle logic, setGuides call | Yes — handleDomainFilter wired to chip onClick | VERIFIED |
| `frontend/src/pages/FacultyRegister.jsx` — success screen | Yes | Yes — explicit "cannot log in" language, numbered steps | Yes — rendered when success===true after registerFaculty call | VERIFIED |
| `frontend/src/pages/Login.jsx` — pendingApproval branch | Yes | Yes — amber notice, separate state from red error | Yes — wired to result.error string match from login() | VERIFIED |

---

## Anti-Patterns

None found in the verified files. No TODOs, no placeholder returns, no hardcoded empty arrays passed to components, no `console.log`-only handlers.

---

## Human Verification Recommended

These items cannot be verified statically:

### 1. Chip population on first load

**Test:** Log in as a student, navigate to Available Guides. Confirm domain chips appear automatically (without typing anything).
**Expected:** Chips built from faculty domain values already loaded on page mount.
**Why human:** Requires live DB data with faculty who have domain values set and are approved.

### 2. "All" chip clears filter and restores full list

**Test:** Click a domain chip, then click "All". Confirm all faculty reappear.
**Expected:** Guide count returns to the unfiltered total.
**Why human:** Reactive behavior requires a running browser session.

### 3. Pending approval amber notice — visual and contrast

**Test:** Register as faculty, submit, then immediately attempt to log in.
**Expected:** Login page shows amber notice (not red error) with the approval message.
**Why human:** Visual/color distinction cannot be confirmed from static analysis.

---

## Overall

**PASS — all 3 success criteria met.**

The domain filter is fully wired backend-to-frontend with no-reload React state updates. The faculty registration success screen contains explicit "you cannot log in yet" language. The login page correctly differentiates a 403 pending-approval response from other errors and displays an amber notice instead of the generic red error.

---

_Verified: 2026-04-07_
_Verifier: Claude (gsd-verifier)_
