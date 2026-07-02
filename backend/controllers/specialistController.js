// controllers/specialistController.js
const pool = require('../db/pool');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/specialists  (public)
const listSpecialists = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM specialists ORDER BY name ASC');
  res.json({ success: true, data: rows });
});

// GET /api/specialists/:id  (public)
const getSpecialist = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM specialists WHERE id = ?', [req.params.id]);
  if (rows.length === 0) throw new ApiError(404, 'Specialist not found.');
  res.json({ success: true, data: rows[0] });
});

// POST /api/admin/specialists  (admin)
const createSpecialist = asyncHandler(async (req, res) => {
  const { slug, name, description, icon } = req.body;
  const [result] = await pool.query(
    'INSERT INTO specialists (slug, name, description, icon) VALUES (?, ?, ?, ?)',
    [slug, name, description || null, icon || null]
  );
  res.status(201).json({ success: true, message: 'Specialist created.', data: { id: result.insertId } });
});

// PATCH /api/admin/specialists/:id  (admin)
const updateSpecialist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [existing] = await pool.query('SELECT id FROM specialists WHERE id = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Specialist not found.');

  const fields = [];
  const values = [];
  const map = { slug: 'slug', name: 'name', description: 'description', icon: 'icon' };
  for (const [key, col] of Object.entries(map)) {
    if (req.body[key] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(req.body[key]);
    }
  }
  if (fields.length === 0) throw new ApiError(400, 'No valid fields provided to update.');

  values.push(id);
  await pool.query(`UPDATE specialists SET ${fields.join(', ')} WHERE id = ?`, values);
  res.json({ success: true, message: 'Specialist updated.' });
});

// DELETE /api/admin/specialists/:id  (admin)
const deleteSpecialist = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM specialists WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) throw new ApiError(404, 'Specialist not found.');
  res.json({ success: true, message: 'Specialist deleted.' });
});

module.exports = {
  listSpecialists,
  getSpecialist,
  createSpecialist,
  updateSpecialist,
  deleteSpecialist,
};
