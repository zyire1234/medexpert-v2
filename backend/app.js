// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiters');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Security & parsing middleware ──
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── CORS ──
// CORS_ORIGIN is a comma-separated list of allowed origins in .env.
// This lets the static index.html (served from any static host/dev server)
// call this API without modifying its markup beyond the fetch() calls.
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (no Origin header) and any configured origin.
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// ── Rate limiting on all /api routes ──
app.use('/api', apiLimiter);

// ── Health check ──
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'MedExpert API is running.' });
});

// ── API routes ──
app.use('/api', routes);

// ── 404 + error handling (must be last) ──
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
