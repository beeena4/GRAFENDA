const express = require('express');
const { body } = require('express-validator');
const ChatController = require('../controllers/ChatController');
const { authenticateToken } = require('../middleware/auth');
const { uploadChatFile } = require('../middleware/upload');
const { uploadChatFileToSupabase } = require('../utils/supabaseStorage');

const router = express.Router();

// Validation rules
const sendMessageValidation = [
  body('order_id').isInt({ min: 1 }),
  body('receiver_id').isInt({ min: 1 }),
  body('message').optional().trim().isLength({ max: 1000 }),
  body('message_type').optional().isIn(['text', 'image', 'file']),
  body('file_url').optional().custom((v) => {
    if (!v) return true;
    // frontend/backends sometimes send relative URLs like /uploads/...
    if (typeof v === 'string' && v.startsWith('/')) return true;
    // allow absolute URLs
    try {
      new URL(v);
      return true;
    } catch (e) {
      throw new Error('file_url must be a valid absolute or relative URL');
    }
  })
];

// Routes
router.use(authenticateToken);

router.post('/send', sendMessageValidation, ChatController.sendMessage);
router.get('/order/:orderId', ChatController.getOrderMessages);
router.get('/user/chats', ChatController.getUserChats);
router.get('/stats', ChatController.getChatStats);
router.put('/order/:orderId/read', ChatController.markAsRead);

// File upload for chat (Endpoint terpisah jika frontend menggunakannya)
router.post('/upload', uploadChatFile, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  try {
    const { url } = await uploadChatFileToSupabase(req.file.buffer, req.file.originalname);
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        file_url: url,
        file_name: req.file.originalname,
        file_size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload lampiran chat gagal:', error.message);
    res.status(500).json({
      success: false,
      message: `Gagal upload lampiran chat: ${error.message}`
    });
  }
});

module.exports = router;