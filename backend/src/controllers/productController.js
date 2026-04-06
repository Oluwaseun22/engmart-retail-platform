// src/controllers/productController.js
const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

// GET /api/products
async function getAll(req, res) {
  try {
    const { search, category_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let conditions = ['p.is_active = TRUE'];
    let params = [];

    if (search) {
      conditions.push('(p.name LIKE ? OR p.sku LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category_id) {
      conditions.push('p.category_id = ?');
      params.push(category_id);
    }

    const where = conditions.join(' AND ');

    const [products] = await pool.query(
      `SELECT p.*, c.name AS category_name, i.quantity, i.reorder_level
       FROM products p
       JOIN categories c  ON p.category_id = c.category_id
       LEFT JOIN inventory i ON p.product_id = i.product_id
       WHERE ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p WHERE ${where}`,
      params
    );

    return res.json({ success: true, products, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('getAll products error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// GET /api/products/:id
async function getOne(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, i.quantity, i.reorder_level
       FROM products p
       JOIN categories c  ON p.category_id = c.category_id
       LEFT JOIN inventory i ON p.product_id = i.product_id
       WHERE p.product_id = ? AND p.is_active = TRUE`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.json({ success: true, product: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// POST /api/products
async function create(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, sku, description, price, category_id } = req.body;

  try {
    const [existing] = await pool.query('SELECT product_id FROM products WHERE sku = ?', [sku]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'SKU already exists.' });
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, sku, description, price, category_id) VALUES (?, ?, ?, ?, ?)',
      [name, sku, description || null, price, category_id]
    );

    // Auto-create inventory record
    await pool.query(
      'INSERT INTO inventory (product_id, quantity, reorder_level) VALUES (?, 0, 10)',
      [result.insertId]
    );

    return res.status(201).json({ success: true, message: 'Product created.', product_id: result.insertId });
  } catch (err) {
    console.error('create product error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// PUT /api/products/:id
async function update(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, sku, description, price, category_id } = req.body;
  const { id } = req.params;

  try {
    // Ensure SKU is still unique (excluding current product)
    const [skuCheck] = await pool.query(
      'SELECT product_id FROM products WHERE sku = ? AND product_id != ?',
      [sku, id]
    );
    if (skuCheck.length > 0) {
      return res.status(409).json({ success: false, message: 'SKU already in use by another product.' });
    }

    const [result] = await pool.query(
      'UPDATE products SET name=?, sku=?, description=?, price=?, category_id=? WHERE product_id=? AND is_active=TRUE',
      [name, sku, description || null, price, category_id, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.json({ success: true, message: 'Product updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// DELETE /api/products/:id  (soft delete)
async function remove(req, res) {
  try {
    const [result] = await pool.query(
      'UPDATE products SET is_active = FALSE WHERE product_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    return res.json({ success: true, message: 'Product deactivated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getAll, getOne, create, update, remove };
