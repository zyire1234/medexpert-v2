// routes/adminContactRoutes.js
const express = require('express');
const router = express.Router();

const {
  listContactMessages, updateContactMessage, deleteContactMessage,
} = require('../controllers/contactController');
const { requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { idParamValidator, paginationValidator } = require('../utils/validators');

router.use(requireAdmin);

router.get('/', paginationValidator, validate, listContactMessages);
router.patch('/:id', idParamValidator, validate, updateContactMessage);
router.delete('/:id', idParamValidator, validate, deleteContactMessage);

module.exports = router;
