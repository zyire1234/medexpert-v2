// middleware/rateLimiters.js
const rateLimit = require('express-rate-limit');

// Generic API limiter — generous, just guards against abuse.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// Stricter limiter for login/register endpoints to slow down brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

module.exports = { apiLimiter, authLimiter };
