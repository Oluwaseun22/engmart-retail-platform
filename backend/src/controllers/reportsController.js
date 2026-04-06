// src/controllers/reportsController.js
const { pool } = require('../config/db');

// GET /api/reports/dashboard  — KPI summary for dashboard
async function dashboard(req, res) {
  try {
    // Today's revenue
    const [[{ today_revenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS today_revenue
       FROM sales WHERE DATE(created_at) = CURDATE() AND status = 'completed'`
    );

    // Today's transaction count
    const [[{ today_sales }]] = await pool.query(
      `SELECT COUNT(*) AS today_sales
       FROM sales WHERE DATE(created_at) = CURDATE() AND status = 'completed'`
    );

    // Total products
    const [[{ total_products }]] = await pool.query(
      `SELECT COUNT(*) AS total_products FROM products WHERE is_active = TRUE`
    );

    // Low stock count
    const [[{ low_stock_count }]] = await pool.query(
      `SELECT COUNT(*) AS low_stock_count
       FROM inventory i JOIN products p ON i.product_id = p.product_id
       WHERE i.quantity <= i.reorder_level AND p.is_active = TRUE`
    );

    // Weekly sales (last 7 days)
    const [weekly] = await pool.query(
      `SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue, COUNT(*) AS transactions
       FROM sales
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
         AND status = 'completed'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    // Monthly revenue (last 12 months)
    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
              SUM(total_amount) AS revenue,
              COUNT(*) AS transactions
       FROM sales
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
         AND status = 'completed'
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`
    );

    // Top 5 products by revenue
    const [top_products] = await pool.query(
      `SELECT p.name, p.sku, SUM(si.subtotal) AS revenue, SUM(si.quantity) AS units_sold
       FROM sale_items si
       JOIN products p ON si.product_id = p.product_id
       JOIN sales s    ON si.sale_id    = s.sale_id
       WHERE s.status = 'completed'
         AND s.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY p.product_id
       ORDER BY revenue DESC
       LIMIT 5`
    );

    // Revenue by category
    const [by_category] = await pool.query(
      `SELECT c.name AS category, SUM(si.subtotal) AS revenue
       FROM sale_items si
       JOIN products   p ON si.product_id   = p.product_id
       JOIN categories c ON p.category_id   = c.category_id
       JOIN sales      s ON si.sale_id      = s.sale_id
       WHERE s.status = 'completed'
         AND s.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY c.category_id
       ORDER BY revenue DESC`
    );

    return res.json({
      success: true,
      kpis: {
        today_revenue:   parseFloat(today_revenue),
        today_sales:     parseInt(today_sales),
        total_products:  parseInt(total_products),
        low_stock_count: parseInt(low_stock_count),
      },
      weekly,
      monthly,
      top_products,
      by_category,
    });
  } catch (err) {
    console.error('dashboard report error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// GET /api/reports/sales?period=daily|weekly|monthly
async function salesReport(req, res) {
  const { period = 'monthly', start_date, end_date } = req.query;

  let groupBy, dateFormat;
  if (period === 'daily')   { groupBy = 'DATE(created_at)';           dateFormat = '%d %b %Y'; }
  if (period === 'weekly')  { groupBy = 'YEARWEEK(created_at, 1)';    dateFormat = '%d %b %Y'; }
  if (period === 'monthly') { groupBy = 'DATE_FORMAT(created_at, \'%Y-%m\')'; dateFormat = '%b %Y'; }

  try {
    let conditions = ["status = 'completed'"];
    let params = [];
    if (start_date) { conditions.push('DATE(created_at) >= ?'); params.push(start_date); }
    if (end_date)   { conditions.push('DATE(created_at) <= ?'); params.push(end_date); }

    const where = 'WHERE ' + conditions.join(' AND ');

    const [rows] = await pool.query(
      `SELECT
         ${groupBy}           AS period_key,
         MIN(created_at)      AS period_start,
         SUM(total_amount)    AS revenue,
         COUNT(*)             AS transactions,
         AVG(total_amount)    AS avg_sale_value
       FROM sales
       ${where}
       GROUP BY period_key
       ORDER BY period_start ASC`,
      params
    );

    return res.json({ success: true, period, report: rows });
  } catch (err) {
    console.error('salesReport error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { dashboard, salesReport };
