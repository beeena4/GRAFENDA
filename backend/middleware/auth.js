const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retry query jika ECONNRESET
    let users;
    for (let i = 0; i < 3; i++) {
      try {
        users = await query(
          'SELECT id, email, full_name, role, is_verified FROM users WHERE id = ?',
          [decoded.id]
        );
        break;
      } catch (dbError) {
        if (dbError.code === 'ECONNRESET' && i < 2) {
          await new Promise(res => setTimeout(res, 500));
          continue;
        }
        throw dbError;
      }
    }

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    user.role = user.role === 'buyer' ? 'user' : user.role;

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.code, error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};