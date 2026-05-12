const express = require('express');
const { body } = require('express-validator');
const ReviewController = require('../controllers/ReviewController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createReviewValidation = [
  body('order_id').isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 1000 })
];

const updateReviewValidation = [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 1000 })
];

// Routes
router.use(authenticateToken);

router.post('/', createReviewValidation, ReviewController.createReview);
router.get('/seller/:seller_id', ReviewController.getSellerReviews);
router.get('/stats/:seller_id', ReviewController.getSellerStats);
router.get('/:id', ReviewController.getReviewById);
router.put('/:id', updateReviewValidation, ReviewController.updateReview);
router.delete('/:id', ReviewController.deleteReview);

module.exports = router;