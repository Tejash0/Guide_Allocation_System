# Directory Structure

## Root Layout

```
SEPM/
├── backend/                  # Express REST API (port 3001)
│   ├── server.js             # Entry point, route mounting, CORS config
│   ├── db.js                 # SQLite init, schema creation, seed admin
│   ├── guide_allocation.db   # SQLite database file (binary)
│   ├── middleware/
│   │   └── auth.js           # requireAuth, requireAdmin JWT middleware
│   └── routes/
│       ├── auth.js           # POST /login, POST /register (student & faculty)
│       ├── admin.js          # Admin dashboard, user management
│       ├── faculty.js        # Faculty profile, request management
│       ├── student.js        # Student profile, guide requests, notifications
│       └── requests.js       # Shared request operations
├── frontend/                 # React SPA (Vite, port 5173)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx          # React entry point
│       ├── App.jsx           # Router setup, route definitions
│       ├── api/              # Fetch wrappers per role
│       │   ├── auth.js
│       │   ├── student.js
│       │   ├── faculty.js
│       │   ├── requests.js
│       │   └── admin.js
│       ├── components/
│       │   └── ProtectedRoute.jsx  # Auth guard HOC
│       └── pages/
│           ├── Login.jsx           # Central auth hub
│           ├── StudentRegister.jsx
│           ├── FacultyRegister.jsx
│           ├── Dashboard.jsx       # Student + faculty dashboard (role-branched)
│           ├── AdminDashboard.jsx
│           └── AuthLayout.jsx      # Shared dual-panel auth layout
├── diagrams/                 # SVG structural diagrams (8 files)
├── .planning/                # GSD planning artifacts
└── package.json              # Root (if any shared scripts)
```

## Frontend Structure

- **Routing**: React Router in `App.jsx`; `/` → Login, `/dashboard` → students/faculty, `/admin` → admin only
- **State**: Local `useState` per component — no global state manager (no Redux/Zustand/Context)
- **API layer**: `src/api/*.js` — thin fetch wrappers that read JWT from `localStorage`
- **Auth guard**: `ProtectedRoute.jsx` wraps routes, redirects to `/` if no token
- **Styling**: All inline JSX styles — no CSS files, no CSS framework (Tailwind/MUI/etc.)
- **Component split**: Pages are large monoliths; minimal reusable component extraction

## Backend Structure

- **Entry**: `server.js` mounts routes under `/api/*`, configures CORS for `localhost:5173`
- **DB**: `db.js` runs schema `CREATE TABLE IF NOT EXISTS` on startup; seeds hardcoded admin
- **Middleware**: `auth.js` exports `requireAuth` (any logged-in user) and `requireAdmin` (admin role only)
- **Routes**: One file per role; each imports `db` directly — no service/repository layer
- **Error handling**: Mix of `try/catch` and bare promise chains; no centralized error middleware

## Configuration Files

- `backend/` — no `.env` file observed; `JWT_SECRET` may be hardcoded or process.env
- `frontend/vite.config.js` — Vite config, likely proxy to `:3001`
- No Docker, no CI config files observed
