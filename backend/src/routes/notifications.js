const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { authenticate } = require('../middleware/auth');

// All notification routes require authentication
router.use(authenticate);

router.get('/', notificationsController.getNotifications);
router.put('/:id/read', notificationsController.markAsRead);

module.exports = router;
