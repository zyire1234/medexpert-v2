// utils/validators.js
const { body, param, query } = require('express-validator');

const registerValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.').isLength({ max: 150 }),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

const adminLoginValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

const adminChangePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
];

const createAdminValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.'),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('role').optional().isIn(['admin', 'super_admin']),
];

const appointmentValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.').isLength({ max: 150 }),
  body('phone').trim().notEmpty().withMessage('Phone number is required.').isLength({ max: 30 }),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Email must be valid.'),
  body('hospitalId').optional({ checkFalsy: true }).isInt().withMessage('hospitalId must be an integer.'),
  body('specialistId').optional({ checkFalsy: true }).isInt().withMessage('specialistId must be an integer.'),
  body('preferredDate').isISO8601().withMessage('preferredDate must be a valid date (YYYY-MM-DD).'),
  body('preferredTimeSlot').isIn(['morning', 'afternoon', 'evening']).withMessage('Invalid time slot.'),
  body('notes').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
];

const appointmentStatusValidator = [
  param('id').isInt().withMessage('Invalid appointment id.'),
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid status.'),
];

const contactValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.').isLength({ max: 150 }),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body('subject').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Message is required.').isLength({ max: 5000 }),
];

const hospitalValidator = [
  body('name').trim().notEmpty().withMessage('Hospital name is required.'),
  body('state').trim().notEmpty().withMessage('State is required.'),
  body('email').optional({ checkFalsy: true }).trim().isEmail(),
];

const doctorValidator = [
  body('fullName').trim().notEmpty().withMessage('Doctor full name is required.'),
  body('email').optional({ checkFalsy: true }).trim().isEmail(),
  body('yearsExperience').optional({ checkFalsy: true }).isInt({ min: 0 }),
];

const specialistValidator = [
  body('slug').trim().notEmpty().withMessage('Slug is required.'),
  body('name').trim().notEmpty().withMessage('Name is required.'),
];

const idParamValidator = [param('id').isInt().withMessage('Invalid id.')];

const paginationValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  registerValidator,
  loginValidator,
  adminLoginValidator,
  adminChangePasswordValidator,
  createAdminValidator,
  appointmentValidator,
  appointmentStatusValidator,
  contactValidator,
  hospitalValidator,
  doctorValidator,
  specialistValidator,
  idParamValidator,
  paginationValidator,
};
