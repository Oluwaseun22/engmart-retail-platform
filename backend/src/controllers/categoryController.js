// src/controllers/categoryController.js
const { pool } = require('../config/db');

async function getAll(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE is_active = TRUE ORDER BY name ASC'
    );
    return res.json({ success: true, categories: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

async function create(req, res) {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Name is required.' });
  try {
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    return res.status(201).json({ success: true, category_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Category name already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

async function update(req, res) {
  const { name, description } = req.body;
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'UPDATE categories SET name=?, description=? WHERE category_id=?',
      [name, description || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Category not found.' });
    return res.json({ success: true, message: 'Category updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

async function remove(req, res) {
  try {
    await pool.query('UPDATE categories SET is_active = FALSE WHERE category_id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Category deactivated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getAll, create, update, remove };
