const { query } = require('../config/database');

class ServicePackage {
  static async create(packageData) {
    const { service_id, package_type, name, description, price, delivery_days, revisions, features } = packageData;
    
    const sql = `INSERT INTO service_packages (service_id, package_type, name, description, price, delivery_days, revisions, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = await query(sql, [service_id, package_type, name, description, price, delivery_days, revisions, features]);
    
    return result.insertId;
  }

  static async findByServiceId(serviceId) {
    const sql = `SELECT * FROM service_packages WHERE service_id = ? ORDER BY price ASC`;
    return await query(sql, [serviceId]);
  }

  static async findById(id) {
    const sql = `SELECT * FROM service_packages WHERE id = ?`;
    const packages = await query(sql, [id]);
    return packages[0];
  }

  static async update(id, updateData) {
    const { name, description, price, delivery_days, revisions, features } = updateData;
    
    const sql = `UPDATE service_packages SET name = ?, description = ?, price = ?, delivery_days = ?, revisions = ?, features = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await query(sql, [name, description, price, delivery_days, revisions, features, id]);
  }

  static async delete(id) {
    const sql = `DELETE FROM service_packages WHERE id = ?`;
    await query(sql, [id]);
  }
}

module.exports = ServicePackage;