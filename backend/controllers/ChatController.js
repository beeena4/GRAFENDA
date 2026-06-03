const { validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const ChatService = require('../services/ChatService');
const Order = require('../models/Order');
const { sendSuccess, sendError } = require('../utils/helpers');

// 1. KONEKSI PINTAS KE SUPABASE CLOUD
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

class ChatController {
  // Send message (DIPERBARUI UNTUK SUPABASE STORAGE)
  static async sendMessage(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const { order_id, receiver_id, message, message_type = 'text', file_url = null } = req.body;
      const sender_id = req.user.id;

      // Check if order exists and user has access
      const order = await Order.findById(order_id);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      const hasAccess = order.buyer_id === sender_id || order.seller_user_id === sender_id;
      if (!hasAccess) {
        return sendError(res, 'Access denied', 403);
      }

      // Check if receiver is valid for this order
      const isValidReceiver = receiver_id === order.buyer_id || receiver_id === order.seller_user_id;
      if (!isValidReceiver) {
        return sendError(res, 'Invalid receiver', 400);
      }

      // PROSES UPLOAD FILE CHAT KE SUPABASE JIKA PENGGUNA MENGIRIM BERKAS/GAMBAR
      let finalFileUrl = file_url; // Default ambil dari req.body jika berupa text string
      
      if (req.file) {
        // Buat nama file unik khusus chat agar tidak bentrok
        const fileName = `chat-${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;

        // Upload file dari buffer RAM ke Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('grafenda-bucket')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype
          });

        if (uploadError) throw new Error("Gagal kirim lampiran chat ke cloud: " + uploadError.message);

        // Dapatkan URL publik file dari Supabase Storage
        const { data: urlData } = supabase.storage
          .from('grafenda-bucket')
          .getPublicUrl(fileName);

        finalFileUrl = urlData.publicUrl;
      }

      // DEBUG: lihat payload akhir yang akan dikirim ke service database
      console.log('[chat/send] Final Payload =', {
        order_id, sender_id, receiver_id, message, message_type, file_url: finalFileUrl
      });

      const chatMessage = await ChatService.sendMessage({
        order_id,
        sender_id,
        receiver_id,
        message,
        message_type,
        file_url: finalFileUrl // Menggunakan URL publik Supabase Cloud
      });

      sendSuccess(res, 'Message sent successfully', chatMessage);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get order messages (TIDAK ADA PERUBAHAN)
  static async getOrderMessages(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const order = await Order.findById(orderId);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      const hasAccess = order.buyer_id === userId || order.seller_user_id === userId;
      if (!hasAccess) {
        return sendError(res, 'Access denied', 403);
      }

      const messages = await ChatService.getOrderMessages(orderId, userId, page, limit);

      sendSuccess(res, 'Messages retrieved successfully', messages);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get user chats (TIDAK ADA PERUBAHAN)
  static async getUserChats(req, res) {
    try {
      const userId = req.user.id;
      const chats = await ChatService.getUserChats(userId);

      sendSuccess(res, 'Chats retrieved successfully', chats);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get chat statistics (TIDAK ADA PERUBAHAN)
  static async getChatStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await ChatService.getChatStats(userId);

      sendSuccess(res, 'Chat statistics retrieved successfully', stats);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Mark messages as read (TIDAK ADA PERUBAHAN)
  static async markAsRead(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const order = await Order.findById(orderId);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }

      const hasAccess = order.buyer_id === userId || order.seller_user_id === userId;
      if (!hasAccess) {
        return sendError(res, 'Access denied', 403);
      }

      await Chat.markAsRead(orderId, userId);

      sendSuccess(res, 'Messages marked as read');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }
}

module.exports = ChatController;