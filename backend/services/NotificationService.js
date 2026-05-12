const Notification = require('../models/Notification');

class NotificationService {
  static io = null;

  static setSocketIO(io) {
    this.io = io;
  }

  static async createAndSendNotification(userId, notificationData, socketId = null) {
    const { title, message, type, related_id } = notificationData;

    // Create notification in database
    const notificationId = await Notification.create({
      user_id: userId,
      title,
      message,
      type,
      related_id
    });

    // Send real-time notification via socket
    if (this.io) {
      this.io.to(`user_${userId}`).emit('notification', {
        id: notificationId,
        title,
        message,
        type,
        related_id,
        created_at: new Date()
      });
    }

    return notificationId;
  }

  static async notifyOrderStatus(orderId, userId, status, orderTitle) {
    let title, message;

    switch (status) {
      case 'paid':
        title = 'Pembayaran Diterima';
        message = `Pembayaran untuk order "${orderTitle}" telah diterima. Seller akan segera memproses pesanan Anda.`;
        break;
      case 'process':
        title = 'Order Diproses';
        message = `Order "${orderTitle}" sedang diproses oleh seller.`;
        break;
      case 'revision':
        title = 'Revisi Diminta';
        message = `Seller meminta revisi untuk order "${orderTitle}". Silakan cek detail order.`;
        break;
      case 'completed':
        title = 'Order Selesai';
        message = `Order "${orderTitle}" telah selesai. Silakan berikan review dan rating.`;
        break;
      case 'cancelled':
        title = 'Order Dibatalkan';
        message = `Order "${orderTitle}" telah dibatalkan.`;
        break;
      default:
        title = 'Update Order';
        message = `Status order "${orderTitle}" telah diupdate menjadi ${status}.`;
    }

    return await this.createAndSendNotification(userId, {
      title,
      message,
      type: 'order',
      related_id: orderId
    });
  }

  static async notifyPaymentVerification(paymentId, userId, status, amount) {
    let title, message;

    if (status === 'verified') {
      title = 'Pembayaran Diverifikasi';
      message = `Pembayaran sebesar Rp${amount.toLocaleString()} telah diverifikasi dan order Anda aktif.`;
    } else if (status === 'rejected') {
      title = 'Pembayaran Ditolak';
      message = `Pembayaran sebesar Rp${amount.toLocaleString()} ditolak. Silakan upload ulang bukti pembayaran yang valid.`;
    }

    return await this.createAndSendNotification(userId, {
      title,
      message,
      type: 'payment',
      related_id: paymentId
    });
  }

  static async notifyNewMessage(chatId, receiverId, senderName, orderTitle) {
    const title = 'Pesan Baru';
    const message = `Anda menerima pesan baru dari ${senderName} untuk order "${orderTitle}".`;

    return await this.createAndSendNotification(receiverId, {
      title,
      message,
      type: 'chat',
      related_id: chatId
    });
  }

  static async notifyWithdrawStatus(withdrawId, userId, status, amount) {
    let title, message;

    if (status === 'approved') {
      title = 'Penarikan Disetujui';
      message = `Permintaan penarikan sebesar Rp${amount.toLocaleString()} telah disetujui dan akan diproses.`;
    } else if (status === 'rejected') {
      title = 'Penarikan Ditolak';
      message = `Permintaan penarikan sebesar Rp${amount.toLocaleString()} ditolak. Silakan cek kembali detail rekening.`;
    }

    return await this.createAndSendNotification(userId, {
      title,
      message,
      type: 'system',
      related_id: withdrawId
    });
  }

  static async notifyReviewReminder(orderId, userId, orderTitle) {
    const title = 'Tinggalkan Review';
    const message = `Order "${orderTitle}" telah selesai. Berikan review dan rating untuk membantu seller lainnya.`;

    return await this.createAndSendNotification(userId, {
      title,
      message,
      type: 'review',
      related_id: orderId
    });
  }

  static async notifySellerNewOrder(orderId, sellerId, buyerName, orderTitle) {
    const title = 'Order Baru';
    const message = `Anda menerima order baru "${orderTitle}" dari ${buyerName}.`;

    return await this.createAndSendNotification(sellerId, {
      title,
      message,
      type: 'order',
      related_id: orderId
    });
  }

  // Socket event handlers
  static handleSocketConnection(socket) {
    console.log('User connected:', socket.id);

    // Join user room
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room`);
    });

    // Leave user room
    socket.on('leave', (userId) => {
      socket.leave(`user_${userId}`);
      console.log(`User ${userId} left room`);
    });

    // Join order room for chat
    socket.on('join_order', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`User joined order room: ${orderId}`);
    });

    // Leave order room
    socket.on('leave_order', (orderId) => {
      socket.leave(`order_${orderId}`);
      console.log(`User left order room: ${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  }
}

module.exports = NotificationService;