// src/routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many accounts created from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerLimiter, [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters.'),
  body('email').isEmail().withMessage('Valid email required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
], register);

router.post('/login', loginLimiter, [
  body('email').isEmail().withMessage('Valid email required.'),
  body('password').notEmpty().withMessage('Password required.'),
], login);

router.get('/me', authenticate, getMe);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email required.'),
], forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
], resetPassword);

module.exports = router;
