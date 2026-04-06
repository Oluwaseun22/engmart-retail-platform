// src/routes/products.js
const express = require('express');
const { body } = require('express-validator');
const { getAll, getOne, create, update, remove } = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required.'),
  body('sku').trim().notEmpty().withMessage('SKU is required.'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be a positive number.'),
  body('category_id').isInt({ min: 1 }).withMessage('Valid category is required.'),
];

router.get('/',    authenticate, getAll);
router.get('/:id', authenticate, getOne);
router.post('/',   authenticate, requireAdmin, productValidation, create);
router.put('/:id', authenticate, requireAdmin, productValidation, update);
router.delete('/:id', authenticate, requireAdmin, remove);

module.exports = router;
