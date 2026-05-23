const { validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const NotificationService = require('../services/NotificationService');
const PDFGenerator = require('../utils/pdfGenerator');
const { sendSuccess, sendError, getPaginationData } = require('../utils/helpers');
const pool = require('../config/database');

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

      // Move order into paid status once buyer has uploaded payment proof.
      // The payment remains in escrow until admin verifies/release after completion.
      if (order.status === 'pending') {
        await Order.updateStatus(order_id, 'paid');
      }

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
    let connection;
    try {
      const { id } = req.params;
      const { action } = req.body; // 'verify' or 'reject'
      const adminId = req.user.id;

      if (action === 'verify') {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Cari Data Order & Payment (menggunakan JOIN untuk mengambil harga dan ID seller)
        const [paymentRows] = await connection.query(`
          SELECT p.*, o.price, o.buyer_id, o.seller_id, o.title, sp.user_id AS seller_user_id
          FROM payments p
          JOIN orders o ON p.order_id = o.id
          LEFT JOIN seller_profiles sp ON o.seller_id = sp.id
          WHERE p.id = ? FOR UPDATE
        `, [id]);

        if (paymentRows.length === 0) {
          await connection.rollback();
          connection.release();
          return sendError(res, 'Payment not found', 404);
        }

        const paymentInfo = paymentRows[0];
        const sellerUserId = paymentInfo.seller_user_id || paymentInfo.seller_id;
        const orderPrice = paymentInfo.price;
        const orderId = paymentInfo.order_id;

        // 2. Update Status Pembayaran menjadi verified / released
        await connection.query(`
          UPDATE payments 
          SET status = 'verified', verified_by = ?, verified_at = NOW(),
              released_by = ?, released_at = NOW()
          WHERE id = ?
        `, [adminId, adminId, id]);

        // 3. Update Saldo Seller
        await connection.query(`
          UPDATE users 
          SET balance = balance + ? 
          WHERE id = ?
        `, [orderPrice, sellerUserId]);

        // 4. Update Status Order (Opsional: diatur ke 'paid' agar freelancer bisa mulai memproses pekerjaan)
        await connection.query(`
          UPDATE orders 
          SET status = 'paid' 
          WHERE id = ? AND status = 'pending'
        `, [orderId]);

        await connection.commit();
        connection.release();

        // -- Post-Transaction Logic (Berjalan setelah commit ke DB selesai) --
        const order = await Order.findById(orderId);
        const payment = await Payment.findById(id);
        
        let invoice = null;
        try {
          invoice = await PDFGenerator.generateInvoice(order, payment);
        } catch (err) {
          console.error("Gagal generate invoice:", err.message);
        }
        
        await NotificationService.notifyPaymentVerification(id, order.buyer_id, 'verified', paymentInfo.amount);
        
        await NotificationService.createAndSendNotification(sellerUserId, {
          title: 'Dana Escrow Dicairkan',
          message: `Dana sebesar Rp${Number(orderPrice).toLocaleString('id-ID')} telah dicairkan ke saldo Anda setelah verifikasi transaksi.`,
          type: 'payment',
          related_id: id
        });

        sendSuccess(res, 'Verifikasi berhasil dan dana langsung dicairkan ke penjual!', { invoice });
      } else {
        return sendError(res, 'Invalid action', 400);
      }
    } catch (error) {
      if (connection) {
        try {
          await connection.rollback();
          connection.release();
        } catch (rbError) {
          console.error('Error rolling back transaction:', rbError);
        }
      }
      sendError(res, error.message, 500);
    }
  }

  static async releasePayment(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const payment = await Payment.findById(id);
      if (!payment) {
        return sendError(res, 'Payment not found', 404);
      }

      if (!['pending', 'verified'].includes(payment.status)) {
        return sendError(res, 'Payment must be pending or verified and completed before funds can be released', 400);
      }

      const order = await Order.findById(payment.order_id);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      if (order.status !== 'completed') {
        return sendError(res, 'Order belum selesai. Transfer dana hanya boleh dilakukan setelah seller mengunggah hasil.', 400);
      }

      await Payment.releasePayment(id, adminId);
      await User.updateBalance(payment.seller_user_id, payment.order_price);

      await NotificationService.createAndSendNotification(
        payment.seller_user_id,
        {
          title: 'Dana Escrow Dicairkan',
          message: `Dana sebesar Rp${Number(payment.order_price).toLocaleString('id-ID')} telah dicairkan ke saldo Anda setelah verifikasi transaksi.`,
          type: 'payment',
          related_id: payment.id
        }
      );

      await NotificationService.createAndSendNotification(
        order.buyer_id,
        {
          title: 'Transaksi Diselesaikan',
          message: `Transaksi untuk order "${order.title}" telah diverifikasi dan dana telah dicairkan ke seller.`,
          type: 'payment',
          related_id: payment.id
        }
      );

      sendSuccess(res, 'Dana berhasil dicairkan ke seller');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get pending payments (admin only)
  static async getPendingReleasePayments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Payment.getPendingReleasePayments(page, limit);

      const response = {
        payments: result.payments,
        pagination: getPaginationData(page, limit, result.pagination.total)
      };

      sendSuccess(res, 'Pending release payments retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

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

  static async getAllTransactions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Payment.getAllTransactions(page, limit);

      const response = {
        transactions: result.transactions,
        pagination: getPaginationData(page, limit, result.pagination.total)
      };

      sendSuccess(res, 'Transactions retrieved successfully', response);
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