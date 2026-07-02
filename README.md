# MedExpert — Full Stack

This package contains your original frontend (unchanged in design) plus a
new Node.js + Express + MySQL backend.

```
medexpert-fullstack/
├── frontend/    Your original site. index.html has minimal JS-only edits
│                so it talks to the real backend — see frontend/README.md
│                in that folder for exactly what changed.
└── backend/      New Node.js + Express + MySQL API — see backend/README.md
                  for full setup instructions.
```

## Quick start

1. **Backend first** — follow `backend/README.md`:
   - `cd backend && npm install`
   - `mysql -u root -p < db/schema.sql`
   - `cp .env.example .env` and fill in your DB credentials + JWT secrets
   - `npm run seed` (creates hospitals/specialists matching the frontend, plus your first admin login)
   - `npm start` (runs on `http://localhost:5000` by default)

2. **Frontend** — open `frontend/index.html` directly in a browser, or
   serve it with any static file server. It already points at
   `http://localhost:5000/api` via the `window.MEDEXPERT_API_BASE_URL`
   config near the top of the file — change that one line if you deploy
   the backend elsewhere.

## What changed in the frontend, and why

Per your requirements, the design, layout, colors, branding, images, and
page structure of `index.html` were left completely untouched. The only
edits were the minimum necessary to replace fake/hardcoded behavior with
real backend calls:

- **Appointment form** — now actually submits to the database via
  `POST /api/appointments` instead of just popping the success modal with
  no data saved anywhere.
- **Admin login** — now actually checks credentials against the database
  (with bcrypt-hashed passwords) via `POST /api/admin/auth/login`,
  instead of comparing to the hardcoded string `"admin123"` in client-side
  JavaScript (which anyone could read in the page source). One small
  email input was added to the login form, styled identically to the
  existing password input, since real login requires knowing *which*
  admin is signing in.
- **Admin dashboard stats** — the four summary numbers now refresh from
  real database counts after login.

Every other file (CSS, images, the unrelated React scaffold files that
were already in your upload) is byte-for-byte identical to what you sent.
