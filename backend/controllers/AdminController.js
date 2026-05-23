const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Withdraw = require('../models/Withdraw');
const Service = require('../models/Service');
const { sendSuccess, sendError, getPaginationData } = require('../utils/helpers');

class AdminController {
  // Get dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      const { query } = require('../config/database');

      // User statistics
      const userStats = await User.getAllUsers({}, 1, 1000); // Get all users for stats
      const totalUsers = userStats.pagination.total;
      const sellerCount = userStats.users.filter(u => u.role === 'seller').length;
      const buyerCount = userStats.users.filter(u => u.role === 'user').length;

      // Order statistics
      const orders = await query(`
        SELECT o.*, 
               b.full_name as buyer_name, b.email as buyer_email,
               sp.user_id as seller_user_id, u.full_name as seller_name, u.email as seller_email,
               svc.title as service_title, pkg.name as package_name
        FROM orders o
        LEFT JOIN users b ON o.buyer_id = b.id
        LEFT JOIN seller_profiles sp ON o.seller_id = sp.id
        LEFT JOIN users u ON sp.user_id = u.id
        LEFT JOIN services svc ON o.service_id = svc.id
        LEFT JOIN service_packages pkg ON o.package_id = pkg.id
        ORDER BY o.created_at DESC
        LIMIT 1000
      `);

      const totalOrders = orders.length;
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      // Payment statistics
      const paymentStats = await Payment.getPaymentStats();

      // Revenue statistics (from completed orders)
      const revenueStats = await this.getRevenueStats();

      // Recent activities
      const recentOrders = orders.slice(0, 5);
      const recentPaymentsData = await query(`
  SELECT 
    p.*,
    o.status as order_status,
    b.full_name as buyer_name,
    s.title as service_title
  FROM payments p
  JOIN orders o ON p.order_id = o.id
  LEFT JOIN users b ON o.buyer_id = b.id
  LEFT JOIN services s ON o.service_id = s.id
  WHERE o.status = 'completed' AND p.status = 'pending'
  ORDER BY p.created_at DESC
  LIMIT 10
`);

      const stats = {
        users: {
          total: totalUsers,
          sellers: sellerCount,
          buyers: buyerCount
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          pending: pendingOrders,
          completion_rate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
        },
        payments: paymentStats,
        transactions: {
          total: paymentStats.total_payments || 0,
          completed: paymentStats.released_payments || 0,
          pending: paymentStats.pending_transactions || 0,
          revenue: paymentStats.total_revenue || 0
        },
        revenue: revenueStats,
        recent_activity: {
          orders: recentOrders,
          payments: recentPaymentsData
        }
      };

      sendSuccess(res, 'Dashboard statistics retrieved successfully', stats);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get all users with pagination
  static async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const role = req.query.role;
      const search = req.query.search;

      const filters = {};
      if (role) filters.role = role;
      if (search) filters.search = search;

      const result = await User.getAllUsers(filters, page, limit);

      const response = {
        users: result.users,
        pagination: result.pagination,
        filters
      };

      sendSuccess(res, 'Users retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Update user role/status
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { role, is_verified } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      // Build update query with only provided fields
      const { query } = require('../config/database');
      const updateFields = [];
      const updateParams = [];

      if (typeof role !== 'undefined') {
        updateFields.push('role = ?');
        updateParams.push(role);
      }

      if (typeof is_verified !== 'undefined') {
        updateFields.push('is_verified = ?');
        updateParams.push(is_verified ? 1 : 0);
      }

      if (updateFields.length === 0) {
        return sendError(res, 'No valid fields to update', 400);
      }

      await query(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, [...updateParams, id]);

      const updatedUser = await User.findById(id);
      sendSuccess(res, 'User updated successfully', updatedUser);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      sendSuccess(res, 'User retrieved successfully', user);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      const { query } = require('../config/database');
      await query('DELETE FROM users WHERE id = ?', [id]);
      sendSuccess(res, 'User deleted successfully', { id });
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get all orders
  // Get all orders
  static async getAllOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;

      // 1. Panggil koneksi database
      const { query } = require('../config/database');

      // 2. Gunakan 'let sql' agar bisa ditambahkan WHERE dan LIMIT di bawahnya
      let sql = `
        SELECT 
          o.*, 
          s.title AS service_title, 
          sp.user_id AS seller_user_id,
          u.full_name AS seller_name,
          u.email AS seller_email,
          b.full_name AS buyer_name,
          b.email AS buyer_email
        FROM orders o
        LEFT JOIN services s ON o.service_id = s.id
        LEFT JOIN seller_profiles sp ON o.seller_id = sp.id
        LEFT JOIN users u ON sp.user_id = u.id
        LEFT JOIN users b ON o.buyer_id = b.id
      `;

      const params = [];
      // if (status) {
      //   sql += ' WHERE o.status = ?';
      //   params.push(status);
      // }

      sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);

      // 3. Eksekusi query
      const orders = await query(sql, params);

      // Get total count
      let countSql = 'SELECT COUNT(o.id) as total FROM orders o';
      const countParams = [];
      // if (status) {
      //   countSql += ' WHERE o.status = ?';
      //   countParams.push(status);
      // }

      const countResult = await query(countSql, countParams);
      const total = countResult[0].total;

      const response = {
        orders,
        pagination: getPaginationData(page, limit, total)
      };

      sendSuccess(res, 'Orders retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get revenue statistics
  static async getRevenueStats() {
    const { query } = require('../config/database');

    const sql = `
      SELECT 
        SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN price ELSE 0 END) as monthly_revenue,
        AVG(CASE WHEN status = 'completed' THEN price ELSE NULL END) as avg_order_value,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as total_completed_orders
      FROM orders
    `;

    const result = await query(sql);
    return result[0];
  }

  // Get withdraw requests
  static async getWithdrawRequests(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Withdraw.getPendingWithdraws(page, limit);

      const response = {
        withdraws: result.withdraws,
        pagination: getPaginationData(page, limit, result.pagination.total)
      };

      sendSuccess(res, 'Withdraw requests retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Approve/reject withdraw
  static async processWithdraw(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'approve' or 'reject'
      const adminId = req.user.id;

      if (action === 'approve') {
        await Withdraw.approveWithdraw(id, adminId);
        sendSuccess(res, 'Withdraw approved successfully');
      } else if (action === 'reject') {
        await Withdraw.rejectWithdraw(id, adminId);
        sendSuccess(res, 'Withdraw rejected');
      } else {
        return sendError(res, 'Invalid action', 400);
      }
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get all services
  static async getAllServices(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const { query } = require('../config/database');
      const offset = (page - 1) * limit;

      const sql = `
        SELECT s.*, c.name as category_name, sp.user_id as seller_user_id, u.full_name as seller_name
        FROM services s
        LEFT JOIN categories c ON s.category_id = c.id
        JOIN seller_profiles sp ON s.seller_id = sp.id
        JOIN users u ON sp.user_id = u.id
        ORDER BY s.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const services = await query(sql, [limit, offset]);

      // Get total count
      const countResult = await query('SELECT COUNT(*) as total FROM services');
      const total = countResult[0].total;

      const response = {
        services,
        pagination: getPaginationData(page, limit, total)
      };

      sendSuccess(res, 'Services retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }
}

module.exports = AdminController;