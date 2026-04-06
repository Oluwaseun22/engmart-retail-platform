// src/server.js
require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const { testConnection } = require('./config/db');

// Routes
const authRoutes       = require('./routes/auth');
const productRoutes    = require('./routes/products');
const inventoryRoutes  = require('./routes/inventory');
const salesRoutes      = require('./routes/sales');
const reportsRoutes    = require('./routes/reports');
const categoryRoutes   = require('./routes/categories');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
// AUDIT FIX [6.10]: Use 'combined' format in production to avoid
// verbose dev logs that expose timing and header info.
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── API Routes ──────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/inventory',  inventoryRoutes);
app.use('/api/sales',      salesRoutes);
app.use('/api/reports',    reportsRoutes);
app.use('/api/categories', categoryRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'ENGMart API', timestamp: new Date() }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start ───────────────────────────────────────────────
async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 ENGMart API running at http://localhost:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start();

module.exports = app; // exported for testing
