// controllers/userManagementController.js
const pool = require('../db/pool');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/users  (admin: list/search users, paginated)
const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  const search = (req.query.search || '').trim();

  let where = '';
  const params = [];
  if (search) {
    where = 'WHERE full_name LIKE ? OR email LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  const [rows] = await pool.query(
    `SELECT id, full_name, email, phone, is_active, created_at
     FROM users ${where}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM users ${where}`,
    params
  );

  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/admin/users/:id
const getUser = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, full_name, email, phone, is_active, created_at, updated_at FROM users WHERE id = ?',
    [req.params.id]
  );
  if (rows.length === 0) throw new ApiError(404, 'User not found.');
  res.json({ success: true, data: rows[0] });
});

// PATCH /api/admin/users/:id  (e.g. deactivate a user)
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive, fullName, phone } = req.body;

  const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'User not found.');

  const fields = [];
  const values = [];

  if (typeof isActive === 'boolean') {
    fields.push('is_active = ?');
    values.push(isActive ? 1 : 0);
  }
  if (typeof fullName === 'string' && fullName.trim()) {
    fields.push('full_name = ?');
    values.push(fullName.trim());
  }
  if (typeof phone === 'string') {
    fields.push('phone = ?');
    values.push(phone.trim() || null);
  }

  if (fields.length === 0) {
    throw new ApiError(400, 'No valid fields provided to update.');
  }

  values.push(id);
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

  res.json({ success: true, message: 'User updated.' });
});

// DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) throw new ApiError(404, 'User not found.');
  res.json({ success: true, message: 'User deleted.' });
});

module.exports = { listUsers, getUser, updateUser, deleteUser };
