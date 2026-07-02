// routes/symptomRoutes.js
const express = require('express');
const router = express.Router();

const { logSymptomCheck } = require('../controllers/symptomController');
const { optionalUser } = require('../middleware/auth');

router.post('/', optionalUser, logSymptomCheck);

module.exports = router;
