// src/routes/inventory.js
const express = require('express');
const { getAll, getOne, adjust, getLowStock } = require('../controllers/inventoryController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/',                    authenticate, getAll);
router.get('/alerts',              authenticate, getLowStock);
router.get('/:product_id',         authenticate, getOne);
// AUDIT FIX [role-access]: Stock adjustment is admin-only. Staff can read
// inventory but cannot manipulate quantities directly.
router.put('/:product_id/adjust',  authenticate, requireAdmin, adjust);

module.exports = router;
