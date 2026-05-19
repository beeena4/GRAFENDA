const { query } = require('../config/database');

class Service {
  // Create service
  static async create(serviceData) {
    const {
      seller_id,
      category_id,
      title,
      description,
      tags,
      image_url
    } = serviceData;

    const sql = `
      INSERT INTO services 
      (seller_id, category_id, title, description, tags, image_url) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      seller_id,
      category_id,
      title,
      description,
      tags ?? null,
      image_url ?? null
    ]);

    return result.insertId;
  }

  // Find service by ID
  static async findById(id) {
    const sql = `
      SELECT 
        s.image_url as image,
        s.*, 
        c.name as category_name, 
        sp.user_id as seller_user_id, 
        u.full_name as seller_name, 
        u.avatar as seller_avatar
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      JOIN seller_profiles sp ON s.seller_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE s.id = ? AND s.is_active = true
    `;

    const services = await query(sql, [id]);

    return services[0];
  }

  // Find services by seller
  static async findBySellerId(sellerId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const sql = `
      SELECT 
        s.image_url as image,
        s.*, 
        c.name as category_name
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.seller_id = ? 
      AND s.is_active = true
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const services = await query(sql, [
      sellerId,
      limit,
      offset
    ]);

    // Count total
    const countSql = `
      SELECT COUNT(*) as total 
      FROM services 
      WHERE seller_id = ? 
      AND is_active = true
    `;

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

  // Update service
  static async update(id, updateData) {
    // Ambil data lama
    const existingService = await this.findById(id);

    if (!existingService) {
      throw new Error('Service not found');
    }

    // Gunakan data baru jika ada
    // jika tidak gunakan data lama
    const title =
      updateData.title ?? existingService.title;

    const description =
      updateData.description ?? existingService.description;

    const tags =
      updateData.tags ?? existingService.tags;

    const category_id =
      updateData.category_id ?? existingService.category_id;

    const is_featured =
      updateData.is_featured ?? existingService.is_featured;

    const is_active =
      updateData.is_active ?? existingService.is_active;

    const sql = `
      UPDATE services
      SET
        title = ?,
        description = ?,
        tags = ?,
        category_id = ?,
        is_featured = ?,
        is_active = ?,
        image_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    console.log('UPDATE SERVICE DATA:', {
      title,
      description,
      tags,
      category_id,
      is_featured,
      is_active,
      id
    });

    await query(sql, [
      title ?? null,
      description ?? null,
      tags ?? null,
      category_id ?? null,
      is_featured ?? false,
      is_active ?? true,
      updateData.image_url ?? existingService.image_url ?? null,
      id
    ]);
  }

  // Soft delete
  static async delete(id) {
    const sql = `
      UPDATE services
      SET 
        is_active = false,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await query(sql, [id]);
  }

  // Search services
  static async search(filters = {}, page = 1, limit = 20) {
    let sql = `
      SELECT 
        s.image_url as image,
        s.*, 
        c.name as category_name, 
        sp.user_id as seller_user_id, 
        u.full_name as seller_name, 
        u.avatar as seller_avatar, 
        sp.rating as seller_rating,
        MIN(pkg_min.price) as price
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN service_packages pkg_min ON pkg_min.service_id = s.id
      JOIN seller_profiles sp ON s.seller_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE s.is_active = true 
      AND sp.is_active = true
    `;

    const params = [];

    // Search
    if (filters.search) {
      sql += `
        AND (
          s.title LIKE ? 
          OR s.description LIKE ? 
          OR s.tags LIKE ?
        )
      `;

      const searchTerm = `%${filters.search}%`;

      params.push(
        searchTerm,
        searchTerm,
        searchTerm
      );
    }

    // Category
    if (filters.category_id) {
      sql += ` AND s.category_id = ?`;
      params.push(filters.category_id);
    }

    // Price filter
    if (filters.min_price || filters.max_price) {
      sql += `
        AND EXISTS (
          SELECT 1 
          FROM service_packages pkg
          WHERE pkg.service_id = s.id
          AND pkg.price BETWEEN ? AND ?
        )
      `;

      params.push(
        filters.min_price || 0,
        filters.max_price || 999999
      );
    }

    // Seller rating
    if (filters.seller_rating) {
      sql += ` AND sp.rating >= ?`;
      params.push(filters.seller_rating);
    }

    // Sorting
    const sortOptions = {
      newest: 's.created_at DESC',
      oldest: 's.created_at ASC',
      rating: 'sp.rating DESC',
      popular: 'sp.total_orders DESC'
    };

    sql += `
      GROUP BY s.id
      ORDER BY ${sortOptions[filters.sort] || 's.created_at DESC'}
    `;

    // Pagination
    sql += ` LIMIT ? OFFSET ?`;

    params.push(
      limit,
      (page - 1) * limit
    );

    const services = await query(sql, params);

    // Count total
    let countSql = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      JOIN seller_profiles sp ON s.seller_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE s.is_active = true
      AND sp.is_active = true
    `;

    const countParams = [];

    // Search count
    if (filters.search) {
      countSql += `
        AND (
          s.title LIKE ?
          OR s.description LIKE ?
          OR s.tags LIKE ?
        )
      `;

      const searchTerm = `%${filters.search}%`;

      countParams.push(
        searchTerm,
        searchTerm,
        searchTerm
      );
    }

    // Category count
    if (filters.category_id) {
      countSql += ` AND s.category_id = ?`;
      countParams.push(filters.category_id);
    }

    // Price count
    if (filters.min_price || filters.max_price) {
      countSql += `
        AND EXISTS (
          SELECT 1
          FROM service_packages pkg
          WHERE pkg.service_id = s.id
          AND pkg.price BETWEEN ? AND ?
        )
      `;

      countParams.push(
        filters.min_price || 0,
        filters.max_price || 999999
      );
    }

    // Rating count
    if (filters.seller_rating) {
      countSql += ` AND sp.rating >= ?`;
      countParams.push(filters.seller_rating);
    }

    const countResult = await query(
      countSql,
      countParams
    );

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

  static async findByIdAny(id) {
    const sql = `
      SELECT s.*, sp.user_id as seller_user_id
      FROM services s
      JOIN seller_profiles sp ON s.seller_id = sp.id
      WHERE s.id = ?
    `;
    const services = await query(sql, [id]);
    return services[0];
  }

  static async updateImage(id, imageUrl) {
    const sql = `
      UPDATE services
      SET image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await query(sql, [imageUrl, id]);
  }

  // Featured services
  static async getFeatured(limit = 10) {
    const sql = `
      SELECT 
        s.image_url as image,
        s.*, 
        c.name as category_name, 
        sp.user_id as seller_user_id, 
        u.full_name as seller_name, 
        u.avatar as seller_avatar, 
        sp.rating as seller_rating
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      JOIN seller_profiles sp ON s.seller_id = sp.id
      JOIN users u ON sp.user_id = u.id
      WHERE s.is_active = true
      AND s.is_featured = true
      AND sp.is_active = true
      ORDER BY s.created_at DESC
      LIMIT ?
    `;

    return await query(sql, [limit]);
  }
}

module.exports = Service;