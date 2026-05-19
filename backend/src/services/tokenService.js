const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../utils/logger');

class TokenService {
  constructor() {
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  }

  // Generate access token
  generateAccessToken(userId, additionalData = {}) {
    try {
      const token = jwt.sign(
        { 
          userId, 
          ...additionalData,
          type: 'access'
        },
        process.env.JWT_SECRET,
        { expiresIn: this.accessTokenExpiry }
      );
      return token;
    } catch (error) {
      logger.error('Access token generation error:', error);
      throw error;
    }
  }

  // Generate refresh token
  generateRefreshToken(userId) {
    try {
      const token = jwt.sign(
        { 
          userId, 
          type: 'refresh',
          tokenId: crypto.randomBytes(16).toString('hex')
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: this.refreshTokenExpiry }
      );
      return token;
    } catch (error) {
      logger.error('Refresh token generation error:', error);
      throw error;
    }
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      logger.error('Access token verification error:', error);
      throw error;
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      logger.error('Refresh token verification error:', error);
      throw error;
    }
  }

  // Decode token without verification
  decodeToken(token) {
    return jwt.decode(token);
  }

  // Check if token is expired
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return true;
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }

  // Get token expiration time
  getTokenExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      return decoded ? new Date(decoded.exp * 1000) : null;
    } catch (error) {
      return null;
    }
  }
}

module.exports = new TokenService();