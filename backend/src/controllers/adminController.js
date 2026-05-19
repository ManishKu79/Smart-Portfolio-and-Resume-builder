const User = require('../models/User');
const Resume = require('../models/Resume');
const Portfolio = require('../models/Portfolio');
const Notification = require('../models/Notification');
const AdminStats = require('../models/AdminStats');
const logger = require('../utils/logger');

class AdminController {
  // Dashboard Overview
  async getDashboardStats(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);

      // Current stats
      const [
        totalUsers,
        newUsersToday,
        activeUsersToday,
        totalResumes,
        resumesToday,
        totalPortfolios,
        portfoliosToday,
        totalRevenue
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: today } }),
        User.countDocuments({ lastLogin: { $gte: today } }),
        Resume.countDocuments(),
        Resume.countDocuments({ createdAt: { $gte: today } }),
        Portfolio.countDocuments(),
        Portfolio.countDocuments({ createdAt: { $gte: today } }),
        this.calculateTotalRevenue()
      ]);

      // Get recent activities
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email createdAt role');

      const recentResumes = await Resume.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name email')
        .select('title createdAt template');

      // Chart data for last 7 days
      const userGrowth = await this.getUserGrowthData(weekAgo, today);
      const resumeCreation = await this.getResumeCreationData(weekAgo, today);
      const portfolioCreation = await this.getPortfolioCreationData(weekAgo, today);

      // Get stored stats
      const stats = await AdminStats.getDateRangeStats(monthAgo, today);

      res.json({
        success: true,
        data: {
          overview: {
            totalUsers,
            newUsersToday,
            activeUsersToday,
            totalResumes,
            resumesToday,
            totalPortfolios,
            portfoliosToday,
            totalRevenue
          },
          recent: {
            users: recentUsers,
            resumes: recentResumes
          },
          charts: {
            userGrowth,
            resumeCreation,
            portfolioCreation
          },
          stats
        }
      });
    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  }

  // Get all users with filtering
  async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        role,
        subscription,
        isActive,
        isVerified,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (role) query.role = role;
      if (subscription) query.subscriptionTier = subscription;
      if (isActive !== undefined) query.isActive = isActive === 'true';
      if (isVerified !== undefined) query.isVerified = isVerified === 'true';

      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const users = await User.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('-password -refreshTokens -emailVerificationToken -passwordResetToken');

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }

  // Get single user details
  async getUserDetails(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id)
        .select('-password -refreshTokens -emailVerificationToken -passwordResetToken');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user's resumes
      const resumes = await Resume.find({ userId: id })
        .sort({ createdAt: -1 })
        .limit(20);

      const portfolios = await Portfolio.find({ userId: id })
        .sort({ createdAt: -1 })
        .limit(20);

      res.json({
        success: true,
        data: {
          user,
          resumes,
          portfolios,
          stats: {
            totalResumes: resumes.length,
            totalPortfolios: portfolios.length,
            totalResumeViews: resumes.reduce((sum, r) => sum + (r.views || 0), 0),
            totalPortfolioViews: portfolios.reduce((sum, p) => sum + (p.analytics?.views || 0), 0)
          }
        }
      });
    } catch (error) {
      logger.error('Get user details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user details'
      });
    }
  }

  // Update user (admin)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { role, subscriptionTier, isActive, isVerified, notes } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update allowed fields
      if (role) user.role = role;
      if (subscriptionTier) user.subscriptionTier = subscriptionTier;
      if (isActive !== undefined) user.isActive = isActive;
      if (isVerified !== undefined) user.isVerified = isVerified;
      if (notes) user.adminNotes = notes;

      await user.save();

      logger.info(`Admin updated user: ${user.email}`);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  // Delete user (admin)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete all user data
      await Promise.all([
        Resume.deleteMany({ userId: id }),
        Portfolio.deleteMany({ userId: id }),
        Notification.deleteMany({ userId: id })
      ]);

      await user.deleteOne();

      logger.info(`Admin deleted user: ${user.email}`);

      res.json({
        success: true,
        message: 'User and all associated data deleted successfully'
      });
    } catch (error) {
      logger.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }

  // Get all resumes (admin view)
  async getAllResumes(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        template,
        isPublic,
        minATSScore,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = {};
      if (search) {
        query.$text = { $search: search };
      }
      if (template) query.template = template;
      if (isPublic !== undefined) query.isPublic = isPublic === 'true';
      if (minATSScore) query.atsScore = { $gte: parseInt(minATSScore) };

      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const resumes = await Resume.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('userId', 'name email');

      const total = await Resume.countDocuments(query);

      res.json({
        success: true,
        data: {
          resumes,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Get all resumes error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch resumes'
      });
    }
  }

  // Delete resume (admin)
  async deleteResume(req, res) {
    try {
      const { id } = req.params;

      const resume = await Resume.findById(id);
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      await resume.deleteOne();

      logger.info(`Admin deleted resume: ${resume.title}`);

      res.json({
        success: true,
        message: 'Resume deleted successfully'
      });
    } catch (error) {
      logger.error('Delete resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete resume'
      });
    }
  }

  // Get system analytics
  async getSystemAnalytics(req, res) {
    try {
      const { period = 'week' } = req.query;
      
      let startDate;
      const now = new Date();
      
      switch(period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
      }

      const stats = await AdminStats.find({
        date: { $gte: startDate }
      }).sort({ date: 1 });

      // Calculate averages and trends
      const avgATSScore = await Resume.aggregate([
        { $group: { _id: null, avg: { $avg: '$atsScore' } } }
      ]);

      const templateUsage = await Resume.aggregate([
        { $group: { _id: '$template', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const subscriptionDistribution = await User.aggregate([
        { $group: { _id: '$subscriptionTier', count: { $sum: 1 } } }
      ]);

      res.json({
        success: true,
        data: {
          stats,
          averages: {
            atsScore: avgATSScore[0]?.avg || 0
          },
          templateUsage,
          subscriptionDistribution,
          period
        }
      });
    } catch (error) {
      logger.error('Get system analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system analytics'
      });
    }
  }

  // Send system notification to users
  async sendSystemNotification(req, res) {
    try {
      const { title, message, type, targetUsers = 'all', priority = 'medium' } = req.body;

      let userQuery = {};
      if (targetUsers === 'active') {
        userQuery = { lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
      } else if (targetUsers === 'inactive') {
        userQuery = { lastLogin: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
      }

      const users = await User.find(userQuery).select('_id');
      
      // Create notifications for all target users
      const notifications = users.map(user => ({
        userId: user._id,
        type: 'system',
        title,
        message,
        priority,
        data: { fromAdmin: true }
      }));

      await Notification.insertMany(notifications);

      logger.info(`Admin sent system notification to ${users.length} users`);

      res.json({
        success: true,
        message: `Notification sent to ${users.length} users`
      });
    } catch (error) {
      logger.error('Send system notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notifications'
      });
    }
  }

  // Get admin activity logs
  async getActivityLogs(req, res) {
    try {
      const { page = 1, limit = 50, adminId } = req.query;
      
      // This would typically fetch from a dedicated admin logs collection
      // For now, return mock data
      res.json({
        success: true,
        data: {
          logs: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0
          }
        }
      });
    } catch (error) {
      logger.error('Get activity logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch activity logs'
      });
    }
  }

  // Helper methods
  async calculateTotalRevenue() {
    // This would integrate with Stripe/Payment system
    return 0;
  }

  async getUserGrowthData(startDate, endDate) {
    const data = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await User.countDocuments({
        createdAt: { $gte: currentDate, $lt: nextDate }
      });
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        count
      });
      
      currentDate = nextDate;
    }
    
    return data;
  }

  async getResumeCreationData(startDate, endDate) {
    const data = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await Resume.countDocuments({
        createdAt: { $gte: currentDate, $lt: nextDate }
      });
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        count
      });
      
      currentDate = nextDate;
    }
    
    return data;
  }

  async getPortfolioCreationData(startDate, endDate) {
    const data = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await Portfolio.countDocuments({
        createdAt: { $gte: currentDate, $lt: nextDate }
      });
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        count
      });
      
      currentDate = nextDate;
    }
    
    return data;
  }
}

module.exports = new AdminController();