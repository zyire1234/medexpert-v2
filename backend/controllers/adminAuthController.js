// controllers/adminAuthController.js
const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signAdminToken } = require('../utils/jwt');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

// POST /api/admin/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query(
    'SELECT id, full_name, email, password_hash, role, is_active FROM admins WHERE email = ?',
    [email]
  );
  const admin = rows[0];

  if (!admin) {
    throw new ApiError(401, 'Invalid email or password.');
  }
  if (!admin.is_active) {
    throw new ApiError(403, 'This admin account has been deactivated.');
  }

  const passwordMatches = await bcrypt.compare(password, admin.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  await pool.query('UPDATE admins SET last_login_at = NOW() WHERE id = ?', [admin.id]);

  const token = signAdminToken({ sub: admin.id, email: admin.email, role: admin.role });

  res.json({
    success: true,
    message: 'Admin login successful.',
    data: {
      admin: {
        id: admin.id,
        fullName: admin.full_name,
        email: admin.email,
        role: admin.role,
      },
      token,
    },
  });
});

// GET /api/admin/auth/me  (requires admin JWT)
const me = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, role, last_login_at, created_at FROM admins WHERE id = ?',
    [req.admin.id]
  );
  const admin = rows[0];
  if (!admin) throw new ApiError(404, 'Admin not found.');

  res.json({
    success: true,
    data: {
      id: admin.id,
      fullName: admin.full_name,
      email: admin.email,
      role: admin.role,
      lastLoginAt: admin.last_login_at,
      createdAt: admin.created_at,
    },
  });
});

// POST /api/admin/auth/change-password (requires admin JWT)
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const [rows] = await pool.query('SELECT password_hash FROM admins WHERE id = ?', [req.admin.id]);
  const admin = rows[0];
  if (!admin) throw new ApiError(404, 'Admin not found.');

  const matches = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!matches) throw new ApiError(401, 'Current password is incorrect.');

  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, req.admin.id]);

  res.json({ success: true, message: 'Password updated successfully.' });
});

module.exports = { login, me, changePassword };
