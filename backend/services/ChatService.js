const Chat = require('../models/Chat');
const NotificationService = require('./NotificationService');

class ChatService {
  static io = null;

  static setSocketIO(io) {
    this.io = io;
  }

  static async sendMessage(chatData) {
    const { order_id, sender_id, receiver_id, message, message_type = 'text', file_url = null } = chatData;

    // DEBUG: terima data dari controller
    console.log('[chat/sendMessage] chatData =', chatData);

    // Create chat message in database
    const chatId = await Chat.create({
      order_id,
      sender_id,
      receiver_id,
      message,
      message_type,
      file_url
    });

    // Get chat message with sender info
    const chatMessage = await this.getMessageById(chatId);

    // Send real-time message via socket
    if (this.io) {
      this.io.to(`order_${order_id}`).emit('new_message', chatMessage);
    }

    // Send notification to receiver, but don't fail the request if notification fails
    try {
      const { query } = require('../config/database');
      const orderResult = await query('SELECT title FROM orders WHERE id = ?', [order_id]);
      const senderResult = await query('SELECT full_name FROM users WHERE id = ?', [sender_id]);

      if (orderResult.length > 0 && senderResult.length > 0) {
        await NotificationService.notifyNewMessage(
          chatId,
          receiver_id,
          senderResult[0].full_name,
          orderResult[0].title
        );
      }
    } catch (notificationError) {
      console.error('Notification failed for chat message:', notificationError);
    }

    return chatMessage;
  }

  static async getMessageById(chatId) {
    const { query } = require('../config/database');
    const sql = `
      SELECT c.*, 
             s.full_name as sender_name, s.avatar as sender_avatar,
             r.full_name as receiver_name, r.avatar as receiver_avatar
      FROM chats c
      JOIN users s ON c.sender_id = s.id
      JOIN users r ON c.receiver_id = r.id
      WHERE c.id = ?
    `;
    const messages = await query(sql, [chatId]);
    return messages[0];
  }

  static async getOrderMessages(orderId, userId, page = 1, limit = 50) {
    // DEBUG: lihat output file_url/message_type yang dipakai frontend

    const messages = await Chat.findByOrderId(orderId, page, limit);

    try {
      console.log('[chat/getOrderMessages] last messages =', messages.slice(-5).map(m => ({
        id: m.id,
        message_type: m.message_type,
        file_url: m.file_url,
        file_name: m.file_name,
        message: m.message,
        created_at: m.created_at
      })));
    } catch (e) {
      console.log('[chat/getOrderMessages] log failed', e?.message);
    }


    // Mark messages as read for current user
    await Chat.markAsRead(orderId, userId);

    return messages;
  }

  static async getUserChats(userId) {
    return await Chat.getChatOrders(userId);
  }

  static async getChatStats(userId) {
    return await Chat.getChatStats(userId);
  }

  // Socket event handlers
  static handleSocketConnection(socket) {
    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { order_id, sender_id, receiver_id, message, message_type, file_url } = data;

        const chatMessage = await this.sendMessage({
          order_id,
          sender_id,
          receiver_id,
          message,
          message_type,
          file_url
        });

        // Emit to sender (confirmation)
        socket.emit('message_sent', chatMessage);

      } catch (error) {
        socket.emit('message_error', { error: error.message });
      }
    });

    // Typing indicator
    socket.on('typing_start', (data) => {
      const { order_id, user_id, user_name } = data;
      socket.to(`order_${order_id}`).emit('user_typing', {
        user_id,
        user_name,
        is_typing: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { order_id, user_id } = data;
      socket.to(`order_${order_id}`).emit('user_typing', {
        user_id,
        is_typing: false
      });
    });

    // Mark messages as read
    socket.on('mark_read', async (data) => {
      const { order_id, user_id } = data;
      await Chat.markAsRead(order_id, user_id);
      
      // Notify other participants
      socket.to(`order_${order_id}`).emit('messages_read', {
        order_id,
        user_id
      });
    });
  }
}

module.exports = ChatService;