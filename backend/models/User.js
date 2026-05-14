const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

const safeValue = (value) => value === undefined ? null : value;

const mapDbUserToAppUser = (user) => {
  if (!user) return null;

  return {
    id: user.user_id || user.id,
    email: user.email,
    full_name: user.nama,
    phone: user.nomor_telepon,
    avatar: user.foto_profil,
    role: user.role === 'buyer' ? 'user' : user.role,
    is_verified: user.is_active === 1 || user.is_active === true,
    balance: user.balance ?? 0,
    created_at: user.created_at,
    password: user.password
  };
};

class User {
  static async create(userData) {
    const { email, password, full_name, phone, role = 'user' } = userData;
    const dbRole = role === 'user' ? 'buyer' : role;

    const hashedPassword = await bcrypt.hash(password, 12);
    const sql = `INSERT INTO users (nama, email, password, role, nomor_telepon) VALUES (?, ?, ?, ?, ?)`;
    const params = [
      safeValue(full_name),
      email,
      hashedPassword,
      safeValue(dbRole),
      safeValue(phone)
    ];

    console.log('User.create values:', params);
    const result = await query(sql, params);

    return result.insertId;
  }

  static async findByEmail(email) {
    const sql = `SELECT user_id, email, nama, password, role, foto_profil, nomor_telepon, is_active, created_at FROM users WHERE email = ?`;
    const users = await query(sql, [email]);
    return mapDbUserToAppUser(users[0]);
  }

  static async findById(id) {
    const sql = `SELECT user_id, email, nama, password, role, foto_profil, nomor_telepon, is_active, created_at FROM users WHERE user_id = ?`;
    const users = await query(sql, [id]);
    return mapDbUserToAppUser(users[0]);
  }

  static async updateProfile(id, updateData) {
    const { full_name, phone, avatar } = updateData;
    const sql = `UPDATE users SET nama = ?, nomor_telepon = ?, foto_profil = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
    await query(sql, [
      safeValue(full_name),
      safeValue(phone),
      safeValue(avatar),
      id
    ]);
  }

  static async updatePassword(id, hashedPassword) {
    const sql = `UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
    await query(sql, [hashedPassword, id]);
  }

  static async updateBalance(id, amount) {
    const sql = `UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
    await query(sql, [amount, id]);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAllUsers(filters = {}, page = 1, limit = 10) {
    let sql = `SELECT user_id as id, email, nama as full_name, role, foto_profil as avatar, nomor_telepon as phone, is_active as is_verified, created_at FROM users WHERE 1=1`;
    const params = [];

    if (filters.role) {
      const dbRole = filters.role === 'user' ? 'buyer' : filters.role;
      sql += ` AND role = ?`;
      params.push(dbRole);
    }

    if (filters.search) {
      sql += ` AND (nama LIKE ? OR email LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);

    const users = await query(sql, params);
    
    let countSql = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
    const countParams = [];

    if (filters.role) {
      const dbRole = filters.role === 'user' ? 'buyer' : filters.role;
      countSql += ` AND role = ?`;
      countParams.push(dbRole);
    }

    if (filters.search) {
      countSql += ` AND (nama LIKE ? OR email LIKE ?)`;
      countParams.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const countResult = await query(countSql, countParams);
    const total = countResult[0].total;

    return {
      users: users.map(mapDbUserToAppUser),
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
