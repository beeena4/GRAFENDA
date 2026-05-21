const { validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const ChatService = require('../services/ChatService');
const Order = require('../models/Order');
const { sendSuccess, sendError } = require('../utils/helpers');

class ChatController {
  // Send message
  static async sendMessage(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const { order_id, receiver_id, message, message_type = 'text', file_url = null } = req.body;
      const sender_id = req.user.id;

      // Check if order exists and user has access
      const order = await Order.findById(order_id);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      const hasAccess = order.buyer_id === sender_id || order.seller_user_id === sender_id;
      if (!hasAccess) {
        return sendError(res, 'Access denied', 403);
      }

      // Check if receiver is valid for this order
      const isValidReceiver = receiver_id === order.buyer_id || receiver_id === order.seller_user_id;
      if (!isValidReceiver) {
        return sendError(res, 'Invalid receiver', 400);
      }

      // DEBUG: lihat payload yang diterima
      console.log('[chat/send] req.body =', req.body);

      const chatMessage = await ChatService.sendMessage({
        order_id,
        sender_id,
        receiver_id,
        message,
        message_type,
        file_url
      });

      sendSuccess(res, 'Message sent successfully', chatMessage);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get order messages
  static async getOrderMessages(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      // Check if order exists and user has access
      const order = await Order.findById(orderId);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      const hasAccess = order.buyer_id === userId || order.seller_user_id === userId;
      if (!hasAccess) {
        return sendError(res, 'Access denied', 403);
      }

      const messages = await ChatService.getOrderMessages(orderId, userId, page, limit);

      sendSuccess(res, 'Messages retrieved successfully', messages);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get user chats
  static async getUserChats(req, res) {
    try {
      const userId = req.user.id;

      const chats = await ChatService.getUserChats(userId);

      sendSuccess(res, 'Chats retrieved successfully', chats);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get chat statistics
  static async getChatStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await ChatService.getChatStats(userId);

      sendSuccess(res, 'Chat statistics retrieved successfully', stats);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Mark messages as read
  static async markAsRead(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      // Check if order exists and user has access
      const order = await Order.findById(orderId);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      const hasAccess = order.buyer_id === userId || order.seller_user_id === userId;
      if (!hasAccess) {
        return sendError(res, 'Access denied', 403);
      }

      await Chat.markAsRead(orderId, userId);

      sendSuccess(res, 'Messages marked as read');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }
}

module.exports = ChatController;