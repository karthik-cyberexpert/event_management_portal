const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getEventHistory,
  checkAvailability,
  getEventByCode
} = require('../controllers/eventsController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/events
 * @desc    Get all events (with filters)
 * @access  Private
 */
router.get('/', getEvents);

router.get('/:id', getEventById);

/**
 * @route   POST /api/events
 * @desc    Create new event
 * @access  Private (Coordinator)
 */
router.post('/', authorize('coordinator', 'admin'), createEvent);

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Private (Event creator or admin)
 */
router.put('/:id', updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event
 * @access  Private (Event creator or admin)
 */
router.delete('/:id', deleteEvent);

/**
 * @route   POST /api/events/check-availability
 * @desc    Check venue availability
 * @access  Private
 */
router.post('/check-availability', checkAvailability);

/**
 * @access  Private (HOD/Dean/Principal/Coordinator)
 */
router.put('/:id/status', authorize('hod', 'dean', 'principal', 'admin', 'coordinator'), updateEventStatus);

/**
 * @route   GET /api/events/:id/history
 * @desc    Get event history
 * @access  Private
 */
router.get('/:id/history', getEventHistory);

/**
 * @route   GET /api/events/code/:code
 * @desc    Get event by unique code
 * @access  Private
 */
router.get('/code/:code', getEventByCode);

module.exports = router;
