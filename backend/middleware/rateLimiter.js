const rateLimit = require('express-rate-limit');

// Helper: bypass rate limit untuk endpoint chat/unread agar polling tidak memicu 429
// (Tetap menjaga rate-limit untuk endpoint lain)
const bypassChatPolling = (req) => {
  const url = req.originalUrl || req.url || '';
  // Endpoint yang dipakai untuk polling unread chat biasanya masuk ke /api/chat
  // dan berisi kata kunci chats/unread/list.
  return (
    url.startsWith('/api/chat') && /(chats|userChats|unread|list)/i.test(url)
  );
};

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // longgarkan dari 300 -> 1000
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => bypassChatPolling(req),
});


// Auth rate limiter (more restrictive)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: {
    success: false,
    message: 'Upload limit exceeded, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter
};