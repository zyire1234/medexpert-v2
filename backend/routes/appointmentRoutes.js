// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();

const { createAppointment, myAppointments } = require('../controllers/appointmentController');
const { optionalUser, requireUser } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { appointmentValidator } = require('../utils/validators');

// Public — works for guests; attaches user if a valid token is supplied
router.post('/', optionalUser, appointmentValidator, validate, createAppointment);

// Requires login — a user's own appointment history
router.get('/mine', requireUser, myAppointments);

module.exports = router;
