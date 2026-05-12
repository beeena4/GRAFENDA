const { validationResult } = require('express-validator');
const Withdraw = require('../models/Withdraw');
const User = require('../models/User');
const NotificationService = require('../services/NotificationService');
const { sendSuccess, sendError, getPaginationData } = require('../utils/helpers');

class WithdrawController {
  // Request withdraw
  static async requestWithdraw(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const { amount, bank_name, account_number, account_holder } = req.body;
      const userId = req.user.id;

      // Get seller profile
      const SellerProfile = require('../models/SellerProfile');
      const sellerProfile = await SellerProfile.findByUserId(userId);
      if (!sellerProfile) {
        return sendError(res, 'Seller profile not found', 404);
      }

      // Check balance
      const hasBalance = await Withdraw.checkSellerBalance(sellerProfile.id, amount);
      if (!hasBalance) {
        return sendError(res, 'Insufficient balance', 400);
      }

      // Create withdraw request
      const withdrawId = await Withdraw.create({
        seller_id: sellerProfile.id,
        amount,
        bank_name,
        account_number,
        account_holder
      });

      // Notify admin (you might want to implement admin notification)
      // await NotificationService.notifyAdminNewWithdraw(withdrawId, ...);

      const withdraw = await Withdraw.findById(withdrawId);
      sendSuccess(res, 'Withdraw request submitted successfully', withdraw, 201);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get seller withdraws
  static async getSellerWithdraws(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Get seller profile
      const SellerProfile = require('../models/SellerProfile');
      const sellerProfile = await SellerProfile.findByUserId(userId);
      if (!sellerProfile) {
        return sendError(res, 'Seller profile not found', 404);
      }

      const result = await Withdraw.findBySellerId(sellerProfile.id, page, limit);

      const response = {
        withdraws: result.withdraws,
        pagination: getPaginationData(page, limit, result.pagination.total)
      };

      sendSuccess(res, 'Withdraws retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get withdraw details
  static async getWithdrawById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      const withdraw = await Withdraw.findById(id);
      if (!withdraw) {
        return sendError(res, 'Withdraw not found', 404);
      }

      // Check access (seller can see their own, admin can see all)
      const SellerProfile = require('../models/SellerProfile');
      const sellerProfile = await SellerProfile.findByUserId(userId);
      
      const hasAccess = (role === 'seller' && sellerProfile && sellerProfile.id === withdraw.seller_id) || role === 'admin';
      if (!hasAccess) {
        return sendError(res, 'Access denied', 403);
      }

      sendSuccess(res, 'Withdraw details retrieved successfully', withdraw);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Cancel withdraw (if still pending)
  static async cancelWithdraw(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Get seller profile
      const SellerProfile = require('../models/SellerProfile');
      const sellerProfile = await SellerProfile.findByUserId(userId);
      if (!sellerProfile) {
        return sendError(res, 'Seller profile not found', 404);
      }

      const withdraw = await Withdraw.findById(id);
      if (!withdraw) {
        return sendError(res, 'Withdraw not found', 404);
      }

      // Check ownership
      if (withdraw.seller_id !== sellerProfile.id) {
        return sendError(res, 'Access denied', 403);
      }

      // Can only cancel pending withdraws
      if (withdraw.status !== 'pending') {
        return sendError(res, 'Cannot cancel withdraw with current status', 400);
      }

      // Update status to cancelled
      const { query } = require('../config/database');
      await query('UPDATE withdraws SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

      sendSuccess(res, 'Withdraw cancelled successfully');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }
}

module.exports = WithdrawController;