// src/routes/reports.js
const express = require('express');
const { dashboard, salesReport } = require('../controllers/reportsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', authenticate, dashboard);
router.get('/sales',     authenticate, requireAdmin, salesReport);

module.exports = router;
