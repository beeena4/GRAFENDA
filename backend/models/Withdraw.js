const { query } = require('../config/database');

class Withdraw {
  static async create(withdrawData) {
    const { seller_id, amount, bank_name, account_number, account_holder } = withdrawData;
    
    const sql = `INSERT INTO withdraws (seller_id, amount, bank_name, account_number, account_holder) VALUES (?, ?, ?, ?, ?)`;
    const result = await query(sql, [seller_id, amount, bank_name, account_number, account_holder]);
    
    return result.insertId;
  }

  static async findById(id) {
    const sql = `
      SELECT w.*, 
             sp.user_id as seller_user_id, u.full_name as seller_name, u.email as seller_email
      FROM withdraws w
      JOIN seller_profiles sp ON w.seller_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE w.id = ?
    `;
    const withdraws = await query(sql, [id]);
    return withdraws[0];
  }

  static async findBySellerId(sellerId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const sql = `SELECT * FROM withdraws WHERE seller_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const withdraws = await query(sql, [sellerId, limit, offset]);
    
    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM withdraws WHERE seller_id = ?`;
    const countResult = await query(countSql, [sellerId]);
    const total = countResult[0].total;
    
    return {
      withdraws,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async approveWithdraw(id, approvedBy) {
    // 1) update status terlebih dulu
    const sql = `
      UPDATE withdraws 
      SET status = 'approved',
          approved_by = ?,
          approved_at = CURRENT_TIMESTAMP,
          processed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await query(sql, [approvedBy, id]);

    // 2) ambil data withdraw (untuk amount & seller_id)
    const withdraw = await this.findById(id);
    if (!withdraw) return;

    // 3) deduct saldo seller berdasarkan user_id dari seller_profiles
    // withdraw.seller_id mengarah ke seller_profiles.id
    const { query: dbQuery } = require('../config/database');
    await dbQuery(
      `UPDATE users 
       SET balance = balance - ?
       WHERE id = (SELECT user_id FROM seller_profiles WHERE id = ?)`
      , [withdraw.amount, withdraw.seller_id]
    );
  }

  static async rejectWithdraw(id, approvedBy) {
    const sql = `UPDATE withdraws SET status = 'rejected', approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await query(sql, [approvedBy, id]);
  }

  static async getPendingWithdraws(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT w.*, 
             sp.user_id as seller_user_id, u.full_name as seller_name, u.email as seller_email
      FROM withdraws w
      JOIN seller_profiles sp ON w.seller_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE w.status = 'pending'
      ORDER BY w.created_at ASC
      LIMIT ? OFFSET ?
    `;
    
    const withdraws = await query(sql, [limit, offset]);
    
    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM withdraws WHERE status = 'pending'`;
    const countResult = await query(countSql);
    const total = countResult[0].total;
    
    return {
      withdraws,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getWithdrawStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_withdraws,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_withdraws,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_withdraws,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_withdraws,
        SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as total_approved_amount,
        AVG(CASE WHEN status = 'approved' THEN amount ELSE NULL END) as avg_withdraw_amount
      FROM withdraws
    `;
    
    const stats = await query(sql);
    return stats[0];
  }

  static async checkSellerBalance(sellerId, amount) {
    const sql = `
      SELECT u.balance 
      FROM users u 
      JOIN seller_profiles sp ON u.id = sp.user_id 
      WHERE sp.id = ?
    `;
    const result = await query(sql, [sellerId]);
    return result[0] ? result[0].balance >= amount : false;
  }
}

module.exports = Withdraw;