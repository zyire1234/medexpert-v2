// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();

const { getStats } = require('../controllers/dashboardController');
const { requireAdmin } = require('../middleware/auth');

router.get('/stats', requireAdmin, getStats);

module.exports = router;
