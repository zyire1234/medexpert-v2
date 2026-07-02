// controllers/adminManagementController.js
const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

// GET /api/admin/admins  (list all admin accounts)
const listAdmins = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, full_name, email, role, is_active, last_login_at, created_at
     FROM admins ORDER BY created_at DESC`
  );
  res.json({ success: true, data: rows });
});

// POST /api/admin/admins  (create a new admin account — super_admin only)
const createAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  const [existing] = await pool.query('SELECT id FROM admins WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new ApiError(409, 'An admin with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const finalRole = role === 'super_admin' ? 'super_admin' : 'admin';

  const [result] = await pool.query(
    `INSERT INTO admins (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
    [fullName, email, passwordHash, finalRole]
  );

  res.status(201).json({
    success: true,
    message: 'Admin account created.',
    data: { id: result.insertId, fullName, email, role: finalRole },
  });
});

// PATCH /api/admin/admins/:id  (update an admin's active state/role)
const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive, role, fullName } = req.body;

  const [existing] = await pool.query('SELECT id FROM admins WHERE id = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Admin not found.');

  const fields = [];
  const values = [];

  if (typeof isActive === 'boolean') {
    fields.push('is_active = ?');
    values.push(isActive ? 1 : 0);
  }
  if (role === 'admin' || role === 'super_admin') {
    fields.push('role = ?');
    values.push(role);
  }
  if (typeof fullName === 'string' && fullName.trim()) {
    fields.push('full_name = ?');
    values.push(fullName.trim());
  }

  if (fields.length === 0) {
    throw new ApiError(400, 'No valid fields provided to update.');
  }

  values.push(id);
  await pool.query(`UPDATE admins SET ${fields.join(', ')} WHERE id = ?`, values);

  res.json({ success: true, message: 'Admin updated.' });
});

// DELETE /api/admin/admins/:id
const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (Number(id) === req.admin.id) {
    throw new ApiError(400, 'You cannot delete your own admin account.');
  }

  const [result] = await pool.query('DELETE FROM admins WHERE id = ?', [id]);
  if (result.affectedRows === 0) throw new ApiError(404, 'Admin not found.');

  res.json({ success: true, message: 'Admin deleted.' });
});

module.exports = { listAdmins, createAdmin, updateAdmin, deleteAdmin };
