// controllers/dashboardController.js
const pool = require('../db/pool');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/dashboard/stats  (admin — powers the dashboard cards)
const getStats = asyncHandler(async (req, res) => {
  const [[hospitalCount]] = await pool.query('SELECT COUNT(*) AS count FROM hospitals WHERE is_active = 1');
  const [[specialistCount]] = await pool.query('SELECT COUNT(*) AS count FROM specialists');
  const [[appointmentCount]] = await pool.query('SELECT COUNT(*) AS count FROM appointments');
  const [[symptomCheckCount]] = await pool.query('SELECT COUNT(*) AS count FROM symptom_checks');
  const [[userCount]] = await pool.query('SELECT COUNT(*) AS count FROM users');
  const [[pendingAppointments]] = await pool.query(
    "SELECT COUNT(*) AS count FROM appointments WHERE status = 'pending'"
  );

  res.json({
    success: true,
    data: {
      totalHospitals: hospitalCount.count,
      totalSpecialists: specialistCount.count,
      totalAppointments: appointmentCount.count,
      totalSymptomChecks: symptomCheckCount.count,
      totalUsers: userCount.count,
      pendingAppointments: pendingAppointments.count,
    },
  });
});

module.exports = { getStats };
