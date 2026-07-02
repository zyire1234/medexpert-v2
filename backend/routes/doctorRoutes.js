// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();

const { listDoctors, getDoctor } = require('../controllers/doctorController');
const validate = require('../middleware/validate');
const { idParamValidator } = require('../utils/validators');

router.get('/', listDoctors);
router.get('/:id', idParamValidator, validate, getDoctor);

module.exports = router;
