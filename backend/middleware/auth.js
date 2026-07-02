// middleware/auth.js
const { verifyUserToken, verifyAdminToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

// Requires a valid USER JWT. Populates req.user = { id, email }.
function requireUser(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return next(new ApiError(401, 'Authentication required.'));
  try {
    const decoded = verifyUserToken(token);
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token.'));
  }
}

// Requires a valid ADMIN JWT. Populates req.admin = { id, email, role }.
function requireAdmin(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return next(new ApiError(401, 'Admin authentication required.'));
  try {
    const decoded = verifyAdminToken(token);
    req.admin = { id: decoded.sub, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired admin token.'));
  }
}

// Optionally attaches req.user if a valid token is present, but never fails
// the request if it's missing/invalid. Useful for endpoints like booking an
// appointment that work for guests AND logged-in users.
function optionalUser(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return next();
  try {
    const decoded = verifyUserToken(token);
    req.user = { id: decoded.sub, email: decoded.email };
  } catch (err) {
    // ignore invalid token for optional auth
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (!req.admin || req.admin.role !== 'super_admin') {
    return next(new ApiError(403, 'Super admin privileges required.'));
  }
  next();
}

module.exports = {
  requireUser,
  requireAdmin,
  optionalUser,
  requireSuperAdmin,
};
