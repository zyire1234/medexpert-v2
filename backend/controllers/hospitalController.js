// controllers/hospitalController.js
const pool = require('../db/pool');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET /api/hospitals  (public — supports ?state=&specialist=&search=)
const listHospitals = asyncHandler(async (req, res) => {
  const { state, specialist, search } = req.query;

  let sql = `
    SELECT h.id, h.slug, h.name, h.state, h.address, h.phone, h.email,
           h.description, h.rating, h.is_verified,
           GROUP_CONCAT(DISTINCT s.slug) AS specialist_slugs,
           GROUP_CONCAT(DISTINCT s.name) AS specialist_names
    FROM hospitals h
    LEFT JOIN hospital_specialists hs ON hs.hospital_id = h.id
    LEFT JOIN specialists s ON s.id = hs.specialist_id
    WHERE h.is_active = 1
  `;
  const params = [];

  if (state) {
    sql += ' AND h.state = ?';
    params.push(state);
  }
  if (search) {
    sql += ' AND (h.name LIKE ? OR h.address LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ' GROUP BY h.id';

  if (specialist) {
    sql += ' HAVING FIND_IN_SET(?, specialist_slugs) > 0';
    params.push(specialist);
  }

  sql += ' ORDER BY h.name ASC';

  const [rows] = await pool.query(sql, params);

  const data = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    state: r.state,
    address: r.address,
    phone: r.phone,
    email: r.email,
    description: r.description,
    rating: r.rating,
    isVerified: !!r.is_verified,
    specialists: r.specialist_slugs ? r.specialist_slugs.split(',') : [],
    specialistNames: r.specialist_names ? r.specialist_names.split(',') : [],
  }));

  res.json({ success: true, data });
});

// GET /api/hospitals/:id  (public)
const getHospital = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM hospitals WHERE id = ?', [req.params.id]);
  if (rows.length === 0) throw new ApiError(404, 'Hospital not found.');

  const [specRows] = await pool.query(
    `SELECT s.id, s.slug, s.name FROM hospital_specialists hs
     JOIN specialists s ON s.id = hs.specialist_id
     WHERE hs.hospital_id = ?`,
    [req.params.id]
  );

  const h = rows[0];
  res.json({
    success: true,
    data: {
      id: h.id,
      slug: h.slug,
      name: h.name,
      state: h.state,
      address: h.address,
      phone: h.phone,
      email: h.email,
      description: h.description,
      rating: h.rating,
      isVerified: !!h.is_verified,
      specialists: specRows,
    },
  });
});

// POST /api/admin/hospitals  (admin)
const createHospital = asyncHandler(async (req, res) => {
  const { name, state, address, phone, email, description, specialistIds } = req.body;
  const slug = slugify(name);

  const [result] = await pool.query(
    `INSERT INTO hospitals (slug, name, state, address, phone, email, description, is_verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
    [slug, name, state, address || null, phone || null, email || null, description || null]
  );

  const hospitalId = result.insertId;

  if (Array.isArray(specialistIds) && specialistIds.length > 0) {
    const values = specialistIds.map((sid) => [hospitalId, sid]);
    await pool.query(`INSERT IGNORE INTO hospital_specialists (hospital_id, specialist_id) VALUES ?`, [values]);
  }

  res.status(201).json({ success: true, message: 'Hospital created.', data: { id: hospitalId, slug } });
});

// PATCH /api/admin/hospitals/:id  (admin)
const updateHospital = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive, isVerified, specialistIds } = req.body;

  const [existing] = await pool.query('SELECT id FROM hospitals WHERE id = ?', [id]);
  if (existing.length === 0) throw new ApiError(404, 'Hospital not found.');

  const fields = [];
  const values = [];
  const simpleFields = ['name', 'state', 'address', 'phone', 'email', 'description'];
  for (const key of simpleFields) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }
  if (typeof isActive === 'boolean') {
    fields.push('is_active = ?');
    values.push(isActive ? 1 : 0);
  }
  if (typeof isVerified === 'boolean') {
    fields.push('is_verified = ?');
    values.push(isVerified ? 1 : 0);
  }

  if (fields.length > 0) {
    values.push(id);
    await pool.query(`UPDATE hospitals SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  if (Array.isArray(specialistIds)) {
    await pool.query('DELETE FROM hospital_specialists WHERE hospital_id = ?', [id]);
    if (specialistIds.length > 0) {
      const values2 = specialistIds.map((sid) => [id, sid]);
      await pool.query(`INSERT IGNORE INTO hospital_specialists (hospital_id, specialist_id) VALUES ?`, [values2]);
    }
  }

  res.json({ success: true, message: 'Hospital updated.' });
});

// DELETE /api/admin/hospitals/:id  (admin)
const deleteHospital = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM hospitals WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) throw new ApiError(404, 'Hospital not found.');
  res.json({ success: true, message: 'Hospital deleted.' });
});

module.exports = {
  listHospitals,
  getHospital,
  createHospital,
  updateHospital,
  deleteHospital,
};
