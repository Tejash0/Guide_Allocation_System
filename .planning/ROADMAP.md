# Roadmap: Guide Allocation System

## Overview

The core system is functional. This milestone closes the remaining user story gaps — domain filtering on the guides list and reliability hardening — so every acceptance criterion in the User Stories document is satisfied.

## Phases

- [x] **Phase 1: Domain Filter & Faculty Registration UX** - Add guide domain filter and post-registration approval feedback (completed 2026-04-07)
- [ ] **Phase 2: Polish & Hardening** - Frontend error handling, API robustness, and edge case fixes

## Phase Details

### Phase 1: Domain Filter & Faculty Registration UX
**Goal**: Complete US4 (filter by domain) and improve US2 post-registration feedback so faculty know their account is pending approval rather than getting a confusing login block.
**Depends on**: Nothing (first phase)
**Requirements**: REQ-08, REQ-04
**Success Criteria** (what must be TRUE):
  1. Student can type a keyword in the available guides list and see only matching faculty
  2. Faculty who register see a clear "pending admin approval" message before their first login attempt
  3. Filter works without a page reload

Plans:
- [x] 01-01: Add domain filter to available guides (backend + frontend)
- [x] 01-02: Faculty registration post-submit pending state UX

### Phase 2: Polish & Hardening
**Goal**: Address the highest-impact reliability concerns from CONCERNS.md that affect correctness and user experience.
**Depends on**: Phase 1
**Requirements**: REQ-09, REQ-10, REQ-11, REQ-12, REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, REQ-19
**Success Criteria** (what must be TRUE):
  1. Expired/invalid JWT redirects to login instead of showing raw JSON error
  2. Network errors in frontend API calls are caught and shown as user-friendly messages
  3. Admin faculty delete removes associated requests and notifications
  4. React component crash shows error boundary instead of blank page

Plans:
- [x] 02-01: Frontend error handling (401 interceptor, try/catch in API clients)
- [x] 02-02: Backend data integrity (admin delete cascade, INSERT OR REPLACE fix)
- [x] 02-03: React error boundary
