const express = require('express');
const { body } = require('express-validator');
const ChatController = require('../controllers/ChatController');
const { authenticateToken } = require('../middleware/auth');
const { uploadChatFile } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const sendMessageValidation = [
  body('order_id').isInt({ min: 1 }),
  body('receiver_id').isInt({ min: 1 }),
  body('message').optional().trim().isLength({ max: 1000 }),
  body('message_type').optional().isIn(['text', 'image', 'file']),
  body('file_url').optional().isURL()
];

// Routes
router.use(authenticateToken);

router.post('/send', sendMessageValidation, ChatController.sendMessage);
router.get('/order/:orderId', ChatController.getOrderMessages);
router.get('/user/chats', ChatController.getUserChats);
router.get('/stats', ChatController.getChatStats);
router.put('/order/:orderId/read', ChatController.markAsRead);

// File upload for chat
router.post('/upload', uploadChatFile, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  res.json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      file_url: `/uploads/chats/${req.file.filename}`,
      file_name: req.file.originalname,
      file_size: req.file.size
    }
  });
});

module.exports = router;