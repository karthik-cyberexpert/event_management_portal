const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and 'admin' role
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @route GET /api/admin/database-export
 * @desc Get database export as SQL file
 * @access Admin
 */
router.get('/database-export', adminController.exportDatabase);

module.exports = router;
