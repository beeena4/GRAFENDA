const express = require('express');
const { body } = require('express-validator');
const AdminController = require('../controllers/AdminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const updateUserValidation = [
  body('role').optional().isIn(['user', 'seller', 'admin']),
  body('is_verified').optional().isBoolean()
];

const processWithdrawValidation = [
  body('action').isIn(['approve', 'reject'])
];

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Dashboard
router.get('/dashboard/stats', AdminController.getDashboardStats);

// User management
router.get('/users', AdminController.getAllUsers);
router.put('/users/:id', updateUserValidation, AdminController.updateUser);

// Order management
router.get('/orders', AdminController.getAllOrders);

// Service management
router.get('/services', AdminController.getAllServices);

// Withdraw management
router.get('/withdraws', AdminController.getWithdrawRequests);
router.put('/withdraws/:id/process', processWithdrawValidation, AdminController.processWithdraw);

module.exports = router;