const { validationResult } = require('express-validator');
const AuthService = require('../services/AuthService');
const { sendSuccess, sendError } = require('../utils/helpers');

class AuthController {
  // Register user
  static async register(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const { email, password, full_name, phone, role } = req.body;

      const result = await AuthService.register({
        email,
        password,
        full_name,
        phone,
        role
      });

      sendSuccess(res, 'User registered successfully', result, 201);
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  // Login user
  static async login(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      sendSuccess(res, 'Login successful', result);
    } catch (error) {
      sendError(res, error.message, 401);
    }
  }

  // Get profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const profile = await AuthService.getProfile(userId);

      sendSuccess(res, 'Profile retrieved successfully', profile);
    } catch (error) {
      sendError(res, error.message, 404);
    }
  }

  // Update profile
  static async updateProfile(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const userId = req.user.id;
      const updateData = req.body;

      if (req.file) {
        updateData.avatar = `/uploads/${req.file.filename}`;
      }

      const updatedProfile = await AuthService.updateProfile(userId, updateData);

      sendSuccess(res, 'Profile updated successfully', updatedProfile);
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const userId = req.user.id;
      const { current_password, new_password } = req.body;

      const result = await AuthService.changePassword(userId, current_password, new_password);

      sendSuccess(res, result.message);
    } catch (error) {
      sendError(res, error.message, 400);
    }
  }

  // Logout (client-side token removal)
  static async logout(req, res) {
    try {
      // In a stateless JWT system, logout is handled client-side
      // You might want to implement token blacklisting for enhanced security
      sendSuccess(res, 'Logged out successfully');
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }
}

module.exports = AuthController;