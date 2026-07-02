// routes/adminHospitalRoutes.js
const express = require('express');
const router = express.Router();

const {
  createHospital, updateHospital, deleteHospital,
} = require('../controllers/hospitalController');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { hospitalValidator, idParamValidator } = require('../utils/validators');

router.use(requireAdmin);

router.post('/', hospitalValidator, validate, createHospital);
router.patch('/:id', idParamValidator, validate, updateHospital);
router.delete('/:id', idParamValidator, validate, deleteHospital);

module.exports = router;
