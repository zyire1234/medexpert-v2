// middleware/validate.js
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Place after an array of express-validator chains in a route definition.
// Collects any validation errors and forwards a single 400 ApiError.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new ApiError(400, 'Validation failed.', details));
  }
  next();
}

module.exports = validate;
