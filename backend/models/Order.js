const { query } = require('../config/database');

class Order {
  static async create(orderData) {
    const { buyer_id, seller_id, service_id, package_id, title, description, price, delivery_days, max_revisions, status = 'pending' } = orderData;
    
    // Status secara eksplisit diset default menjadi 'pending' untuk mencegah NULL
    const sql = `INSERT INTO orders (buyer_id, seller_id, service_id, package_id, title, description, price, delivery_days, max_revisions, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = await query(sql, [buyer_id, seller_id, service_id, package_id, title, description, price, delivery_days, max_revisions, status]);
    
    return result.insertId;
  }

  static async findById(id) {
    const sql = `
      SELECT o.*, 
             b.full_name as buyer_name, b.email as buyer_email, b.avatar as buyer_avatar,
             s.user_id as seller_user_id, u.full_name as seller_name, u.email as seller_email, u.avatar as seller_avatar,
             svc.title as service_title, sp.name as package_name, sp.package_type
      FROM orders o
      JOIN users b ON o.buyer_id = b.id
      JOIN seller_profiles s ON o.seller_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN services svc ON o.service_id = svc.id
      JOIN service_packages sp ON o.package_id = sp.id
      WHERE o.id = ?
    `;
    const orders = await query(sql, [id]);
    return orders[0];
  }

  static async findByUserId(userId, role = 'buyer', page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;
    
    let sql;
    const params = [userId];

    if (role === 'seller') {
      sql = `
        SELECT o.*, 
               b.full_name as buyer_name, b.email as buyer_email, b.avatar as buyer_avatar,
               u.full_name as seller_name, u.avatar as seller_avatar,
               svc.title as service_title, spkg.name as package_name, spkg.package_type
        FROM orders o
        JOIN seller_profiles sp ON o.seller_id = sp.id
        JOIN users u ON sp.user_id = u.id
        JOIN users b ON o.buyer_id = b.id
        JOIN services svc ON o.service_id = svc.id
        JOIN service_packages spkg ON o.package_id = spkg.id
        WHERE sp.user_id = ?
      `;
    } else {
      sql = `
        SELECT o.*, 
               u.full_name as seller_name, u.avatar as seller_avatar,
               svc.title as service_title, spkg.name as package_name, spkg.package_type
        FROM orders o
        JOIN seller_profiles sp ON o.seller_id = sp.id
        JOIN users u ON sp.user_id = u.id
        JOIN users b ON o.buyer_id = b.id
        JOIN services svc ON o.service_id = svc.id
        JOIN service_packages spkg ON o.package_id = spkg.id
        WHERE o.buyer_id = ?
      `;
    }
    
    if (status) {
      sql += ` AND o.status = ?`;
      params.push(status);
    }
    
    sql += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const orders = await query(sql, params);
    
    // Get total count
    let countSql;
    const countParams = [userId];
    if (role === 'seller') {
      countSql = `SELECT COUNT(*) as total FROM orders o JOIN seller_profiles sp ON o.seller_id = sp.id WHERE sp.user_id = ?`;
    } else {
      countSql = `SELECT COUNT(*) as total FROM orders WHERE buyer_id = ?`;
    }
    
    if (status) {
      countSql += ` AND o.status = ?`;
      countParams.push(status);
    }
    
    const countResult = await query(countSql, countParams);
    const total = countResult[0].total;
    
    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async updateStatus(id, status, userId = null) {
    let sql = `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP`;
    const params = [status];
    
    if (status === 'process' && !userId) {
      sql += `, started_at = CURRENT_TIMESTAMP`;
    } else if (status === 'completed') {
      sql += `, completed_at = CURRENT_TIMESTAMP`;
    }
    
    sql += ` WHERE id = ?`;
    params.push(id);
    
    await query(sql, params);
  }

  static async updateResultImage(id, imageUrl) {
    const sql = `UPDATE orders SET result_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await query(sql, [imageUrl, id]);
  }

  static async updateRevisions(id, revisionsUsed) {
    const sql = `UPDATE orders SET revisions_used = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await query(sql, [revisionsUsed, id]);
  }

  static async getOrderStats(userId, role = 'buyer') {
    let sql;
    const params = [userId];
    if (role === 'seller') {
      sql = `
        SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN o.status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
          SUM(CASE WHEN o.status = 'process' THEN 1 ELSE 0 END) as active_orders,
          SUM(CASE WHEN o.status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
          SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
          SUM(CASE WHEN o.status IN ('paid', 'process', 'revision', 'completed') THEN o.price ELSE 0 END) as total_spent,
          AVG(CASE WHEN o.status = 'completed' THEN o.price ELSE NULL END) as avg_order_value
        FROM orders o
        JOIN seller_profiles sp ON o.seller_id = sp.id
        WHERE sp.user_id = ?
      `;
    } else {
      sql = `
        SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
          SUM(CASE WHEN status = 'process' THEN 1 ELSE 0 END) as active_orders,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
          SUM(CASE WHEN status IN ('paid', 'process', 'revision', 'completed') THEN price ELSE 0 END) as total_spent,
          AVG(CASE WHEN status = 'completed' THEN price ELSE NULL END) as avg_order_value
        FROM orders 
        WHERE buyer_id = ?
      `;
    }
    
    const stats = await query(sql, params);
    return stats[0];
  }

  static async getSellerActiveOrders(sellerId) {
    const sql = `
      SELECT COUNT(*) as active_orders 
      FROM orders 
      WHERE seller_id = ? AND status IN ('paid', 'process', 'revision')
    `;
    const result = await query(sql, [sellerId]);
    return result[0].active_orders;
  }

  static async cancelOrder(id, cancelledBy) {
    const sql = `UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await query(sql, [id]);
    
    // Log cancellation reason if needed
    // You might want to add a cancellation_reason field to orders table
  }
}

module.exports = Order;