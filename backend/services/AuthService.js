const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');

class AuthService {
  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }

  static async register(userData) {
    const { email, password, full_name, phone, role = 'user' } = userData;
    const appRole = role === 'seller' ? 'seller' : 'user';

    console.log('AuthService.register userData:', { email, password: !!password, full_name, phone, role: appRole });

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const userId = await User.create({
      email,
      password,
      full_name,
      phone,
      role: appRole
    });

    if (appRole === 'seller') {
      await SellerProfile.create({
        user_id: userId,
        bio: '',
        skills: '',
        experience_years: 0
      });
    }

    const user = await User.findById(userId);
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_verified: user.is_verified
      },
      token
    };
  }

  static async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        is_verified: user.is_verified,
        balance: user.balance
      },
      token
    };
  }

  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let profile = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      is_verified: user.is_verified,
      balance: user.balance,
      created_at: user.created_at
    };

    if (user.role === 'seller') {
      const sellerProfile = await SellerProfile.findByUserId(userId);
      if (sellerProfile) {
        profile.seller_profile = {
          bio: sellerProfile.bio,
          skills: sellerProfile.skills,
          experience_years: sellerProfile.experience_years,
          portfolio_url: sellerProfile.portfolio_url,
          rating: sellerProfile.rating,
          total_reviews: sellerProfile.total_reviews,
          total_orders: sellerProfile.total_orders,
          completion_rate: sellerProfile.completion_rate,
          response_time: sellerProfile.response_time,
          is_active: sellerProfile.is_active,
          max_concurrent_orders: sellerProfile.max_concurrent_orders
        };
      }
    }

    return profile;
  }

  static async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (updateData.full_name || updateData.phone || updateData.avatar) {
      await User.updateProfile(userId, {
        full_name: updateData.full_name,
        phone: updateData.phone,
        avatar: updateData.avatar
      });
    }

    if (user.role === 'seller' && (updateData.bio || updateData.skills || updateData.experience_years || updateData.portfolio_url || updateData.max_concurrent_orders)) {
      await SellerProfile.updateProfile(userId, {
        bio: updateData.bio,
        skills: updateData.skills,
        experience_years: updateData.experience_years,
        portfolio_url: updateData.portfolio_url,
        max_concurrent_orders: updateData.max_concurrent_orders
      });
    }

    return await this.getProfile(userId);
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await User.verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const { query } = require('../config/database');
    await query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, userId]);

    return { message: 'Password changed successfully' };
  }
}

module.exports = AuthService;
