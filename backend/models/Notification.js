const { query } = require('../config/database');

class Notification {
  static async create(notificationData) {
    const { user_id, title, message, type = 'system', related_id = null } = notificationData;
    
    const sql = `INSERT INTO notifications (user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?)`;
    const result = await query(sql, [user_id, title, message, type, related_id]);
    
    return result.insertId;
  }

  static async findByUserId(userId, page = 1, limit = 20, unreadOnly = false) {
    const offset = (page - 1) * limit;
    
    let sql = `SELECT * FROM notifications WHERE user_id = ?`;
    const params = [userId];
    
    if (unreadOnly) {
      sql += ` AND is_read = false`;
    }
    
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const notifications = await query(sql, params);
    
    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM notifications WHERE user_id = ?`;
    const countParams = [userId];
    
    if (unreadOnly) {
      countSql += ` AND is_read = false`;
    }
    
    const countResult = await query(countSql, countParams);
    const total = countResult[0].total;
    
    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async markAsRead(id, userId) {
    const sql = `UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?`;
    await query(sql, [id, userId]);
  }

  static async markAllAsRead(userId) {
    const sql = `UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false`;
    await query(sql, [userId]);
  }

  static async getUnreadCount(userId) {
    const sql = `SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = false`;
    const result = await query(sql, [userId]);
    return result[0].unread_count;
  }

  static async delete(id, userId) {
    const sql = `DELETE FROM notifications WHERE id = ? AND user_id = ?`;
    await query(sql, [id, userId]);
  }

  // Create specific notification types
  static async createOrderNotification(orderId, userId, type, title, message) {
    return await this.create({
      user_id: userId,
      title,
      message,
      type,
      related_id: orderId
    });
  }

  static async createPaymentNotification(paymentId, userId, title, message) {
    return await this.create({
      user_id: userId,
      title,
      message,
      type: 'payment',
      related_id: paymentId
    });
  }

  static async createChatNotification(chatId, userId, title, message) {
    return await this.create({
      user_id: userId,
      title,
      message,
      type: 'chat',
      related_id: chatId
    });
  }

  static async createReviewNotification(reviewId, userId, title, message) {
    return await this.create({
      user_id: userId,
      title,
      message,
      type: 'review',
      related_id: reviewId
    });
  }
}

module.exports = Notification;