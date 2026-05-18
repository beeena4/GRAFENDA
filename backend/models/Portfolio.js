const { query } = require('../config/database');

const safeValue = (value) => value === undefined ? null : value;

class Portfolio {
  static async create(portfolioData) {
    const { seller_id, title, description, image_url, project_url } = portfolioData;
    const sql = `INSERT INTO portfolios (seller_id, title, description, image_url, project_url) VALUES (?, ?, ?, ?, ?)`;
    const result = await query(sql, [
      seller_id,
      title,
      safeValue(description),
      safeValue(image_url),
      safeValue(project_url)
    ]);
    return result.insertId;
  }

  static async findBySellerId(sellerId) {
    const sql = `SELECT id, seller_id, title, description, image_url, project_url, created_at FROM portfolios WHERE seller_id = ? ORDER BY created_at DESC`;
    return await query(sql, [sellerId]);
  }

  static async findById(id, sellerId) {
    const sql = `SELECT id, seller_id, title, description, image_url, project_url, created_at FROM portfolios WHERE id = ? AND seller_id = ? LIMIT 1`;
    const results = await query(sql, [id, sellerId]);
    return results[0];
  }

  static async deleteById(id, sellerId) {
    const sql = `DELETE FROM portfolios WHERE id = ? AND seller_id = ?`;
    const result = await query(sql, [id, sellerId]);
    return result.affectedRows;
  }
}

module.exports = Portfolio;
