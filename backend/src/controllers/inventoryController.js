// src/controllers/inventoryController.js
const { pool } = require('../config/db');

// GET /api/inventory  — all inventory with product info
async function getAll(req, res) {
  try {
    const { low_stock } = req.query;
    let query = `
      SELECT i.*, p.name AS product_name, p.sku, c.name AS category_name
      FROM inventory i
      JOIN products   p ON i.product_id   = p.product_id
      JOIN categories c ON p.category_id  = c.category_id
      WHERE p.is_active = TRUE`;

    if (low_stock === 'true') {
      query += ' AND i.quantity <= i.reorder_level';
    }

    query += ' ORDER BY i.quantity ASC';

    const [rows] = await pool.query(query);

    // Tag each row with a stock status
    const inventory = rows.map(row => ({
      ...row,
      status: row.quantity === 0
        ? 'out_of_stock'
        : row.quantity <= row.reorder_level
          ? row.quantity <= Math.floor(row.reorder_level / 2)
            ? 'critical'
            : 'low'
          : 'ok',
    }));

    return res.json({ success: true, inventory });
  } catch (err) {
    console.error('inventory getAll error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// GET /api/inventory/:product_id
async function getOne(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, p.name AS product_name, p.sku
       FROM inventory i JOIN products p ON i.product_id = p.product_id
       WHERE i.product_id = ?`,
      [req.params.product_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inventory record not found.' });
    }
    return res.json({ success: true, inventory: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// PUT /api/inventory/:product_id/adjust
// Body: { quantity_change: number, reason: string }
// quantity_change can be positive (restock) or negative (manual reduction)
async function adjust(req, res) {
  const { quantity_change, reason, reorder_level } = req.body;
  const { product_id } = req.params;

  if (typeof quantity_change !== 'number') {
    return res.status(400).json({ success: false, message: 'quantity_change must be a number.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM inventory WHERE product_id = ?',
      [product_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inventory record not found.' });
    }

    const current = rows[0];
    const newQty = current.quantity + quantity_change;

    if (newQty < 0) {
      return res.status(400).json({ success: false, message: 'Cannot reduce stock below zero.' });
    }

    const updateFields = ['quantity = ?', 'updated_by = ?'];
    const updateValues = [newQty, req.user.user_id];

    if (reorder_level !== undefined) {
      updateFields.push('reorder_level = ?');
      updateValues.push(reorder_level);
    }

    updateValues.push(product_id);

    await pool.query(
      `UPDATE inventory SET ${updateFields.join(', ')} WHERE product_id = ?`,
      updateValues
    );

    return res.json({
      success: true,
      message: 'Stock adjusted successfully.',
      previous_quantity: current.quantity,
      new_quantity: newQty,
    });
  } catch (err) {
    console.error('inventory adjust error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// GET /api/inventory/alerts — items below reorder level
async function getLowStock(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, p.name AS product_name, p.sku, c.name AS category_name
       FROM inventory i
       JOIN products   p ON i.product_id  = p.product_id
       JOIN categories c ON p.category_id = c.category_id
       WHERE i.quantity <= i.reorder_level AND p.is_active = TRUE
       ORDER BY i.quantity ASC`
    );
    return res.json({ success: true, low_stock_count: rows.length, items: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getAll, getOne, adjust, getLowStock };
