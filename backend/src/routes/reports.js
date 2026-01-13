const express = require('express');
const router = express.Router();
const { getReport, upsertReport } = require('../controllers/reportsController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/reports/:eventId
 * @desc    Get report for an event
 * @access  Private
 */
router.get('/:eventId', getReport);

/**
 * @route   POST /api/reports/:eventId
 * @desc    Create or update report for an event
 * @access  Private (Coordinator or Admin)
 */
router.post('/:eventId', authorize('coordinator', 'admin'), upsertReport);

module.exports = router;
