# Tech Stack

**Analysis Date:** 2026-04-07

## Languages

**Primary:**
- JavaScript (ES Modules on frontend, CommonJS on backend) — no TypeScript

## Frameworks & Libraries

**Frontend:**
- React 18.2.0 — UI framework (`frontend/src/`)
- React Router DOM 6.22.0 — client-side routing (`frontend/src/App.jsx`)

**Backend:**
- Express 4.18.2 — HTTP server (`backend/server.js`)
- No frontend framework for SSR; pure SPA

**Testing:**
- None detected — no test framework configured in either `package.json`

## Build & Tooling

**Bundler:**
- Vite 5.1.4 — frontend dev server and build (`frontend/vite.config.js`)
- `@vitejs/plugin-react` 4.2.1 — Babel-based JSX transform

**Linting/Formatting:**
- None detected — no ESLint, Prettier, or Biome config present

**CI/CD:**
- None detected

## Runtime & Infrastructure

**Node.js:** v22.22.0 (system runtime at analysis time)

**Backend server port:** 3001 (hardcoded in `backend/server.js`)

**Frontend dev port:** 5173 (Vite default; CORS origin hardcoded to `http://localhost:5173` in `backend/server.js`)

**Deployment:** No deployment config detected — local development only

## Package Management

**Backend:**
- npm — lockfile present at `backend/package-lock.json`
- No `engines` field specifying Node version

**Frontend:**
- npm — lockfile present at `frontend/package-lock.json`
- ESM (`"type": "module"` in `frontend/package.json`)

**Monorepo:** No — two independent `package.json` files, no workspace config
