// routes/adminManagementRoutes.js
const express = require('express');
const router = express.Router();

const {
  listAdmins, createAdmin, updateAdmin, deleteAdmin,
} = require('../controllers/adminManagementController');
const { requireAdmin, requireSuperAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createAdminValidator, idParamValidator } = require('../utils/validators');

router.use(requireAdmin);

router.get('/', listAdmins);
router.post('/', requireSuperAdmin, createAdminValidator, validate, createAdmin);
router.patch('/:id', requireSuperAdmin, idParamValidator, validate, updateAdmin);
router.delete('/:id', requireSuperAdmin, idParamValidator, validate, deleteAdmin);

module.exports = router;
