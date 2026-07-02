// routes/userManagementRoutes.js
const express = require('express');
const router = express.Router();

const {
  listUsers, getUser, updateUser, deleteUser,
} = require('../controllers/userManagementController');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { idParamValidator, paginationValidator } = require('../utils/validators');

router.use(requireAdmin);

router.get('/', paginationValidator, validate, listUsers);
router.get('/:id', idParamValidator, validate, getUser);
router.patch('/:id', idParamValidator, validate, updateUser);
router.delete('/:id', idParamValidator, validate, deleteUser);

module.exports = router;
