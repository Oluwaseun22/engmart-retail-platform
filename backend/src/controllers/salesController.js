// src/controllers/salesController.js
const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

// POST /api/sales  — create a new sale
async function create(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { items, payment_method, notes } = req.body;
  // items: [{ product_id, quantity, discount? }]

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Sale must contain at least one item.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let total_amount = 0;
    const enrichedItems = [];

    // Validate each item and lock inventory rows
    for (const item of items) {
      const [productRows] = await conn.query(
        'SELECT p.product_id, p.price, i.quantity FROM products p JOIN inventory i ON p.product_id = i.product_id WHERE p.product_id = ? AND p.is_active = TRUE FOR UPDATE',
        [item.product_id]
      );

      if (productRows.length === 0) {
        throw new Error(`Product ${item.product_id} not found.`);
      }

      const product = productRows[0];
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}. Available: ${product.quantity}.`);
      }

      const unit_price = product.price;
      const discount   = item.discount || 0;
      const subtotal   = parseFloat(((unit_price * item.quantity) - discount).toFixed(2));
      total_amount    += subtotal;
      enrichedItems.push({ product_id: item.product_id, quantity: item.quantity, unit_price, discount, subtotal });
    }

    total_amount = parseFloat(total_amount.toFixed(2));

    // Insert sale header
    const [saleResult] = await conn.query(
      'INSERT INTO sales (user_id, total_amount, payment_method, notes) VALUES (?, ?, ?, ?)',
      [req.user.user_id, total_amount, payment_method || 'cash', notes || null]
    );
    const sale_id = saleResult.insertId;

    // Insert line items & decrement inventory
    for (const item of enrichedItems) {
      await conn.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal, discount) VALUES (?, ?, ?, ?, ?, ?)',
        [sale_id, item.product_id, item.quantity, item.unit_price, item.subtotal, item.discount]
      );

      await conn.query(
        'UPDATE inventory SET quantity = quantity - ?, updated_by = ? WHERE product_id = ?',
        [item.quantity, req.user.user_id, item.product_id]
      );
    }

    await conn.commit();

    return res.status(201).json({
      success:      true,
      message:      'Sale completed successfully.',
      sale_id,
      total_amount,
      items_count:  enrichedItems.length,
    });
  } catch (err) {
    await conn.rollback();
    console.error('create sale error:', err.message);
    return res.status(400).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
}

// GET /api/sales  — paginated sales list
async function getAll(req, res) {
  try {
    const { page = 1, limit = 20, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let conditions = [];
    let params = [];

    // Staff only see their own sales
    if (req.user.role !== 'admin') {
      conditions.push('s.user_id = ?');
      params.push(req.user.user_id);
    }
    if (start_date) { conditions.push('DATE(s.created_at) >= ?'); params.push(start_date); }
    if (end_date)   { conditions.push('DATE(s.created_at) <= ?'); params.push(end_date); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const [sales] = await pool.query(
      `SELECT s.*, u.username, u.email,
              COUNT(si.sale_item_id) AS items_count
       FROM sales s
       JOIN users u     ON s.user_id = u.user_id
       LEFT JOIN sale_items si ON s.sale_id = si.sale_id
       ${where}
       GROUP BY s.sale_id
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM sales s ${where}`,
      params
    );

    return res.json({ success: true, sales, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('getAll sales error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// GET /api/sales/:id  — single sale with items
async function getOne(req, res) {
  try {
    const [sales] = await pool.query(
      `SELECT s.*, u.username FROM sales s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.sale_id = ?`,
      [req.params.id]
    );
    if (sales.length === 0) {
      return res.status(404).json({ success: false, message: 'Sale not found.' });
    }

    const sale = sales[0];

    // Check permission — staff can only see their own
    if (req.user.role !== 'admin' && sale.user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const [items] = await pool.query(
      `SELECT si.*, p.name AS product_name, p.sku
       FROM sale_items si
       JOIN products p ON si.product_id = p.product_id
       WHERE si.sale_id = ?`,
      [req.params.id]
    );

    return res.json({ success: true, sale: { ...sale, items } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { create, getAll, getOne };
