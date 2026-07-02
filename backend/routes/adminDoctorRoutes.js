// routes/adminDoctorRoutes.js
const express = require('express');
const router = express.Router();

const {
  createDoctor, updateDoctor, deleteDoctor,
} = require('../controllers/doctorController');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { doctorValidator, idParamValidator } = require('../utils/validators');

router.use(requireAdmin);

router.post('/', doctorValidator, validate, createDoctor);
router.patch('/:id', idParamValidator, validate, updateDoctor);
router.delete('/:id', idParamValidator, validate, deleteDoctor);

module.exports = router;
