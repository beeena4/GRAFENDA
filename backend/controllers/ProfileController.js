const { validationResult } = require('express-validator');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const { sendSuccess, sendError } = require('../utils/helpers');

class ProfileController {
  // Get user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      delete user.password_hash;

      let sellerProfile = null;
      if (user.role === 'seller') {
        sellerProfile = await SellerProfile.findByUserId(userId);
      }

      const response = {
        user,
        seller_profile: sellerProfile
      };

      sendSuccess(res, 'Profile retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const userId = req.user.id;
      const { name, email, phone, avatar } = req.body;

      if (email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return sendError(res, 'Email already in use', 400);
        }
      }

      await User.update(userId, { name, email, phone, avatar });

      const updatedUser = await User.findById(userId);
      delete updatedUser.password_hash;

      sendSuccess(res, 'Profile updated successfully', { user: updatedUser });
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Update seller profile
  static async updateSellerProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const userId = req.user.id;
      const role = req.user.role;

      if (role !== 'seller') {
        return sendError(res, 'Access denied', 403);
      }

      const {
        bio,
        skills,
        portfolio_url,
        location,
        social_links,
        experience_years,
        education,
        certifications
      } = req.body;

      // Normalize skills: terima string atau array
      const normalizeSkills = (val) => {
        if (val === undefined || val === null) return null;
        if (Array.isArray(val)) return JSON.stringify(val);
        return JSON.stringify(val.split(',').map(s => s.trim()).filter(Boolean));
      };

      let sellerProfile = await SellerProfile.findByUserId(userId);

      if (!sellerProfile) {
        const sellerProfileId = await SellerProfile.create({
          user_id: userId,
          bio,
          skills: normalizeSkills(skills) || '[]',
          portfolio_url,
          location,
          social_links: JSON.stringify(social_links || {}),
          experience_years,
          education: JSON.stringify(education || []),
          certifications: JSON.stringify(certifications || [])
        });
        sellerProfile = await SellerProfile.findById(sellerProfileId);
      } else {
        await SellerProfile.update(sellerProfile.id, {
          bio,
          skills: normalizeSkills(skills) || sellerProfile.skills,
          portfolio_url,
          location,
          social_links: social_links ? JSON.stringify(social_links) : sellerProfile.social_links,
          experience_years,
          education: education ? JSON.stringify(education) : sellerProfile.education,
          certifications: certifications ? JSON.stringify(certifications) : sellerProfile.certifications
        });
        sellerProfile = await SellerProfile.findById(sellerProfile.id);
      }

      sendSuccess(res, 'Seller profile updated successfully', { seller_profile: sellerProfile });
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get seller profile by user ID
  static async getSellerProfile(req, res) {
    try {
      const { user_id } = req.params;

      const user = await User.findById(user_id);
      if (!user || user.role !== 'seller') {
        return sendError(res, 'Seller not found', 404);
      }

      const sellerProfile = await SellerProfile.findByUserId(user_id);
      if (!sellerProfile) {
        return sendError(res, 'Seller profile not found', 404);
      }

      const Review = require('../models/Review');
      const stats = await Review.getSellerStats(sellerProfile.id);

      const response = {
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          created_at: user.created_at
        },
        seller_profile: sellerProfile,
        stats
      };

      sendSuccess(res, 'Seller profile retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Get seller portfolio
  static async getSellerPortfolio(req, res) {
    try {
      const { user_id } = req.params;

      const user = await User.findById(user_id);
      if (!user || user.role !== 'seller') {
        return sendError(res, 'Seller not found', 404);
      }

      const sellerProfile = await SellerProfile.findByUserId(user_id);
      if (!sellerProfile) {
        return sendError(res, 'Seller profile not found', 404);
      }

      const Service = require('../models/Service');
      const services = await Service.findBySellerId(sellerProfile.id, 1, 10);

      const Review = require('../models/Review');
      const reviews = await Review.findBySellerId(sellerProfile.id, 1, 5);

      const response = {
        seller_profile: sellerProfile,
        services: services.services,
        reviews: reviews.reviews
      };

      sendSuccess(res, 'Seller portfolio retrieved successfully', response);
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }
}

module.exports = ProfileController;