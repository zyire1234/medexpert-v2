// routes/specialistRoutes.js
const express = require('express');
const router = express.Router();

const { listSpecialists, getSpecialist } = require('../controllers/specialistController');
const validate = require('../middleware/validate');
const { idParamValidator } = require('../utils/validators');

router.get('/', listSpecialists);
router.get('/:id', idParamValidator, validate, getSpecialist);

module.exports = router;
