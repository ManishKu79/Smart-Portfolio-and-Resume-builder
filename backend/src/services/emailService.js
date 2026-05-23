<<<<<<< HEAD
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      logger.info('Email service initialized');
    } else {
      logger.warn('Email service not configured - using console mode');
    }
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      if (!this.transporter) {
        // Development mode - log email content
        logger.info(`Email would be sent to ${to}:`);
        logger.info(`Subject: ${subject}`);
        logger.info(`Content: ${text || html}`);
        return { success: true, messageId: 'dev-mode' };
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@portfoliobuilder.com',
        to,
        subject,
        html,
        text
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #10B981); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to PortfolioBuilder!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>Thank you for registering with PortfolioBuilder. Please verify your email address to get started.</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link:</p>
            <p style="background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>© 2024 PortfolioBuilder. All rights reserved.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `Welcome to PortfolioBuilder! Please verify your email by visiting: ${verificationUrl}`;

    return await this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address - PortfolioBuilder',
      html,
      text
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #10B981); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>We received a request to reset your password. Click the button below to create a new password.</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </div>
            <p>Or copy and paste this link:</p>
            <p style="background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>© 2024 PortfolioBuilder. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `Reset your password by visiting: ${resetUrl}`;

    return await this.sendEmail({
      to: user.email,
      subject: 'Reset Your Password - PortfolioBuilder',
      html,
      text
    });
  }

  async sendWelcomeEmail(user) {
    const loginUrl = `${process.env.CLIENT_URL}/login`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #10B981); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .features { display: flex; justify-content: space-around; margin: 30px 0; }
          .feature { text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to PortfolioBuilder! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>Your account has been successfully verified. Welcome to the PortfolioBuilder community!</p>
            
            <div class="features">
              <div class="feature">
                <h3>📄 Resume Builder</h3>
                <p>Create professional resumes</p>
              </div>
              <div class="feature">
                <h3>🎨 Portfolio Builder</h3>
                <p>Showcase your work</p>
              </div>
              <div class="feature">
                <h3>🤖 AI Suggestions</h3>
                <p>Get smart recommendations</p>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Start Building Now</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 PortfolioBuilder. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Welcome to PortfolioBuilder! 🎉',
      html,
      text: 'Welcome to PortfolioBuilder! Login to start building your portfolio.'
    });
=======
const logger = require('../utils/logger');

class EmailService {
  async sendVerificationEmail(user, token) {
    logger.info(`Verification email would be sent to ${user.email} with token ${token}`);
    return { success: true };
  }

  async sendPasswordResetEmail(user, token) {
    logger.info(`Password reset email would be sent to ${user.email} with token ${token}`);
    return { success: true };
  }

  async sendWelcomeEmail(user) {
    logger.info(`Welcome email would be sent to ${user.email}`);
    return { success: true };
>>>>>>> 804ddfb (changes)
  }
}

module.exports = new EmailService();