// routes/hospitalRoutes.js
const express = require('express');
const router = express.Router();

const { listHospitals, getHospital } = require('../controllers/hospitalController');
const validate = require('../middleware/validate');
const { idParamValidator } = require('../utils/validators');

router.get('/', listHospitals);
router.get('/:id', idParamValidator, validate, getHospital);

module.exports = router;
