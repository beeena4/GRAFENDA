const express = require('express');
const { body } = require('express-validator');
const OrderController = require('../controllers/OrderController');
const { authenticateToken } = require('../middleware/auth');
const { uploadOrderResult } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('service_id').isInt({ min: 1 }),
  body('package_id').isInt({ min: 1 }),
  body('title').optional().trim().isLength({ min: 5, max: 255 }),
  body('description').optional().trim().isLength({ max: 1000 })
];

const updateStatusValidation = [
  body('status').isIn(['pending', 'accepted', 'paid', 'process', 'revision', 'completed', 'cancelled'])
];

// Routes
router.use(authenticateToken);

router.post('/', createOrderValidation, OrderController.createOrder);
router.get('/', OrderController.getUserOrders);
router.get('/stats', OrderController.getOrderStats);
router.get('/:id', OrderController.getOrderById);
router.put('/:id/status', updateStatusValidation, OrderController.updateOrderStatus);
router.post('/:id/result', uploadOrderResult, OrderController.uploadOrderResult);
router.put('/:id/cancel', OrderController.cancelOrder);
router.put('/:id/revision', OrderController.requestRevision);

module.exports = router;