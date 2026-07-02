// middleware/errorHandler.js
const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let { statusCode, message, details } = err;

  // mysql2 duplicate-entry errors
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'A record with these details already exists.';
  }

  // mysql2 FK constraint errors
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 409;
    message = 'This operation violates a database relationship constraint.';
  }

  if (!statusCode) statusCode = 500;
  if (!message) message = 'Internal server error.';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}

module.exports = { notFoundHandler, errorHandler };
