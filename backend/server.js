const http = require('http');
const socketIo = require('socket.io');
const winston = require('winston');
require('dotenv').config();

const app = require('./app');
const NotificationService = require('./services/NotificationService');
const ChatService = require('./services/ChatService');

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'http://127.0.0.1:5176'
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Socket.IO CORS policy: Origin ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Set Socket.IO instance in services
NotificationService.setSocketIO(io);
ChatService.setSocketIO(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined notification room`);
  });

  // Handle order room joining for chat
  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`User joined order room: ${orderId}`);
  });

  // Handle chat events
  ChatService.handleSocketConnection(socket);

  // Handle notification events
  NotificationService.handleSocketConnection(socket);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'grafenda-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Global logger
global.logger = logger;

// Error handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
const SOCKET_PORT = process.env.SOCKET_PORT || 5001;

server.listen(PORT, () => {
  logger.info(`Grafenda API server running on port ${PORT}`);
  logger.info(`Socket.IO server running on port ${SOCKET_PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = { server, io };