const express = require('express');
const { body } = require('express-validator');
const PaymentController = require('../controllers/PaymentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { uploadPaymentProof } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const uploadPaymentValidation = [
  body('order_id').isInt({ min: 1 }),
  body('payment_method').isIn(['bank_transfer', 'virtual_account', 'e_wallet', 'transfer', 'va', 'ewallet'])
];

const verifyPaymentValidation = [
  body('action').isIn(['verify', 'reject'])
];

// Routes
router.use(authenticateToken);

router.post('/upload-proof', uploadPaymentProof, uploadPaymentValidation, PaymentController.uploadPaymentProof);
router.get('/order/:orderId', PaymentController.getPaymentByOrderId);
router.get('/:paymentId/receipt', PaymentController.generateReceipt);

// Admin routes
router.get('/admin/pending', authorizeRoles('admin'), PaymentController.getPendingPayments);
router.get('/admin/stats', authorizeRoles('admin'), PaymentController.getPaymentStats);
router.put('/:id/verify', authorizeRoles('admin'), verifyPaymentValidation, PaymentController.verifyPayment);

module.exports = router;