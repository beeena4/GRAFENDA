const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const withdrawRoutes = require('./routes/withdraws');
const reviewRoutes = require('./routes/reviews');
const profileRoutes = require('./routes/profile');

// Create Express app
const app = express();

// Middleware
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176'
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/withdraws', withdrawRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Grafenda API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;