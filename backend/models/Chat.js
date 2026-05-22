const { query } = require('../config/database');

class Chat {
  static async create(chatData) {
    const { order_id, sender_id, receiver_id, message, message_type = 'text', file_url = null } = chatData;
    
    const sql = `INSERT INTO chats (order_id, sender_id, receiver_id, message, message_type, file_url) VALUES (?, ?, ?, ?, ?, ?)`;
    const result = await query(sql, [order_id, sender_id, receiver_id, message, message_type, file_url]);
    
    return result.insertId;
  }

  static async findByOrderId(orderId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT c.*, 
             s.full_name as sender_name, s.avatar as sender_avatar,
             r.full_name as receiver_name, r.avatar as receiver_avatar
      FROM chats c
      JOIN users s ON c.sender_id = s.id
      JOIN users r ON c.receiver_id = r.id
      WHERE c.order_id = ?
      ORDER BY c.created_at ASC
      LIMIT ? OFFSET ?
    `;
    
    const chats = await query(sql, [orderId, limit, offset]);
    
    // Mark messages as read for the current user
    // This would typically be done when a user views the chat
    
    return chats;
  }

  static async markAsRead(orderId, userId) {
    const sql = `UPDATE chats SET is_read = true WHERE order_id = ? AND receiver_id = ? AND is_read = false`;
    await query(sql, [orderId, userId]);
  }

  static async getUnreadCount(userId) {
    const sql = `
      SELECT COUNT(*) as unread_count 
      FROM chats 
      WHERE receiver_id = ? AND is_read = false
    `;
    const result = await query(sql, [userId]);
    return result[0].unread_count;
  }

  static async getChatOrders(userId) {
    const sql = `
      SELECT DISTINCT o.id, o.title, o.status, o.created_at,
             CASE 
               WHEN o.buyer_id = ? THEN u.full_name 
               ELSE b.full_name 
             END as other_party_name,
             CASE 
               WHEN o.buyer_id = ? THEN u.avatar 
               ELSE b.avatar 
             END as other_party_avatar,
             (SELECT COUNT(*) FROM chats c WHERE c.order_id = o.id AND c.receiver_id = ? AND c.is_read = false) as unread_count,
             (SELECT c.message FROM chats c WHERE c.order_id = o.id ORDER BY c.created_at DESC LIMIT 1) as last_message,
             (SELECT c.created_at FROM chats c WHERE c.order_id = o.id ORDER BY c.created_at DESC LIMIT 1) as last_message_time
      FROM orders o
      JOIN users b ON o.buyer_id = b.id
      JOIN seller_profiles sp ON o.seller_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE (o.buyer_id = ? OR sp.user_id = ?) AND o.status IN ('paid', 'process', 'revision', 'completed', 'pending')
      ORDER BY last_message_time DESC
    `;
    
    return await query(sql, [userId, userId, userId, userId, userId]);
  }

  static async getChatStats(userId) {
    const sql = `
      SELECT 
        COUNT(DISTINCT order_id) as total_chats,
        SUM(CASE WHEN receiver_id = ? AND is_read = false THEN 1 ELSE 0 END) as unread_messages
      FROM chats
      WHERE sender_id = ? OR receiver_id = ?
    `;
    
    const stats = await query(sql, [userId, userId, userId]);
    return stats[0];
  }
}

module.exports = Chat;