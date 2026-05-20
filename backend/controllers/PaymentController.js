const { validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const NotificationService = require('../services/NotificationService');
const PDFGenerator = require('../utils/pdfGenerator');
const { sendSuccess, sendError, getPaginationData } = require('../utils/helpers');

class PaymentController {
  // Upload payment proof
  static async uploadPaymentProof(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      let { order_id, payment_method } = req.body;
      const userId = req.user.id;

      // Normalize metode pembayaran alias
      if (typeof payment_method === 'string') {
        const normalized = payment_method.toLowerCase();
        if (normalized === 'transfer') payment_method = 'bank_transfer';
        else if (normalized === 'va') payment_method = 'virtual_account';
        else if (normalized === 'ewallet') payment_method = 'e_wallet';
      }

      // Check if order exists and belongs to user
      const order = await Order.findById(order_id);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      if (order.buyer_id !== userId) {
        return sendError(res, 'Access denied', 403);
      }

      // Check if payment already exists
      const existingPayment = await Payment.findByOrderId(order_id);
      let paymentId;

      if (existingPayment.length > 0) {
        const paymentRecord = existingPayment[0];
        if (paymentRecord.status !== 'pending') {
          return sendError(res, 'Payment already exists for this order', 400);
        }

        // Update pending payment record instead of creating a duplicate
        paymentId = paymentRecord.id;
        await Payment.updatePaymentDetails(paymentId, order.price, payment_method, req.file ? `/uploads/payments/${req.file.filename}` : null);
      } else {
        // Create payment record
        paymentId = await Payment.create({
          order_id,
          amount: order.price,
          payment_method
        });

        if (req.file) {
          const proofUrl = `/uploads/payments/${req.file.filename}`;
          await Payment.updatePaymentProof(paymentId, proofUrl);
        }
      }

      // Update order status to paid
      await Order.updateStatus(order_id, 'paid');

      // Notify admin for verification
      // In a real app, you'd notify admins here

      const payment = await Payment.findById(paymentId);
      sendSuccess(res, 'Payment proof uploaded successfully', payment);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get payment details
  static async getPaymentByOrderId(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      // Check if user has access to this order
      const order = await Order.findById(orderId);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      const hasAccess = (role === 'seller' && order.seller_user_id === userId) || 
                       (role === 'user' && order.buyer_id === userId) ||
                       role === 'admin';

      if (!hasAccess) {
        return sendError(res, 'Access denied', 403);
      }

      const payments = await Payment.findByOrderId(orderId);

      sendSuccess(res, 'Payment details retrieved successfully', payments);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Verify payment (admin only)
  static async verifyPayment(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'verify' or 'reject'
      const adminId = req.user.id;

      const payment = await Payment.findById(id);
      if (!payment) {
        return sendError(res, 'Payment not found', 404);
      }

      if (action === 'verify') {
        await Payment.verifyPayment(id, adminId);
        
        // Update order status to process
        await Order.updateStatus(payment.order_id, 'process');
        
        // Generate invoice
        const order = await Order.findById(payment.order_id);
        const invoice = await PDFGenerator.generateInvoice(order, payment);
        
        // Notify buyer
        await NotificationService.notifyPaymentVerification(id, order.buyer_id, 'verified', payment.amount);
        
        sendSuccess(res, 'Payment verified successfully', { invoice });
      } else if (action === 'reject') {
        await Payment.rejectPayment(id, adminId);
        
        // Update order status back to pending
        await Order.updateStatus(payment.order_id, 'pending');
        
        // Notify buyer
        await NotificationService.notifyPaymentVerification(id, payment.buyer_id, 'rejected', payment.amount);
        
        sendSuccess(res, 'Payment rejected');
      } else {
        return sendError(res, 'Invalid action', 400);
      }
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get pending payments (admin only)
  static async getPendingPayments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Payment.getPendingPayments(page, limit);

      const response = {
        payments: result.payments,
        pagination: getPaginationData(page, limit, result.pagination.total)
      };

      sendSuccess(res, 'Pending payments retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get payment statistics (admin only)
  static async getPaymentStats(req, res) {
    try {
      const stats = await Payment.getPaymentStats();

      sendSuccess(res, 'Payment statistics retrieved successfully', stats);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Generate receipt
  static async generateReceipt(req, res) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return sendError(res, 'Payment not found', 404);
      }

      // Check access
      const order = await Order.findById(payment.order_id);
      const hasAccess = (role === 'seller' && order.seller_user_id === userId) || 
                       (role === 'user' && order.buyer_id === userId) ||
                       role === 'admin';

      if (!hasAccess) {
        return sendError(res, 'Access denied', 403);
      }

      // Allow download for pending/paid payments as well as verified ones
      if (!['pending', 'verified'].includes(payment.status)) {
        return sendError(res, 'Receipt only available for pending or verified payments', 400);
      }

      const receipt = await PDFGenerator.generateReceipt(order, payment);

      res.download(receipt.filePath, receipt.fileName, (err) => {
        if (err) {
          if (!res.headersSent) {
            sendError(res, err.message, 500);
          }
        }
      });
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }
}

module.exports = PaymentController;