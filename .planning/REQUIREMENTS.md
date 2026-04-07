# Requirements

## Legend

- **REQ-ID**: Unique identifier
- **Priority**: must / should / nice
- **Status**: validated ✓ / active / out-of-scope

---

## Authentication & Registration

| REQ-ID | Requirement | Priority | Status |
|--------|-------------|----------|--------|
| REQ-01 | Student can register with name, email, department, year, password | must | ✓ validated |
| REQ-02 | Faculty can register with name, email, department, domain, password | must | ✓ validated |
| REQ-03 | Student receives JWT on login and is redirected to dashboard | must | ✓ validated |
| REQ-04 | Faculty login is blocked until admin approves account (403 returned) | must | ✓ validated |
| REQ-05 | Invalid credentials show error message | must | ✓ validated |
| REQ-06 | Authenticated users are redirected away from login/register pages | should | ✓ validated |

## Guide Discovery

| REQ-ID | Requirement | Priority | Status |
|--------|-------------|----------|--------|
| REQ-07 | Student can view list of available (approved) faculty with name, department, domain, remaining slots | must | ✓ validated |
| REQ-08 | Available guides list supports filtering by domain/department keyword | must | active |

## Guide Request Lifecycle

| REQ-ID | Requirement | Priority | Status |
|--------|-------------|----------|--------|
| REQ-09 | Student can send a guide request with an optional message | must | ✓ validated |
| REQ-10 | Student cannot send duplicate request to same faculty | must | ✓ validated |
| REQ-11 | Student can withdraw a pending request | must | ✓ validated |
| REQ-12 | Faculty can view all pending requests on their dashboard | must | ✓ validated |
| REQ-13 | Faculty can accept a student request | must | ✓ validated |
| REQ-14 | Faculty can reject a student request | must | ✓ validated |
| REQ-15 | When faculty accepts a request, all other pending requests from that student are auto-rejected | must | ✓ validated |
| REQ-16 | Faculty acceptance is blocked when max_students capacity is reached | must | ✓ validated |

## Notifications

| REQ-ID | Requirement | Priority | Status |
|--------|-------------|----------|--------|
| REQ-17 | Student receives in-app notification when request is accepted or rejected | must | ✓ validated |
| REQ-18 | Faculty receives in-app notification when a student sends a request | must | ✓ validated |
| REQ-19 | Faculty receives in-app notification when their account is approved by admin | must | ✓ validated |

## Allocation View

| REQ-ID | Requirement | Priority | Status |
|--------|-------------|----------|--------|
| REQ-20 | Student dashboard shows their allocated guide once a request is accepted | must | ✓ validated |
| REQ-21 | Student can view their submitted project details on dashboard | should | ✓ validated |

## Admin

| REQ-ID | Requirement | Priority | Status |
|--------|-------------|----------|--------|
| REQ-22 | Admin can view all students and faculty | must | ✓ validated |
| REQ-23 | Admin can approve pending faculty accounts | must | ✓ validated |
| REQ-24 | Admin can set max student slots per faculty | must | ✓ validated |
| REQ-25 | Admin can remove faculty from the system | should | ✓ validated |
| REQ-26 | Admin dashboard shows live stats (total students, approved faculty, pending faculty, total requests) | should | ✓ validated |

## Out of Scope (v1)

| REQ-ID | Requirement | Reason |
|--------|-------------|--------|
| REQ-OOS-01 | Email notifications | Requires SMTP infrastructure; in-app satisfies acceptance criteria |
| REQ-OOS-02 | Password reset flow | Requires email; out of scope for v1 |
| REQ-OOS-03 | File uploads for project | Not in any user story acceptance criteria |
| REQ-OOS-04 | Pagination on admin lists | Single-institution scale |
