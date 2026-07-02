// routes/adminAppointmentRoutes.js
const express = require('express');
const router = express.Router();

const {
  listAppointments, updateAppointmentStatus, deleteAppointment,
} = require('../controllers/appointmentController');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { appointmentStatusValidator, idParamValidator, paginationValidator } = require('../utils/validators');

router.use(requireAdmin);

router.get('/', paginationValidator, validate, listAppointments);
router.patch('/:id', appointmentStatusValidator, validate, updateAppointmentStatus);
router.delete('/:id', idParamValidator, validate, deleteAppointment);

module.exports = router;
