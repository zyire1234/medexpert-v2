// routes/adminSpecialistRoutes.js
const express = require('express');
const router = express.Router();

const {
  createSpecialist, updateSpecialist, deleteSpecialist,
} = require('../controllers/specialistController');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { specialistValidator, idParamValidator } = require('../utils/validators');

router.use(requireAdmin);

router.post('/', specialistValidator, validate, createSpecialist);
router.patch('/:id', idParamValidator, validate, updateSpecialist);
router.delete('/:id', idParamValidator, validate, deleteSpecialist);

module.exports = router;
