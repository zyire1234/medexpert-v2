// controllers/contactController.js
const pool = require('../db/pool');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/contact  (public)
const submitContactMessage = asyncHandler(async (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;

  await pool.query(
    `INSERT INTO contact_messages (full_name, email, phone, subject, message)
     VALUES (?, ?, ?, ?, ?)`,
    [fullName, email, phone || null, subject || null, message]
  );

  res.status(201).json({ success: true, message: 'Your message has been sent. We will get back to you soon.' });
});

// GET /api/admin/contact-messages  (admin)
const listContactMessages = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  const { isRead } = req.query;

  let where = 'WHERE 1=1';
  const params = [];
  if (isRead === 'true' || isRead === 'false') {
    where += ' AND is_read = ?';
    params.push(isRead === 'true' ? 1 : 0);
  }

  const [rows] = await pool.query(
    `SELECT * FROM contact_messages ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM contact_messages ${where}`, params);

  res.json({
    success: true,
    data: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// PATCH /api/admin/contact-messages/:id  (admin — mark read/unread)
const updateContactMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isRead } = req.body;
  if (typeof isRead !== 'boolean') throw new ApiError(400, 'isRead must be a boolean.');

  const [result] = await pool.query('UPDATE contact_messages SET is_read = ? WHERE id = ?', [isRead ? 1 : 0, id]);
  if (result.affectedRows === 0) throw new ApiError(404, 'Message not found.');

  res.json({ success: true, message: 'Message updated.' });
});

// DELETE /api/admin/contact-messages/:id  (admin)
const deleteContactMessage = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) throw new ApiError(404, 'Message not found.');
  res.json({ success: true, message: 'Message deleted.' });
});

module.exports = {
  submitContactMessage,
  listContactMessages,
  updateContactMessage,
  deleteContactMessage,
};
