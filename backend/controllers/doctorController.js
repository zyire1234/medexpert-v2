// controllers/doctorController.js
const pool = require('../db/pool');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/doctors  (public — supports ?specialist=&hospital=&search=)
const listDoctors = asyncHandler(async (req, res) => {
  const { specialist, hospital, search } = req.query;

  let sql = `
    SELECT d.id, d.full_name, d.email, d.phone, d.bio, d.years_experience,
           s.id AS specialist_id, s.name AS specialist_name, s.slug AS specialist_slug,
           h.id AS hospital_id, h.name AS hospital_name
    FROM doctors d
    LEFT JOIN specialists s ON s.id = d.specialist_id
    LEFT JOIN hospitals h ON h.id = d.hospital_id
    WHERE d.is_active = 1
  `;
  const params = [];

  if (specialist) {
    sql += ' AND s.slug = ?';
    params.push(specialist);
  }
  if (hospital) {
    sql += ' AND d.hospital_id = ?';
    params.push(hospital);
  }
  if (search) {
    sql += ' AND d.full_name LIKE ?';
    params.push(`%${search}%`);
  }

  sql += ' ORDER BY d.full_name ASC';

  const [rows] = await pool.query(sql, params);

  const data = rows.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    bio: r.bio,
    yearsExperience: r.years_experience,
    specialist: r.specialist_id ? { id: r.specialist_id, name: r.specialist_name, slug: r.specialist_slug } : null,
    hospital: r.hospital_id ? { id: r.hospital_id, name: r.hospital_name } : null,
  }));

  res.json({ success: true, data });
});

// GET /api/doctors/:id  (public)
const getDoctor = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT d.*, s.name AS specialist_name, s.slug AS specialist_slug, h.name AS hospital_name
     FROM doctors d
     LEFT JOIN specialists s ON s.id = d.specialist_id
     LEFT JOIN hospitals h ON h.id = d.hospital_id
     WHERE d.id = ?`,
    [req.params.id]
  );
  if (rows.length === 0) throw new ApiError(404, 'Doctor not found.');
  const d = rows[0];

  res.json({
    success: true,
    data: {
      id: d.id,
      fullName: d.full_name,
      email: d.email,
      phone: d.phone,
      bio: d.bio,
      yearsExperience: d.years_experience,
      specialist: d.specialist_id ? { id: d.specialist_id, name: d.specialist_name, slug: d.specialist_slug } : null,
      hospital: d.hospital_id ? { id: d.hospital_id, name: d.hospital_name } : null,
    },
  });
});

// POST /api/admin/doctors  (admin)
const createDoctor = asyncHandler(async (req, res) => {
  const { fullName, email, phone, specialistId, hospitalId, bio, yearsExperience } = req.body;

  const [result] = await pool.query(
    `INSERT INTO doctors (full_name, email, phone, specialist_id, hospital_id, bio, years_experience)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [fullName, email || null, phone || null, specialistId || null, hospitalId || null, bio || null, yearsExperience || null]
  );

  res.status(201).json({ success: true, message: 'Doctor created.', data: { id: result.insertId } });
});

// PATCH /api/admin/doctors/:id  (admin)
const updateDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const [existing] = await pool.query('SELECT id FROM doctors WHERE id = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Doctor not found.');

  const fields = [];
  const values = [];
  const map = {
    fullName: 'full_name', email: 'email', phone: 'phone', bio: 'bio',
    specialistId: 'specialist_id', hospitalId: 'hospital_id', yearsExperience: 'years_experience',
  };
  for (const [key, col] of Object.entries(map)) {
    if (req.body[key] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(req.body[key]);
    }
  }
  if (typeof isActive === 'boolean') {
    fields.push('is_active = ?');
    values.push(isActive ? 1 : 0);
  }

  if (fields.length === 0) throw new ApiError(400, 'No valid fields provided to update.');

  values.push(id);
  await pool.query(`UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`, values);

  res.json({ success: true, message: 'Doctor updated.' });
});

// DELETE /api/admin/doctors/:id  (admin)
const deleteDoctor = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM doctors WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) throw new ApiError(404, 'Doctor not found.');
  res.json({ success: true, message: 'Doctor deleted.' });
});

module.exports = {
  listDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
