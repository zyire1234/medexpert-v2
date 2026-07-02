// controllers/authController.js
const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signUserToken } = require('../utils/jwt');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [result] = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)`,
    [fullName, email, phone || null, passwordHash]
  );

  const token = signUserToken({ sub: result.insertId, email });

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: {
      user: { id: result.insertId, fullName, email, phone: phone || null },
      token,
    },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query(
    'SELECT id, full_name, email, phone, password_hash, is_active FROM users WHERE email = ?',
    [email]
  );
  const user = rows[0];

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }
  if (!user.is_active) {
    throw new ApiError(403, 'This account has been deactivated.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signUserToken({ sub: user.id, email: user.email });

  res.json({
    success: true,
    message: 'Login successful.',
    data: {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
      },
      token,
    },
  });
});

// GET /api/auth/me  (requires user JWT)
const me = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, phone, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  const user = rows[0];
  if (!user) throw new ApiError(404, 'User not found.');

  res.json({
    success: true,
    data: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      createdAt: user.created_at,
    },
  });
});

module.exports = { register, login, me };
