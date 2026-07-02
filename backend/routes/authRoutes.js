// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const { register, login, me } = require('../controllers/authController');
const { requireUser } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiters');
const { registerValidator, loginValidator } = require('../utils/validators');

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.get('/me', requireUser, me);

module.exports = router;
