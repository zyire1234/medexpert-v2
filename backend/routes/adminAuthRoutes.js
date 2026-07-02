// routes/adminAuthRoutes.js
const express = require('express');
const router = express.Router();

const { login, me, changePassword } = require('../controllers/adminAuthController');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiters');
const { adminLoginValidator, adminChangePasswordValidator } = require('../utils/validators');

router.post('/login', authLimiter, adminLoginValidator, validate, login);
router.get('/me', requireAdmin, me);
router.post('/change-password', requireAdmin, adminChangePasswordValidator, validate, changePassword);

module.exports = router;
