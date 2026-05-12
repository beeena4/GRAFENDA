const express = require('express');
const { body } = require('express-validator');
const WithdrawController = require('../controllers/WithdrawController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const requestWithdrawValidation = [
  body('amount').isFloat({ min: 50000 }), // Minimum 50k
  body('bank_name').trim().isLength({ min: 2 }),
  body('account_number').trim().isLength({ min: 10 }),
  body('account_holder').trim().isLength({ min: 2 })
];

// Routes
router.use(authenticateToken);

router.post('/request', authorizeRoles('seller'), requestWithdrawValidation, WithdrawController.requestWithdraw);
router.get('/seller', authorizeRoles('seller'), WithdrawController.getSellerWithdraws);
router.get('/:id', WithdrawController.getWithdrawById);
router.put('/:id/cancel', authorizeRoles('seller'), WithdrawController.cancelWithdraw);

module.exports = router;