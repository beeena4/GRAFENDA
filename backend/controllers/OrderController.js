const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const NotificationService = require('../services/NotificationService');
const { sendSuccess, sendError, getPaginationData } = require('../utils/helpers');

class OrderController {
  // Create order
  static async createOrder(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const { service_id, package_id, title, description } = req.body;
      const buyerId = req.user.id;

      // Get service and package details
      const Service = require('../models/Service');
      const ServicePackage = require('../models/ServicePackage');
      
      const service = await Service.findById(service_id);
      if (!service) {
        return sendError(res, 'Service not found', 404);
      }

      const servicePackage = await ServicePackage.findById(package_id);
      if (!servicePackage) {
        return sendError(res, 'Package not found', 404);
      }

      // Check if buyer is not the seller
      if (service.seller_user_id === buyerId) {
        return sendError(res, 'Cannot order your own service', 400);
      }

      // Check seller's active orders limit
      const activeOrders = await Order.getSellerActiveOrders(service.seller_id);
      const SellerProfile = require('../models/SellerProfile');
      const sellerProfile = await SellerProfile.findByUserId(service.seller_user_id);
      
      if (activeOrders >= sellerProfile.max_concurrent_orders) {
        return sendError(res, 'Seller has reached maximum concurrent orders', 400);
      }

      // Create order
      const orderId = await Order.create({
        buyer_id: buyerId,
        seller_id: service.seller_id,
        service_id,
        package_id,
        title: title || service.title,
        description,
        price: servicePackage.price,
        delivery_days: servicePackage.delivery_days,
        max_revisions: servicePackage.revisions
      });

      // Create payment record
      await Payment.create({
        order_id: orderId,
        amount: servicePackage.price,
        payment_method: 'pending' // Will be updated when payment is made
      });

      // Notify seller
      await NotificationService.notifySellerNewOrder(
        orderId, 
        service.seller_user_id, 
        req.user.full_name, 
        title || service.title
      );

      const order = await Order.findById(orderId);
      sendSuccess(res, 'Order created successfully', order, 201);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get user orders
  static async getUserOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const userId = req.user.id;
      const role = req.user.role === 'seller' ? 'seller' : 'buyer';

      const result = await Order.findByUserId(userId, role, page, limit, status);

      const response = {
        orders: result.orders,
        pagination: getPaginationData(page, limit, result.pagination.total)
      };

      sendSuccess(res, 'Orders retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get order details
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      const order = await Order.findById(id);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      // Check if user has access to this order
      const hasAccess = (role === 'seller' && order.seller_user_id === userId) || 
                       (role === 'user' && order.buyer_id === userId) ||
                       role === 'admin';

      if (!hasAccess) {
        return sendError(res, 'Access denied', 403);
      }

      sendSuccess(res, 'Order details retrieved successfully', order);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Update order status
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;
      const role = req.user.role;

      const order = await Order.findById(id);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      // Check permissions
      const canUpdate = (role === 'seller' && order.seller_user_id === userId) ||
                       (role === 'user' && order.buyer_id === userId && status === 'cancelled') ||
                       role === 'admin';

      if (!canUpdate) {
        return sendError(res, 'Access denied', 403);
      }

      // Validate status transitions
      const validStatuses = ['pending', 'paid', 'process', 'revision', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return sendError(res, 'Invalid status', 400);
      }

      await Order.updateStatus(id, status, userId);

      // Notify relevant parties
      const notifyUserId = role === 'seller' ? order.buyer_id : order.seller_user_id;
      await NotificationService.notifyOrderStatus(id, notifyUserId, status, order.title);

      // If completed, send review reminder
      if (status === 'completed') {
        await NotificationService.notifyReviewReminder(id, order.buyer_id, order.title);
      }

      sendSuccess(res, 'Order status updated successfully');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Cancel order
  static async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      const order = await Order.findById(id);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      // Only buyer or admin can cancel
      if (role !== 'admin' && order.buyer_id !== userId) {
        return sendError(res, 'Access denied', 403);
      }

      // Can only cancel pending or paid orders
      if (!['pending', 'paid'].includes(order.status)) {
        return sendError(res, 'Cannot cancel order with current status', 400);
      }

      await Order.cancelOrder(id, userId);

      // Notify seller
      await NotificationService.notifyOrderStatus(id, order.seller_user_id, 'cancelled', order.title);

      sendSuccess(res, 'Order cancelled successfully');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Request revision
  static async requestRevision(req, res) {
    try {
      const { id } = req.params;
      const { description } = req.body;
      const userId = req.user.id;

      const order = await Order.findById(id);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      // Only buyer can request revision
      if (order.buyer_id !== userId) {
        return sendError(res, 'Access denied', 403);
      }

      // Check if revisions are available
      if (order.revisions_used >= order.max_revisions) {
        return sendError(res, 'Maximum revisions reached', 400);
      }

      await Order.updateStatus(id, 'revision');
      await Order.updateRevisions(id, order.revisions_used + 1);

      // Notify seller
      await NotificationService.notifyOrderStatus(id, order.seller_user_id, 'revision', order.title);

      sendSuccess(res, 'Revision requested successfully');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get order statistics
  static async getOrderStats(req, res) {
    try {
      const userId = req.user.id;
      const role = req.user.role === 'seller' ? 'seller' : 'buyer';

      const stats = await Order.getOrderStats(userId, role);

      sendSuccess(res, 'Order statistics retrieved successfully', stats);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }
}

module.exports = OrderController;