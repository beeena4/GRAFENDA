const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

// Buyer Dashboard
router.get('/buyer', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await db.query(
      `SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_review,
        SUM(CASE WHEN status IN ('paid','process','revision') THEN 1 ELSE 0 END) as active_orders
       FROM orders WHERE buyer_id = ?`,
      [userId]
    );

    const chats = await db.query(
      `SELECT COUNT(*) as unread_chats FROM chats 
       WHERE receiver_id = ? AND is_read = 0`,
      [userId]
    );

    const recentOrders = await db.query(
      `SELECT o.id, o.status, o.price, o.created_at,
              s.title as service_title,
              u.full_name as seller_name
       FROM orders o
       JOIN services s ON o.service_id = s.id
       JOIN seller_profiles sp ON o.seller_id = sp.id
       JOIN users u ON sp.user_id = u.id
       WHERE o.buyer_id = ?
       ORDER BY o.created_at DESC LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        stats: {
          total_orders: orders[0].total_orders || 0,
          pending_review: orders[0].pending_review || 0,
          active_orders: orders[0].active_orders || 0,
          unread_chats: chats[0].unread_chats || 0
        },
        recent_orders: recentOrders
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Seller Dashboard
router.get('/seller', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const sellerProfile = await db.query(
      `SELECT id FROM seller_profiles WHERE user_id = ?`,
      [userId]
    );

    if (sellerProfile.length === 0) {
      return res.json({
        success: true,
        data: {
          stats: { total_orders: 0, active_orders: 0, balance: 0, pending_earnings: 0, rating: 0, total_earnings: 0 },
          active_orders: [],
          services: [],
          earnings: []
        }
      });
    }

    const sellerId = sellerProfile[0].id;

    const orders = await db.query(
      `SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status IN ('paid','process','revision') THEN 1 ELSE 0 END) as active_orders,
        SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END) as total_earnings,
        SUM(CASE WHEN status IN ('paid','process','revision') THEN price ELSE 0 END) as pending_earnings
       FROM orders WHERE seller_id = ?`,
      [sellerId]
    );

    // saldo seller (harusnya berubah setelah withdraw)
    const user = await db.query(
      `SELECT balance FROM users WHERE id = ?`,
      [userId]
    );



    const rating = await db.query(
      `SELECT AVG(rating) as avg_rating FROM reviews WHERE seller_id = ?`,
      [sellerId]
    );

    // Unread chat counter untuk seller (digunakan oleh dashboard “Chat Baru”)
    // chats.receiver_id menyimpan ID USER, sedangkan sellerId di sini adalah seller_profiles.id
    const unreadChats = await db.query(
      `SELECT COUNT(*) as unread_chats
       FROM chats
       WHERE receiver_id = ? AND is_read = 0`,
      [userId]
    );

    const activeOrders = await db.query(
      `SELECT o.id, o.status, o.price, o.delivery_days, o.created_at,
              s.title,
              u.full_name as buyer_name
       FROM orders o
       JOIN services s ON o.service_id = s.id
       JOIN users u ON o.buyer_id = u.id
       WHERE o.seller_id = ? AND o.status IN ('paid','process','revision')
       ORDER BY o.created_at DESC`,
      [sellerId]
    );

    const services = await db.query(
      `SELECT s.id, s.title, s.image_url as image,
              sp.price,
              COUNT(DISTINCT o.id) as total_orders,
              AVG(r.rating) as rating
       FROM services s
       LEFT JOIN service_packages sp ON s.id = sp.service_id AND sp.package_type = 'basic'
       LEFT JOIN orders o ON s.id = o.service_id
       LEFT JOIN reviews r ON o.id = r.order_id
       WHERE s.seller_id = ? AND s.is_active = 1
       GROUP BY s.id, sp.price`,
      [sellerId]
    );

    const earningsData = await db.query(
      `SELECT o.id, o.price as amount, o.status, o.created_at as date, s.title as description
       FROM orders o
       JOIN services s ON o.service_id = s.id
       WHERE o.seller_id = ?
       ORDER BY o.created_at DESC LIMIT 20`,
      [sellerId]
    );

    res.json({
      success: true,
      data: {
        stats: {
          total_orders: orders[0].total_orders || 0,
          active_orders: orders[0].active_orders || 0,
          balance: user[0]?.balance || 0,
          pending_earnings: orders[0].pending_earnings || 0,
          rating: rating[0]?.avg_rating || 0,
          total_earnings: orders[0].total_earnings || 0,
          unread_chats: unreadChats[0]?.unread_chats || 0
        },
        active_orders: activeOrders,
        services: services,
        earnings: earningsData
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;