const { query } = require('../config/database');

const safeValue = (value) => value === undefined ? null : value;

class SellerProfile {
  static async create(sellerData) {
    const { user_id, bio, skills, experience_years, portfolio_url } = sellerData;
    
    const sql = `INSERT INTO seller_profiles (user_id, bio, skills, experience_years, portfolio_url) VALUES (?, ?, ?, ?, ?)`;
    const result = await query(sql, [
      user_id,
      safeValue(bio),
      safeValue(skills),
      safeValue(experience_years),
      safeValue(portfolio_url)
    ]);
    
    return result.insertId;
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT sp.*, u.full_name, u.avatar, u.email
      FROM seller_profiles sp
      JOIN users u ON sp.user_id = u.user_id
      WHERE sp.user_id = ?
    `;
    const sellers = await query(sql, [userId]);
    return sellers[0];
  }

  static async updateProfile(userId, updateData) {
    const { bio, skills, experience_years, portfolio_url, max_concurrent_orders } = updateData;
    
    const sql = `UPDATE seller_profiles SET bio = ?, skills = ?, experience_years = ?, portfolio_url = ?, max_concurrent_orders = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
    await query(sql, [
      safeValue(bio),
      safeValue(skills),
      safeValue(experience_years),
      safeValue(portfolio_url),
      safeValue(max_concurrent_orders),
      userId
    ]);
  }

  static async updateStats(userId, stats) {
    const { rating, total_reviews, total_orders, completion_rate, response_time } = stats;
    
    const sql = `UPDATE seller_profiles SET rating = ?, total_reviews = ?, total_orders = ?, completion_rate = ?, response_time = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
    await query(sql, [rating, total_reviews, total_orders, completion_rate, response_time, userId]);
  }

  static async getTopSellers(limit = 10) {
    const sql = `
      SELECT sp.*, u.full_name, u.avatar, u.email
      FROM seller_profiles sp
      JOIN users u ON sp.user_id = u.user_id
      WHERE sp.is_active = true
      ORDER BY sp.rating DESC, sp.total_orders DESC
      LIMIT ?
    `;
    return await query(sql, [limit]);
  }

  static async getSellerStats(userId) {
    // Get seller profile
    const profile = await this.findByUserId(userId);
    if (!profile) return null;

    // Get order statistics
    const orderStats = await query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'process' THEN 1 ELSE 0 END) as active_orders,
        AVG(rating) as avg_rating,
        COUNT(r.rating) as total_reviews
      FROM orders o
      LEFT JOIN reviews r ON o.id = r.order_id
      WHERE o.seller_id = ?
    `, [profile.id]);

    // Get earnings statistics
    const earningsStats = await query(`
      SELECT 
        SUM(o.price) as total_earnings,
        SUM(CASE WHEN o.status = 'completed' THEN o.price ELSE 0 END) as completed_earnings,
        AVG(o.price) as avg_order_value
      FROM orders o
      WHERE o.seller_id = ? AND o.status IN ('paid', 'process', 'revision', 'completed')
    `, [profile.id]);

    return {
      profile,
      stats: {
        ...orderStats[0],
        ...earningsStats[0],
        completion_rate: profile.total_orders > 0 ? (orderStats[0].completed_orders / profile.total_orders) * 100 : 0
      }
    };
  }
}

module.exports = SellerProfile;