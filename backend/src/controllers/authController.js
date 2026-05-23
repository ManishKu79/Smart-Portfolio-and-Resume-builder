const User = require('../models/User');
<<<<<<< HEAD
const tokenService = require('../services/tokenService');
const emailService = require('../services/emailService');
=======
const jwt = require('jsonwebtoken');
>>>>>>> 804ddfb (changes)
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

<<<<<<< HEAD
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
=======
// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  });
};

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      isVerified: true // Auto-verify users on registration
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    await user.addRefreshToken(refreshToken, req.headers['user-agent'], req.ip);

    // Add login history
    await user.addLoginHistory(req.ip, req.headers['user-agent'], true);

    // Remove password from response
    const userData = user.toObject();
    delete userData.password;

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        user: userData,
        token,
        refreshToken
>>>>>>> 804ddfb (changes)
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        password,
        isVerified: false
      });

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email (don't wait for response)
      emailService.sendVerificationEmail(user, verificationToken).catch(err => {
        logger.error('Failed to send verification email:', err);
      });

      // Generate tokens
      const accessToken = tokenService.generateAccessToken(user._id);
      const refreshToken = tokenService.generateRefreshToken(user._id);

      // Store refresh token
      await user.addRefreshToken(refreshToken, req.headers['user-agent'], req.ip);

      // Add login history
      await user.addLoginHistory(req.ip, req.headers['user-agent'], true);

      // Remove password from response
      const userData = user.toObject();
      delete userData.password;

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please verify your email.',
        data: {
          user: userData,
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

<<<<<<< HEAD
      // Check if user exists
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        await this.logFailedLoginAttempt(email, req);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
=======
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      await exports.logFailedLoginAttempt(email, req);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await exports.logFailedLoginAttempt(email, req);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // REMOVED: Email verification check - users can login without verification
    // Users can now login immediately after registration

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    await user.addRefreshToken(refreshToken, req.headers['user-agent'], req.ip);

    // Update login tracking
    await user.incrementLoginCount();
    await user.addLoginHistory(req.ip, req.headers['user-agent'], true);

    // Remove password from response
    const userData = user.toObject();
    delete userData.password;

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
        refreshToken
>>>>>>> 804ddfb (changes)
      }

<<<<<<< HEAD
      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
=======
// Log failed login attempt
exports.logFailedLoginAttempt = async (email, req) => {
  try {
    const user = await User.findOne({ email });
    if (user) {
      await user.addLoginHistory(req.ip, req.headers['user-agent'], false);
    }
  } catch (error) {
    logger.error('Failed to log login attempt:', error);
  }
};

// Verify email (optional - can be kept for manual verification if needed)
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const crypto = require('crypto');
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    await emailService.sendWelcomeEmail(user);

    logger.info(`Email verified for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Email verified successfully!'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message
    });
  }
};

// Resend verification email (optional)
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();
    await emailService.sendVerificationEmail(user, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email'
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request'
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const crypto = require('crypto');
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    user.refreshTokens = [];
    await user.save();

    logger.info(`Password reset for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const crypto = require('crypto');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const hashedToken = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    
    const user = await User.findOne({
      _id: decoded.userId,
      'refreshTokens.token': hashedToken,
      'refreshTokens.expiresAt': { $gt: Date.now() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(newRefreshToken, req.headers['user-agent'], req.ip);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
>>>>>>> 804ddfb (changes)
      }

<<<<<<< HEAD
      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await this.logFailedLoginAttempt(email, req);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if email is verified
      if (!user.isVerified) {
        // Generate new verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();
        await emailService.sendVerificationEmail(user, verificationToken);
        
        return res.status(403).json({
          success: false,
          message: 'Please verify your email. A new verification link has been sent.'
        });
      }

      // Generate tokens
      const accessToken = tokenService.generateAccessToken(user._id);
      const refreshToken = tokenService.generateRefreshToken(user._id);

      // Store refresh token
      await user.addRefreshToken(refreshToken, req.headers['user-agent'], req.ip);

      // Update login tracking
      await user.incrementLoginCount();
      await user.addLoginHistory(req.ip, req.headers['user-agent'], true);

      // Remove password from response
      const userData = user.toObject();
      delete userData.password;

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userData,
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
=======
// Logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken && req.user) {
      await req.user.removeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Logout from all devices
exports.logoutAll = async (req, res) => {
  try {
    req.user.refreshTokens = [];
    await req.user.save();

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error) {
    logger.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout from all devices'
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
>>>>>>> 804ddfb (changes)
  }

<<<<<<< HEAD
  // Log failed login attempt
  async logFailedLoginAttempt(email, req) {
    try {
      const user = await User.findOne({ email });
      if (user) {
        await user.addLoginHistory(req.ip, req.headers['user-agent'], false);
      }
    } catch (error) {
      logger.error('Failed to log login attempt:', error);
    }
=======
// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    user.refreshTokens = [];
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Get login history
exports.getLoginHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('loginHistory');
    
    res.json({
      success: true,
      data: user.loginHistory
    });
  } catch (error) {
    logger.error('Get login history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch login history'
    });
>>>>>>> 804ddfb (changes)
  }

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      // Hash token for comparison
      const hashedToken = require('crypto')
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with valid token
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
      }

      // Verify user
      user.isVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      // Send welcome email
      await emailService.sendWelcomeEmail(user);

      logger.info(`Email verified for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Email verified successfully! You can now login.'
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Email verification failed',
        error: error.message
      });
    }
  }

  // Resend verification email
  async resendVerificationEmail(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified'
        });
      }

      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email
      await emailService.sendVerificationEmail(user, verificationToken);

      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (error) {
      logger.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification email'
      });
    }
  }

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal that user doesn't exist for security
        return res.json({
          success: true,
          message: 'If your email is registered, you will receive a password reset link'
        });
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send reset email
      await emailService.sendPasswordResetEmail(user, resetToken);

      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process request'
      });
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      // Hash token for comparison
      const hashedToken = require('crypto')
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with valid token
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Update password
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // Clear all refresh tokens for security
      user.refreshTokens = [];
      await user.save();

      logger.info(`Password reset for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password reset successful! You can now login with your new password.'
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password'
      });
    }
  }

  // Refresh access token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      // Verify refresh token
      const decoded = tokenService.verifyRefreshToken(refreshToken);
      
      // Find user with this refresh token
      const hashedToken = require('crypto')
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');
      
      const user = await User.findOne({
        _id: decoded.userId,
        'refreshTokens.token': hashedToken,
        'refreshTokens.expiresAt': { $gt: Date.now() }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      // Generate new tokens
      const newAccessToken = tokenService.generateAccessToken(user._id);
      const newRefreshToken = tokenService.generateRefreshToken(user._id);

      // Replace refresh token
      await user.removeRefreshToken(refreshToken);
      await user.addRefreshToken(newRefreshToken, req.headers['user-agent'], req.ip);

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken && req.user) {
        await req.user.removeRefreshToken(refreshToken);
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  // Logout from all devices
  async logoutAll(req, res) {
    try {
      req.user.refreshTokens = [];
      await req.user.save();

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });
    } catch (error) {
      logger.error('Logout all error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to logout from all devices'
      });
    }
  }

  // Get current user
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user._id)
        .select('-password -refreshTokens -emailVerificationToken -passwordResetToken');

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findById(req.user._id).select('+password');

      // Check current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Clear all refresh tokens for security
      user.refreshTokens = [];
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }

  // Get login history
  async getLoginHistory(req, res) {
    try {
      const user = await User.findById(req.user._id).select('loginHistory');
      
      res.json({
        success: true,
        data: user.loginHistory
      });
    } catch (error) {
      logger.error('Get login history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch login history'
      });
    }
  }
}

module.exports = new AuthController();