const express = require('express');
const NotificationController = require('../controllers/NotificationController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Routes
router.use(authenticateToken);

router.get('/', NotificationController.getUserNotifications);
router.put('/:id/read', NotificationController.markAsRead);
router.put('/mark-all-read', NotificationController.markAllAsRead);
router.get('/unread-count', NotificationController.getUnreadCount);
router.delete('/:id', NotificationController.deleteNotification);

module.exports = router;