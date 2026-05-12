const express = require('express');
const { body } = require('express-validator');
const ServiceController = require('../controllers/ServiceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createServiceValidation = [
  body('category_id').isInt({ min: 1 }),
  body('title').trim().isLength({ min: 5, max: 255 }),
  body('description').trim().isLength({ min: 20 }),
  body('tags').optional().trim(),
  body('packages').isArray({ min: 1 }),
  body('packages.*.package_type').isIn(['basic', 'standard', 'premium']),
  body('packages.*.name').trim().isLength({ min: 2, max: 100 }),
  body('packages.*.description').optional().trim(),
  body('packages.*.price').isFloat({ min: 10000 }),
  body('packages.*.delivery_days').isInt({ min: 1, max: 365 }),
  body('packages.*.revisions').optional().isInt({ min: 0 }),
  body('packages.*.features').optional().isArray()
];

const updateServiceValidation = [
  body('title').optional().trim().isLength({ min: 5, max: 255 }),
  body('description').optional().trim().isLength({ min: 20 }),
  body('tags').optional().trim(),
  body('category_id').optional().isInt({ min: 1 }),
  body('is_featured').optional().isBoolean(),
  body('is_active').optional().isBoolean()
];

// Public routes
router.get('/', ServiceController.getServices);
router.get('/featured', ServiceController.getFeaturedServices);
router.get('/:id', ServiceController.getServiceById);

// Seller routes
router.use(authenticateToken);
router.get('/seller/my-services', authorizeRoles('seller'), ServiceController.getSellerServices);
router.post('/', authorizeRoles('seller'), createServiceValidation, ServiceController.createService);
router.put('/:id', authorizeRoles('seller'), updateServiceValidation, ServiceController.updateService);
router.delete('/:id', authorizeRoles('seller'), ServiceController.deleteService);

module.exports = router;