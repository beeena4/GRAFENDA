const { validationResult } = require('express-validator');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const Portfolio = require('../models/Portfolio');
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
        certifications,
        max_concurrent_orders
      } = req.body;

      // Normalize skills: terima string atau array
      const normalizeSkills = (val) => {
        if (val === undefined || val === null) return null;
        if (Array.isArray(val)) {
          return val.map(s => String(s).trim()).filter(Boolean).join(', ');
        }
        return String(val).split(',').map(s => s.trim()).filter(Boolean).join(', ');
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
          certifications: JSON.stringify(certifications || []),
          max_concurrent_orders: max_concurrent_orders !== undefined ? max_concurrent_orders : 5
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
          certifications: certifications ? JSON.stringify(certifications) : sellerProfile.certifications,
          max_concurrent_orders: max_concurrent_orders !== undefined ? max_concurrent_orders : sellerProfile.max_concurrent_orders
        });
        sellerProfile = await SellerProfile.findById(sellerProfile.id);
      }

      sendSuccess(res, 'Seller profile updated successfully', { seller_profile: sellerProfile });
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  // Add seller portfolio entry
  static async addSellerPortfolio(req, res) {
    try {
      const userId = req.user.id;
      if (req.user.role !== 'seller') {
        return sendError(res, 'Access denied', 403);
      }

      const sellerProfile = await SellerProfile.findByUserId(userId);
      if (!sellerProfile) {
        return sendError(res, 'Seller profile not found', 404);
      }

      const { title, description, project_url } = req.body;
      if (!title || title.trim() === '') {
        return sendError(res, 'Judul portofolio diperlukan', 400);
      }

      if (!req.files || req.files.length === 0) {
        return sendError(res, 'File gambar portofolio diperlukan', 400);
      }

      const createdPortfolios = [];
      for (const file of req.files) {
        const imageUrl = `/uploads/${file.filename}`;
        const portfolioId = await Portfolio.create({
          seller_id: sellerProfile.id,
          title: title.trim(),
          description: description || null,
          image_url: imageUrl,
          project_url: project_url || null
        });

        const portfolioItem = {
          id: portfolioId,
          seller_id: sellerProfile.id,
          title: title.trim(),
          description: description || null,
          image_url: imageUrl,
          project_url: project_url || null,
          created_at: new Date().toISOString()
        };
        createdPortfolios.push(portfolioItem);
      }

      sendSuccess(res, 'Portofolio berhasil ditambahkan', { portfolios: createdPortfolios });
    } catch (error) {
      sendError(res, error.message, 500);
    }
  }

  static async deleteSellerPortfolio(req, res) {
    try {
      const userId = req.user.id;
      if (req.user.role !== 'seller') {
        return sendError(res, 'Access denied', 403);
      }

      const sellerProfile = await SellerProfile.findByUserId(userId);
      if (!sellerProfile) {
        return sendError(res, 'Seller profile not found', 404);
      }

      const portfolioId = req.params.id;
      const portfolioItem = await Portfolio.findById(portfolioId, sellerProfile.id);
      if (!portfolioItem) {
        return sendError(res, 'Portofolio tidak ditemukan atau tidak dapat dihapus', 404);
      }

      const deletedRows = await Portfolio.deleteById(portfolioId, sellerProfile.id);
      if (!deletedRows) {
        return sendError(res, 'Portofolio tidak ditemukan atau tidak dapat dihapus', 404);
      }

      const fs = require('fs');
      const path = require('path');
      if (portfolioItem.image_url) {
        const filename = portfolioItem.image_url.replace(/^\/uploads\//, '');
        const filePath = path.join(__dirname, '../uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      sendSuccess(res, 'Portofolio berhasil dihapus');
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

      const parseSkills = (value) => {
        if (!value) return '';
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return parsed.filter(Boolean).join(', ');
          }
        } catch (err) {
          // not JSON, continue
        }
        return String(value);
      };

      const response = {
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          created_at: user.created_at
        },
        seller_profile: {
          ...sellerProfile,
          skills: parseSkills(sellerProfile.skills)
        },
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
      const portfolios = await Portfolio.findBySellerId(sellerProfile.id);

      const response = {
        seller_profile: sellerProfile,
        portfolios,
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