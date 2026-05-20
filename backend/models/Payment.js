const { query } = require('../config/database');

class Payment {
  static async create(paymentData) {
    const { order_id, amount, payment_method } = paymentData;
    
    const sql = `INSERT INTO payments (order_id, amount, payment_method) VALUES (?, ?, ?)`;
    const result = await query(sql, [order_id, amount, payment_method]);
    
    return result.insertId;
  }

  static async findById(id) {
    const sql = `
      SELECT p.*, o.title as order_title, o.price as order_price, 
             b.full_name as buyer_name, b.email as buyer_email
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users b ON o.buyer_id = b.id
      WHERE p.id = ?
    `;
    const payments = await query(sql, [id]);
    return payments[0];
  }

  static async findByOrderId(orderId) {
    const sql = `SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC`;
    return await query(sql, [orderId]);
  }

  static async updatePaymentProof(id, paymentProof) {
    const sql = `UPDATE payments SET payment_proof = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await query(sql, [paymentProof, id]);
  }

  static async updatePaymentDetails(id, amount, payment_method, paymentProof = null) {
    let sql = `UPDATE payments SET amount = ?, payment_method = ?`;
    const params = [amount, payment_method];

    if (paymentProof) {
      sql += `, payment_proof = ?`;
      params.push(paymentProof);
    }

    sql += `, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    params.push(id);

    await query(sql, params);
  }

  static async verifyPayment(id, verifiedBy) {
    const sql = `UPDATE payments SET status = 'verified', verified_by = ?, verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await query(sql, [verifiedBy, id]);
  }

  static async rejectPayment(id, verifiedBy) {
    const sql = `UPDATE payments SET status = 'rejected', verified_by = ?, verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await query(sql, [verifiedBy, id]);
  }

  static async getPendingPayments(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT p.*, o.title as order_title, o.price as order_price,
             b.full_name as buyer_name, b.email as buyer_email,
             s.user_id as seller_user_id, u.full_name as seller_name
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users b ON o.buyer_id = b.id
      JOIN seller_profiles sp ON o.seller_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE p.status = 'pending'
      ORDER BY p.created_at ASC
      LIMIT ? OFFSET ?
    `;
    
    const payments = await query(sql, [limit, offset]);
    
    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM payments WHERE status = 'pending'`;
    const countResult = await query(countSql);
    const total = countResult[0].total;
    
    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getPaymentStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
        SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified_payments,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_payments,
        SUM(CASE WHEN status = 'verified' THEN amount ELSE 0 END) as total_verified_amount,
        AVG(CASE WHEN status = 'verified' THEN amount ELSE NULL END) as avg_payment_amount
      FROM payments
    `;
    
    const stats = await query(sql);
    return stats[0];
  }
}

module.exports = Payment;