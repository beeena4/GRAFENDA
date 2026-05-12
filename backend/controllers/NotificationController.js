const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/helpers');

class NotificationController {
  // Get user notifications
  static async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const unreadOnly = req.query.unread_only === 'true';

      const result = await Notification.findByUserId(userId, page, limit, unreadOnly);

      const response = {
        notifications: result.notifications,
        pagination: result.pagination
      };

      sendSuccess(res, 'Notifications retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Mark notification as read
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await Notification.markAsRead(id, userId);

      sendSuccess(res, 'Notification marked as read');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      await Notification.markAllAsRead(userId);

      sendSuccess(res, 'All notifications marked as read');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get unread count
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      const unreadCount = await Notification.getUnreadCount(userId);

      sendSuccess(res, 'Unread count retrieved successfully', { unread_count: unreadCount });
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Delete notification
  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await Notification.delete(id, userId);

      sendSuccess(res, 'Notification deleted successfully');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }
}

module.exports = NotificationController;