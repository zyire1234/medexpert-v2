// routes/contactRoutes.js
const express = require('express');
const router = express.Router();

const { submitContactMessage } = require('../controllers/contactController');
const validate = require('../middleware/validate');
const { contactValidator } = require('../utils/validators');

router.post('/', contactValidator, validate, submitContactMessage);

module.exports = router;
