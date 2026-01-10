const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all unread notifications for current user
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC',
      [userId]
    );
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read for current user
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * Utility function to create a notification (internal use)
 */
const createNotification = async (userId, eventId, message) => {
  try {
    const id = uuidv4();
    await db.query(
      'INSERT INTO notifications (id, user_id, event_id, message) VALUES (?, ?, ?, ?)',
      [id, userId, eventId, message]
    );
    return id;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
};
