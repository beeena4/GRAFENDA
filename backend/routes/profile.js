const express = require('express');
const { body } = require('express-validator');
const ProfileController = require('../controllers/ProfileController');
const { authenticateToken } = require('../middleware/auth');
const { uploadPortfolio } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone('any'),
  body('avatar').optional().isURL()
];

const updateSellerProfileValidation = [
  body('bio').optional().isLength({ max: 1000 }),
  body('skills').optional(),
  body('portfolio_url').optional({ checkFalsy: true }).isURL(),
  body('location').optional().trim(),
  body('social_links').optional().isObject(),
  body('experience_years').optional().isInt({ min: 0, max: 50 }),
  body('education').optional().isArray(),
  body('certifications').optional().isArray()
];

const addSellerPortfolioValidation = [
  body('title').notEmpty().withMessage('Judul portofolio diperlukan'),
  body('description').optional().isLength({ max: 1000 }),
  body('project_url').optional({ checkFalsy: true }).isURL()
];

// Routes
router.use(authenticateToken);

router.get('/', ProfileController.getProfile);
router.put('/', updateProfileValidation, ProfileController.updateProfile);
router.put('/seller', updateSellerProfileValidation, ProfileController.updateSellerProfile);
router.post('/portfolio', uploadPortfolio, addSellerPortfolioValidation, ProfileController.addSellerPortfolio);
router.delete('/portfolio/:id', ProfileController.deleteSellerPortfolio);
router.get('/seller/:user_id', ProfileController.getSellerProfile);
router.get('/portfolio/:user_id', ProfileController.getSellerPortfolio);

module.exports = router;