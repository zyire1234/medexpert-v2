# MedExpert Backend

A Node.js + Express + MySQL backend for the MedExpert frontend
(`index.html`). It provides user registration/login, admin login, doctor
and hospital management, appointment booking, contact form handling, and
a small admin dashboard stats endpoint — all secured with JWT and bcrypt
password hashing.

The existing frontend (`index.html`) was **not redesigned or restyled**.
The only changes made to it were the minimum necessary to call this real
API instead of using hardcoded/fake data:

- The appointment form now `POST`s to `/api/appointments` instead of
  just showing the success modal.
- The admin login form now `POST`s to `/api/admin/auth/login` instead of
  checking a hardcoded `"admin123"` password client-side. A single email
  input was added next to the existing password field (using the exact
  same input styling) because real authentication requires identifying
  *which* admin is logging in — there was previously no way to do that.
- The admin dashboard's 4 stat numbers are now refreshed from
  `/api/admin/dashboard/stats` after login (they still show the original
  static numbers until then, so nothing looks broken if the backend is
  offline).
- A small inline `<script>` block was added near the top of `<head>`
  defining `window.MEDEXPERT_API_BASE_URL`, so you can point the page at
  wherever you deploy this backend.

No colors, layout, animations, copy, images, or page structure were
changed. Every other file in the original upload (CSS, assets, the
unrelated React scaffold files) is untouched.

---

## 1. Requirements

- Node.js 18+
- MySQL 8.0+ (or MariaDB 10.6+, which is wire-compatible)
- npm

## 2. Setup

### 2.1 Install dependencies

```bash
cd medexpert-backend
npm install
```

### 2.2 Create the database

Make sure MySQL is running, then run the schema script. It creates the
`medexpert_db` database and all tables (safe to re-run):

```bash
mysql -u root -p < db/schema.sql
```

If you'd rather use a dedicated, non-root MySQL user (recommended), create
one first:

```sql
CREATE USER 'medexpert_user'@'localhost' IDENTIFIED BY 'change_this_password';
GRANT ALL PRIVILEGES ON medexpert_db.* TO 'medexpert_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2.3 Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `5000`) |
| `CORS_ORIGIN` | Comma-separated list of origins allowed to call the API (e.g. wherever `index.html` is served from) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection details |
| `JWT_SECRET` | Long random string used to sign **user** tokens |
| `JWT_EXPIRES_IN` | User token lifetime (default `7d`) |
| `JWT_ADMIN_SECRET` | A **different** long random string used to sign **admin** tokens |
| `JWT_ADMIN_EXPIRES_IN` | Admin token lifetime (default `1d`) |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor (default `10`) |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` | Used once by `npm run seed` to create your first admin account |

Generate strong secrets, e.g.:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2.4 Seed initial data

This creates the specialists/hospitals already shown in the existing
frontend (so the data the API returns matches what the UI currently
hardcodes) and creates your first admin account:

```bash
npm run seed
```

Console output will confirm the admin account email — **log in once and
change the password immediately** via `POST /api/admin/auth/change-password`.

### 2.5 Run the server

```bash
npm start
```

For development with auto-restart on file changes:

```bash
npm run dev
```

You should see:

```
Connected to MySQL database.
MedExpert API listening on port 5000 (development)
```

Visit `http://localhost:5000/health` to confirm it's running.

## 3. Connecting the frontend

Open `index.html` and check the script near the top of `<head>`:

```html
<script>
  window.MEDEXPERT_API_BASE_URL = "http://localhost:5000/api";
</script>
```

Update this URL if you deploy the backend somewhere other than
`localhost:5000`. Also add the origin you're serving `index.html` from to
`CORS_ORIGIN` in your `.env` (e.g. `http://127.0.0.1:5500` if you're using
VS Code's Live Server, or your production domain).

## 4. API Overview

All responses are JSON in the shape `{ success, message?, data?, details? }`.
Protected routes require an `Authorization: Bearer <token>` header.

### Public

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a user account |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Current user's profile (requires user token) |
| GET | `/api/hospitals` | List hospitals (`?state=&specialist=&search=`) |
| GET | `/api/hospitals/:id` | Hospital details |
| GET | `/api/doctors` | List doctors (`?specialist=&hospital=&search=`) |
| GET | `/api/doctors/:id` | Doctor details |
| GET | `/api/specialists` | List specialties |
| GET | `/api/specialists/:id` | Specialty details |
| POST | `/api/appointments` | Book an appointment (works for guests; attaches user if logged in) |
| GET | `/api/appointments/mine` | Logged-in user's appointment history (requires user token) |
| POST | `/api/contact` | Submit a contact message |
| POST | `/api/symptom-checks` | Log a symptom-checker result (analytics) |

### Admin (require `Authorization: Bearer <admin token>`)

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/auth/login` | Admin login |
| GET | `/api/admin/auth/me` | Current admin's profile |
| POST | `/api/admin/auth/change-password` | Change own password |
| GET / POST / PATCH / DELETE | `/api/admin/admins` | Manage admin accounts (super_admin only for write ops) |
| GET / PATCH / DELETE | `/api/admin/users` | Manage user accounts |
| POST / PATCH / DELETE | `/api/admin/hospitals` | Manage hospitals |
| POST / PATCH / DELETE | `/api/admin/doctors` | Manage doctors |
| POST / PATCH / DELETE | `/api/admin/specialists` | Manage specialties |
| GET / PATCH / DELETE | `/api/admin/appointments` | Manage appointments (`?status=&hospitalId=`) |
| GET / PATCH / DELETE | `/api/admin/contact-messages` | Manage contact messages |
| GET | `/api/admin/dashboard/stats` | Dashboard summary counts |

## 5. Security notes

- Passwords are hashed with **bcrypt** before being stored — never stored
  in plain text.
- User and admin JWTs are signed with **separate secrets**, so a stolen
  user token cannot be used to access admin endpoints.
- All write endpoints validate input with `express-validator` and return
  `400` with field-level error details on bad input.
- `helmet` sets standard security headers; `express-rate-limit` throttles
  general API traffic and applies a stricter limit to login/register
  endpoints.
- Change `JWT_SECRET`, `JWT_ADMIN_SECRET`, and the seeded admin password
  before deploying anywhere public. Never commit your real `.env` file.

## 6. Project structure

```
medexpert-backend/
├── app.js                  # Express app setup (middleware, routes)
├── server.js                # Entry point — connects to DB, starts server
├── package.json
├── .env.example
├── db/
│   ├── schema.sql           # Full database schema (run this first)
│   ├── seed.js               # Seeds specialists/hospitals + first admin
│   └── pool.js                # MySQL connection pool
├── controllers/             # Route handler logic, grouped by resource
├── routes/                  # Express routers, grouped by resource
├── middleware/               # auth, validation, error handling, rate limits
└── utils/                    # JWT helpers, ApiError, async wrapper, validators
```
