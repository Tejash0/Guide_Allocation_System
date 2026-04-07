# Code Conventions

## Naming Conventions

- **Backend route files**: lowercase domain names — `auth.js`, `student.js`, `faculty.js`, `requests.js`, `admin.js`
- **Frontend pages**: PascalCase JSX — `Dashboard.jsx`, `Login.jsx`, `StudentRegister.jsx`, `FacultyRegister.jsx`, `AuthLayout.jsx`
- **Frontend API modules**: lowercase domain names — `auth.js`, `student.js`, `faculty.js`, `requests.js`
- **React components**: PascalCase default exports — `export default function Dashboard()`
- **API client functions**: camelCase verb-noun — `sendRequest`, `getMyRequests`, `updateRequestStatus`, `withdrawRequest`, `markNotificationsRead`
- **Backend middleware**: camelCase — `requireAuth`, `requireAdmin`
- **Event handlers**: `handle`-prefixed camelCase — `handleChange`, `handleSubmit`
- **SQL columns / body fields**: snake_case — `student_id`, `faculty_id`, `preferred_faculty_id`, `password_hash`
- **Constants**: SCREAMING_SNAKE_CASE — `BASE_URL`, `JWT_SECRET`

## Code Style

- **Module system**: Backend uses CommonJS (`require`/`module.exports`); Frontend uses ES modules (`import`/`export`)
- **Async style**: DB calls are synchronous (`better-sqlite3`); only `bcrypt` and `jwt` use `async/await` in backend routes; frontend API always uses `async/await` + `fetch`
- **Inconsistency**: Auth API returns `{ ok: res.ok, ...json }` via `.then()`; other API modules return bare `res.json()` — inconsistent error surface
- **Error response shape**: Always `{ error: "string" }` — never nested
- **Success response shape**: `{ message: "..." }` for mutations; flat object or array for reads — no envelope wrapper

## API Design

- HTTP methods: GET reads, POST creates, PATCH partial updates, DELETE removes. PUT unused.
- Status codes in use: 200 default, 201 created, 400 bad input/business rule, 401 no/bad token, 403 wrong role, 404 not found, 409 duplicate, 500 server error
- Role checks done inline at top of each handler — no per-role router middleware

## Frontend Patterns

- No external state library — `useState`/`useEffect` only
- Auth state in `localStorage`: key `'token'` (string), key `'user'` (JSON)
- Token decoded manually: `JSON.parse(atob(token.split('.')[1]))` — no jwt library on frontend
- No React Context, no custom hooks
- Styling: heavy inline `style={{}}` throughout; global CSS via a `GLOBAL_CSS` template literal injected as `<style>` tag in `Dashboard.jsx`
- Form pattern: single state object + single `handleChange` + `validate()` returning errors object + `loading` boolean
- Auth redirect guard: early `<Navigate to="/dashboard" replace />` if token exists

## Backend Patterns

- `requireAuth` applied router-wide (`router.use`) in `student.js` and `requests.js`; per-route in `faculty.js` — **inconsistent**
- All DB queries use `better-sqlite3` prepared statements — no ORM
- Schema migrations: try/catch `ALTER TABLE` at startup in `backend/db.js`
- **No transactions**: multi-step operations (accept + auto-reject others + notify) run as sequential statements with no rollback on failure

## Comments & Documentation

- Backend: sparse inline comments labeling route intent; sprint/user-story references in `db.js`
- No JSDoc anywhere; no API documentation
