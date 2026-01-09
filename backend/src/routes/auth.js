const express = require('express');
const router = express.Router();
const { login, signup, getMe, updatePassword, resetPassword, updateProfile, onboard } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/signup
 * @desc    Register new user
 * @access  Public
 */
router.post('/signup', signup);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route   POST /api/auth/update-password
 * @desc    Update user password
 * @access  Private
 */
router.post('/onboard', authenticate, onboard);
router.post('/update-password', authenticate, updatePassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/reset-password', resetPassword);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', authenticate, updateProfile);

module.exports = router;
