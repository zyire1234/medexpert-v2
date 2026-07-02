// controllers/appointmentController.js
const pool = require('../db/pool');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/appointments  (public — works for guests; attaches user_id if logged in)
const createAppointment = asyncHandler(async (req, res) => {
  const {
    fullName, phone, email, hospitalId, specialistId,
    preferredDate, preferredTimeSlot, notes,
  } = req.body;

  const userId = req.user ? req.user.id : null;

  const [result] = await pool.query(
    `INSERT INTO appointments
      (user_id, full_name, phone, email, hospital_id, specialist_id, preferred_date, preferred_time_slot, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, fullName, phone, email || null, hospitalId || null, specialistId || null, preferredDate, preferredTimeSlot, notes || null]
  );

  res.status(201).json({
    success: true,
    message: 'Appointment request submitted. The hospital will contact you to confirm.',
    data: { id: result.insertId },
  });
});

// GET /api/appointments/mine  (requires user JWT)
const myAppointments = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.*, h.name AS hospital_name, s.name AS specialist_name
     FROM appointments a
     LEFT JOIN hospitals h ON h.id = a.hospital_id
     LEFT JOIN specialists s ON s.id = a.specialist_id
     WHERE a.user_id = ?
     ORDER BY a.created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
});

// GET /api/admin/appointments  (admin — list/filter/paginate)
const listAppointments = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  const { status, hospitalId } = req.query;

  let where = 'WHERE 1=1';
  const params = [];
  if (status) {
    where += ' AND a.status = ?';
    params.push(status);
  }
  if (hospitalId) {
    where += ' AND a.hospital_id = ?';
    params.push(hospitalId);
  }

  const [rows] = await pool.query(
    `SELECT a.*, h.name AS hospital_name, s.name AS specialist_name
     FROM appointments a
     LEFT JOIN hospitals h ON h.id = a.hospital_id
     LEFT JOIN specialists s ON s.id = a.specialist_id
     ${where}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM appointments a ${where}`,
    params
  );

  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// PATCH /api/admin/appointments/:id  (admin — update status)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${validStatuses.join(', ')}`);
  }

  const [result] = await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
  if (result.affectedRows === 0) throw new ApiError(404, 'Appointment not found.');

  res.json({ success: true, message: 'Appointment status updated.' });
});

// DELETE /api/admin/appointments/:id  (admin)
const deleteAppointment = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) throw new ApiError(404, 'Appointment not found.');
  res.json({ success: true, message: 'Appointment deleted.' });
});

module.exports = {
  createAppointment,
  myAppointments,
  listAppointments,
  updateAppointmentStatus,
  deleteAppointment,
};
