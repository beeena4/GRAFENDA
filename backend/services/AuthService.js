const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const { sendEmail } = require('../utils/email');

class AuthService {
  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }

  static async register(userData) {
    const { email, password, full_name, phone, role = 'user', skills = '', portfolio_url = '' } = userData;
    const appRole = role === 'seller' ? 'seller' : 'user';

    console.log('AuthService.register userData:', { email, password: !!password, full_name, phone, role: appRole, skills, portfolio_url });

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
        skills: skills || '',
        experience_years: 0,
        portfolio_url: portfolio_url || ''
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
      throw new Error('Incorrect password');
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

  static async forgotPassword(email) {
    const user = await User.findByEmail(email);
    if (!user) {
      return { message: 'Instruksi reset password telah dikirim ke email Anda jika terdaftar.' };
    }

    const secret = process.env.RESET_PASSWORD_SECRET || process.env.JWT_SECRET;
    const token = jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn: '1h' }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const html = `
      <p>Halo ${user.full_name || user.email},</p>
      <p>Kami menerima permintaan reset password untuk akun Anda.</p>
      <p>Klik tautan berikut untuk mengatur ulang password Anda:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>Jika Anda tidak meminta reset password, abaikan pesan ini.</p>
    `;

    let emailResult;
    try {
      emailResult = await sendEmail({
        to: user.email,
        subject: 'Reset Password Grafenda',
        text: `Klik link berikut untuk reset password: ${resetUrl}`,
        html,
      });
    } catch (emailError) {
      console.warn('Failed to send reset email:', emailError.message);
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Gagal mengirim email reset password. Silakan periksa konfigurasi SMTP.');
      }

      return {
        message: 'Gagal mengirim email reset. Gunakan link reset di bawah ini untuk pengujian.',
        resetUrl,
        previewUrl: null,
      };
    }

    const response = {
      message: 'Instruksi reset password telah dikirim ke email Anda jika terdaftar.',
      previewUrl: emailResult.previewUrl || null,
    };

    if (process.env.NODE_ENV !== 'production') {
      response.resetUrl = resetUrl;
    }

    return response;
  }

  static async resetPassword(token, newPassword) {
    const secret = process.env.RESET_PASSWORD_SECRET || process.env.JWT_SECRET;
    let payload;

    try {
      payload = jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Token reset password tidak valid atau sudah kedaluwarsa. Silakan minta ulang melalui halaman lupa password.');
    }

    const user = await User.findById(payload.id);
    if (!user) {
      throw new Error('Pengguna tidak ditemukan.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.updatePassword(user.id, hashedPassword);

    return { message: 'Password berhasil diperbarui. Silakan masuk dengan password baru Anda.' };
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

        profile.seller_profile = {
          bio: sellerProfile.bio,
          skills: parseSkills(sellerProfile.skills),
          experience_years: sellerProfile.experience_years,
          portfolio_url: sellerProfile.portfolio_url,
          location: sellerProfile.location,
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

    if (updateData.full_name !== undefined || updateData.phone !== undefined || updateData.avatar !== undefined) {
      await User.updateProfile(userId, {
        full_name: updateData.full_name !== undefined ? updateData.full_name : user.full_name,
        phone: updateData.phone !== undefined ? updateData.phone : user.phone,
        avatar: updateData.avatar !== undefined ? updateData.avatar : user.avatar
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

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.updatePassword(userId, hashedPassword);

    return { message: 'Password changed successfully' };
  }
}

module.exports = AuthService;
