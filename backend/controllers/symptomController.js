// controllers/symptomController.js
const pool = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/symptom-checks  (public — logs symptom-checker usage for analytics)
const logSymptomCheck = asyncHandler(async (req, res) => {
  const { symptoms, resultSummary } = req.body;
  const userId = req.user ? req.user.id : null;

  const [result] = await pool.query(
    `INSERT INTO symptom_checks (user_id, symptoms, result_summary) VALUES (?, ?, ?)`,
    [userId, JSON.stringify(symptoms), resultSummary ? JSON.stringify(resultSummary) : null]
  );

  res.status(201).json({ success: true, data: { id: result.insertId } });
});

module.exports = { logSymptomCheck };
