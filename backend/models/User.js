const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

const safeValue = (value) => value === undefined ? null : value;

class User {
  static async create(userData) {
    const { email, password, full_name, phone, role = 'user' } = userData;

    const hashedPassword = await bcrypt.hash(password, 12);
    const sql = `INSERT INTO users (full_name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)`;
    const params = [
      safeValue(full_name),
      email,
      hashedPassword,
      role,
      safeValue(phone)
    ];

    console.log('User.create values:', params);
    const result = await query(sql, params);

    return result.insertId;
  }

  static async findByEmail(email) {
    const sql = `SELECT id, email, full_name, password, role, avatar, phone, is_verified, balance, created_at FROM users WHERE email = ?`;
    const users = await query(sql, [email]);
    return users[0] || null;
  }

  static async findById(id) {
    const sql = `SELECT id, email, full_name, password, role, avatar, phone, is_verified, balance, created_at FROM users WHERE id = ?`;
    const users = await query(sql, [id]);
    return users[0] || null;
  }

  static async updateProfile(id, updateData) {
    const { full_name, phone, avatar } = updateData;
    const sql = `UPDATE users SET full_name = ?, phone = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await query(sql, [
      safeValue(full_name),
      safeValue(phone),
      safeValue(avatar),
      id
    ]);
  }

  static async updatePassword(id, hashedPassword) {
    const sql = `UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await query(sql, [hashedPassword, id]);
  }

  static async updateBalance(id, amount) {
    const sql = `UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await query(sql, [amount, id]);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAllUsers(filters = {}, page = 1, limit = 10) {
    let sql = `SELECT id, email, full_name, role, avatar, phone, is_verified, created_at FROM users WHERE 1=1`;
    const params = [];

    if (filters.role) {
      sql += ` AND role = ?`;
      params.push(filters.role);
    }

    if (filters.search) {
      sql += ` AND (full_name LIKE ? OR email LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);

    const users = await query(sql, params);

    let countSql = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
    const countParams = [];

    if (filters.role) {
      countSql += ` AND role = ?`;
      countParams.push(filters.role);
    }

    if (filters.search) {
      countSql += ` AND (full_name LIKE ? OR email LIKE ?)`;
      countParams.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const countResult = await query(countSql, countParams);
    const total = countResult[0].total;

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = User;