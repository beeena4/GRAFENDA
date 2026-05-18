const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { uploadAvatar } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('full_name').trim().isLength({ min: 2 }),
  body('phone').optional({ nullable: true, checkFalsy: true }).isMobilePhone('any'),
  body('role').optional().isIn(['user', 'seller'])
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const updateProfileValidation = [
  body('full_name').optional().trim().isLength({ min: 2 }),
  body('phone').optional({ nullable: true, checkFalsy: true }).isMobilePhone('any'),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('skills').optional().trim(),
  body('experience_years').optional().isInt({ min: 0 }),
  body('portfolio_url').optional({ checkFalsy: true }).isURL(),
  body('max_concurrent_orders').optional().isInt({ min: 1, max: 10 })
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail()
];

const changePasswordValidation = [
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 8 })
];

const resetPasswordValidation = [
  body('token').notEmpty(),
  body('new_password').isLength({ min: 8 })
];

const handleProfileUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    uploadAvatar(req, res, (error) => {
      if (error) return next(error);
      return next();
    });
  } else {
    return next();
  }
};

// Routes
router.post('/register', authLimiter, registerValidation, AuthController.register);
router.post('/login', authLimiter, loginValidation, AuthController.login);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidation, AuthController.resetPassword);
router.post('/logout', authenticateToken, AuthController.logout);

router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, handleProfileUpload, updateProfileValidation, AuthController.updateProfile);
router.put('/change-password', authenticateToken, changePasswordValidation, AuthController.changePassword);

module.exports = router;