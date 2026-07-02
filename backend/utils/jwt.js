// utils/jwt.js
const jwt = require('jsonwebtoken');

const USER_SECRET = process.env.JWT_SECRET;
const USER_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const ADMIN_SECRET = process.env.JWT_ADMIN_SECRET;
const ADMIN_EXPIRES_IN = process.env.JWT_ADMIN_EXPIRES_IN || '1d';

function signUserToken(payload) {
  return jwt.sign(payload, USER_SECRET, { expiresIn: USER_EXPIRES_IN });
}

function verifyUserToken(token) {
  return jwt.verify(token, USER_SECRET);
}

function signAdminToken(payload) {
  return jwt.sign(payload, ADMIN_SECRET, { expiresIn: ADMIN_EXPIRES_IN });
}

function verifyAdminToken(token) {
  return jwt.verify(token, ADMIN_SECRET);
}

module.exports = {
  signUserToken,
  verifyUserToken,
  signAdminToken,
  verifyAdminToken,
};
