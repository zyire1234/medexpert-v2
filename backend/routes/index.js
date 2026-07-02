// routes/index.js
const express = require('express');
const router = express.Router();

// ── Public ──
router.use('/auth', require('./authRoutes'));
router.use('/hospitals', require('./hospitalRoutes'));
router.use('/doctors', require('./doctorRoutes'));
router.use('/specialists', require('./specialistRoutes'));
router.use('/appointments', require('./appointmentRoutes'));
router.use('/contact', require('./contactRoutes'));
router.use('/symptom-checks', require('./symptomRoutes'));

// ── Admin ──
router.use('/admin/auth', require('./adminAuthRoutes'));
router.use('/admin/admins', require('./adminManagementRoutes'));
router.use('/admin/users', require('./userManagementRoutes'));
router.use('/admin/hospitals', require('./adminHospitalRoutes'));
router.use('/admin/doctors', require('./adminDoctorRoutes'));
router.use('/admin/specialists', require('./adminSpecialistRoutes'));
router.use('/admin/appointments', require('./adminAppointmentRoutes'));
router.use('/admin/contact-messages', require('./adminContactRoutes'));
router.use('/admin/dashboard', require('./dashboardRoutes'));

module.exports = router;
