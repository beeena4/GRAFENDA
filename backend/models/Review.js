const { query } = require('../config/database');

class Review {
  static async create(reviewData) {
    const { order_id, reviewer_id, seller_id, rating, comment } = reviewData;
    
    const sql = `INSERT INTO reviews (order_id, reviewer_id, seller_id, rating, comment) VALUES (?, ?, ?, ?, ?)`;
    const result = await query(sql, [order_id, reviewer_id, seller_id, rating, comment]);
    
    // Update seller rating and stats
    await this.updateSellerStats(seller_id);
    
    return result.insertId;
  }

  static async findById(id) {
    const sql = `
      SELECT r.*, 
             o.title as order_title,
             reviewer.full_name as reviewer_name, reviewer.avatar as reviewer_avatar,
             seller_user.full_name as seller_name
      FROM reviews r
      JOIN orders o ON r.order_id = o.id
      JOIN users reviewer ON r.reviewer_id = reviewer.id
      JOIN seller_profiles sp ON r.seller_id = sp.id
      JOIN users seller_user ON sp.user_id = seller_user.id
      WHERE r.id = ?
    `;
    const reviews = await query(sql, [id]);
    return reviews[0];
  }

  static async findBySellerId(sellerId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT r.*, 
             o.title as order_title,
             u.full_name as reviewer_name, u.avatar as reviewer_avatar
      FROM reviews r
      JOIN orders o ON r.order_id = o.id
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.seller_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const reviews = await query(sql, [sellerId, limit, offset]);
    
    // Get total count and average rating
    const statsSql = `
      SELECT COUNT(*) as total_reviews, AVG(rating) as avg_rating
      FROM reviews 
      WHERE seller_id = ?
    `;
    const stats = await query(statsSql, [sellerId]);
    
    return {
      reviews,
      stats: stats[0],
      pagination: {
        page,
        limit,
        total: stats[0].total_reviews,
        pages: Math.ceil(stats[0].total_reviews / limit)
      }
    };
  }

  static async findByOrderId(orderId) {
    const sql = `SELECT * FROM reviews WHERE order_id = ?`;
    const reviews = await query(sql, [orderId]);
    return reviews[0];
  }

  static async updateSellerStats(sellerId) {
    // Calculate new rating and review count
    const statsSql = `
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
      FROM reviews 
      WHERE seller_id = ?
    `;
    const stats = await query(statsSql, [sellerId]);
    
    // Update seller profile
    const updateSql = `
      UPDATE seller_profiles 
      SET rating = ?, total_reviews = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    await query(updateSql, [stats[0].avg_rating || 0, stats[0].total_reviews, sellerId]);
  }

  static async getSellerRatingStats(sellerId) {
    const sql = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews 
      WHERE seller_id = ?
    `;
    const stats = await query(sql, [sellerId]);
    return stats[0];
  }

  static async canReview(orderId, userId) {
    // Check if order is completed and user is the buyer
    const sql = `
      SELECT o.id 
      FROM orders o 
      WHERE o.id = ? AND o.buyer_id = ? AND o.status = 'completed'
      AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.order_id = o.id)
    `;
    const orders = await query(sql, [orderId, userId]);
    return orders.length > 0;
  }
}

module.exports = Review;