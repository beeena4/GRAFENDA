const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const Order = require('../models/Order');
const NotificationService = require('../services/NotificationService');
const { sendSuccess, sendError, getPaginationData } = require('../utils/helpers');

class ReviewController {
  // Create review
  static async createReview(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const { order_id, rating, comment } = req.body;
      const userId = req.user.id;

      // Check if order exists and belongs to user
      const order = await Order.findById(order_id);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      if (order.buyer_id !== userId) {
        return sendError(res, 'Access denied', 403);
      }

      // Check if order is completed
      if (order.status !== 'completed') {
        return sendError(res, 'Can only review completed orders', 400);
      }

      // Check if review already exists
      const canReview = await Review.canReview(order_id, userId);
      if (!canReview) {
        return sendError(res, 'Review already exists for this order', 400);
      }

      // Create review
      const reviewId = await Review.create({
        order_id,
        buyer_id: userId,
        seller_id: order.seller_id,
        rating,
        comment
      });

      // Update seller stats
      await Review.updateSellerStats(order.seller_id);

      // Notify seller
      await NotificationService.createAndSendNotification(
        order.seller_id,
        'review_received',
        `You received a ${rating}-star review`,
        { order_id, review_id: reviewId }
      );

      const review = await Review.findById(reviewId);
      sendSuccess(res, 'Review created successfully', review, 201);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get reviews for seller
  static async getSellerReviews(req, res) {
    try {
      const { seller_id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Review.findBySellerId(seller_id, page, limit);

      const response = {
        reviews: result.reviews,
        pagination: getPaginationData(page, limit, result.pagination.total)
      };

      sendSuccess(res, 'Seller reviews retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get review by ID
  static async getReviewById(req, res) {
    try {
      const { id } = req.params;

      const review = await Review.findById(id);
      if (!review) {
        return sendError(res, 'Review not found', 404);
      }

      sendSuccess(res, 'Review retrieved successfully', review);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Update review (only by buyer who created it)
  static async updateReview(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      const review = await Review.findById(id);
      if (!review) {
        return sendError(res, 'Review not found', 404);
      }

      // Check ownership
      if (review.buyer_id !== userId) {
        return sendError(res, 'Access denied', 403);
      }

      // Update review
      await Review.update(id, { rating, comment });

      // Update seller stats
      await Review.updateSellerStats(review.seller_id);

      const updatedReview = await Review.findById(id);
      sendSuccess(res, 'Review updated successfully', updatedReview);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Delete review (only by buyer who created it)
  static async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const review = await Review.findById(id);
      if (!review) {
        return sendError(res, 'Review not found', 404);
      }

      // Check ownership
      if (review.buyer_id !== userId) {
        return sendError(res, 'Access denied', 403);
      }

      // Delete review
      await Review.delete(id);

      // Update seller stats
      await Review.updateSellerStats(review.seller_id);

      sendSuccess(res, 'Review deleted successfully');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get seller stats
  static async getSellerStats(req, res) {
    try {
      const { seller_id } = req.params;

      const stats = await Review.getSellerStats(seller_id);

      sendSuccess(res, 'Seller stats retrieved successfully', stats);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }
}

module.exports = ReviewController;