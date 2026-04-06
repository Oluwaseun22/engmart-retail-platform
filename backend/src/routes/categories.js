// src/routes/categories.js
const express = require('express');
const { getAll, create, update, remove } = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/',    authenticate, getAll);
router.post('/',   authenticate, requireAdmin, create);
router.put('/:id', authenticate, requireAdmin, update);
router.delete('/:id', authenticate, requireAdmin, remove);

module.exports = router;
