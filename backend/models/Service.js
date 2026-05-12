const { query } = require('../config/database');

class Service {
  static async create(serviceData) {
    const { seller_id, category_id, title, description, tags } = serviceData;
    
    const sql = `INSERT INTO services (seller_id, category_id, title, description, tags) VALUES (?, ?, ?, ?, ?)`;
    const result = await query(sql, [seller_id, category_id, title, description, tags]);
    
    return result.insertId;
  }

  static async findById(id) {
    const sql = `
      SELECT s.*, c.name as category_name, sp.user_id as seller_user_id, u.full_name as seller_name, u.avatar as seller_avatar
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      JOIN seller_profiles sp ON s.seller_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE s.id = ? AND s.is_active = true
    `;
    const services = await query(sql, [id]);
    return services[0];
  }

  static async findBySellerId(sellerId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT s.*, c.name as category_name
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.seller_id = ? AND s.is_active = true
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const services = await query(sql, [sellerId, limit, offset]);
    
    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM services WHERE seller_id = ? AND is_active = true`;
    const countResult = await query(countSql, [sellerId]);
    const total = countResult[0].total;
    
    return {
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async update(id, updateData) {
    const { title, description, tags, category_id, is_featured, is_active } = updateData;
    
    const sql = `UPDATE services SET title = ?, description = ?, tags = ?, category_id = ?, is_featured = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await query(sql, [title, description, tags, category_id, is_featured, is_active, id]);
  }

  static async delete(id) {
    const sql = `UPDATE services SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await query(sql, [id]);
  }

  static async search(filters = {}, page = 1, limit = 20) {
    let sql = `
      SELECT s.*, c.name as category_name, sp.user_id as seller_user_id, u.full_name as seller_name, u.avatar as seller_avatar, sp.rating as seller_rating
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      JOIN seller_profiles sp ON s.seller_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE s.is_active = true AND sp.is_active = true
    `;
    
    const params = [];
    
    if (filters.search) {
      sql += ` AND (s.title LIKE ? OR s.description LIKE ? OR s.tags LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (filters.category_id) {
      sql += ` AND s.category_id = ?`;
      params.push(filters.category_id);
    }
    
    if (filters.min_price || filters.max_price) {
      sql += ` AND EXISTS (
        SELECT 1 FROM service_packages sp WHERE sp.service_id = s.id 
        AND sp.price BETWEEN ? AND ?
      )`;
      params.push(filters.min_price || 0, filters.max_price || 999999);
    }
    
    if (filters.seller_rating) {
      sql += ` AND sp.rating >= ?`;
      params.push(filters.seller_rating);
    }
    
    // Sorting
    const sortOptions = {
      'newest': 's.created_at DESC',
      'oldest': 's.created_at ASC',
      'price_low': 'MIN(sp.price) ASC',
      'price_high': 'MIN(sp.price) DESC',
      'rating': 'sp.rating DESC',
      'popular': 'sp.total_orders DESC'
    };
    
    sql += ` GROUP BY s.id ORDER BY ${sortOptions[filters.sort] || 's.created_at DESC'}`;
    
    // Pagination
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);
    
    const services = await query(sql, params);
    
    // Get total count
    let countSql = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      JOIN seller_profiles sp ON s.seller_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE s.is_active = true AND sp.is_active = true
    `;
    
    const countParams = [];
    
    if (filters.search) {
      countSql += ` AND (s.title LIKE ? OR s.description LIKE ? OR s.tags LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (filters.category_id) {
      countSql += ` AND s.category_id = ?`;
      countParams.push(filters.category_id);
    }
    
    if (filters.min_price || filters.max_price) {
      countSql += ` AND EXISTS (
        SELECT 1 FROM service_packages sp WHERE sp.service_id = s.id 
        AND sp.price BETWEEN ? AND ?
      )`;
      countParams.push(filters.min_price || 0, filters.max_price || 999999);
    }
    
    if (filters.seller_rating) {
      countSql += ` AND sp.rating >= ?`;
      countParams.push(filters.seller_rating);
    }
    
    const countResult = await query(countSql, countParams);
    const total = countResult[0].total;
    
    return {
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getFeatured(limit = 10) {
    const sql = `
      SELECT s.*, c.name as category_name, sp.user_id as seller_user_id, u.full_name as seller_name, u.avatar as seller_avatar, sp.rating as seller_rating
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      JOIN seller_profiles sp ON s.seller_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE s.is_active = true AND s.is_featured = true AND sp.is_active = true
      ORDER BY s.created_at DESC
      LIMIT ?
    `;
    
    return await query(sql, [limit]);
  }
}

module.exports = Service;