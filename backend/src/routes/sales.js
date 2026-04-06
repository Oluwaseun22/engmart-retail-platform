// src/routes/sales.js
const express = require('express');
const { body } = require('express-validator');
const { create, getAll, getOne } = require('../controllers/salesController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, [
  body('items').isArray({ min: 1 }).withMessage('Items array required.'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('Valid product_id required.'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  body('payment_method').optional().isIn(['cash', 'card', 'bank_transfer']),
], create);

router.get('/',    authenticate, getAll);
router.get('/:id', authenticate, getOne);

module.exports = router;
