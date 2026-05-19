const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const logger = require('../utils/logger');

class PortfolioController {
  // Get all portfolios for current user
  async getAllPortfolios(req, res) {
    try {
      const { page = 1, limit = 10, search, isPublished, isArchived } = req.query;
      const query = { userId: req.user._id };
      
      if (search) {
        query.$text = { $search: search };
      }
      
      if (isPublished !== undefined) {
        query.isPublished = isPublished === 'true';
      }
      
      if (isArchived !== undefined) {
        query.isArchived = isArchived === 'true';
      }
      
      const portfolios = await Portfolio.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('-__v');
      
      const total = await Portfolio.countDocuments(query);
      
      res.json({
        success: true,
        data: {
          portfolios,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Get all portfolios error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch portfolios',
        error: error.message
      });
    }
  }
  
  // Get single portfolio by ID
  async getPortfolioById(req, res) {
    try {
      const { id } = req.params;
      
      const portfolio = await Portfolio.findById(id);
      
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      // Check if user has access
      if (portfolio.userId.toString() !== req.user._id.toString() && !portfolio.isPublished) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      res.json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      logger.error('Get portfolio by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch portfolio',
        error: error.message
      });
    }
  }
  
  // Get public portfolio by slug
  async getPublicPortfolio(req, res) {
    try {
      const { slug } = req.params;
      
      const portfolio = await Portfolio.findOne({ slug, isPublished: true });
      
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found or not published'
        });
      }
      
      // Check if password protected
      if (portfolio.isPasswordProtected) {
        // Don't return content, just indicate password required
        return res.json({
          success: true,
          requiresPassword: true,
          data: {
            id: portfolio._id,
            title: portfolio.title,
            isPasswordProtected: true
          }
        });
      }
      
      // Increment view count
      await portfolio.incrementViews();
      
      // Get user info
      const user = await User.findById(portfolio.userId).select('name avatar bio');
      
      res.json({
        success: true,
        data: {
          portfolio,
          user
        }
      });
    } catch (error) {
      logger.error('Get public portfolio error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch public portfolio',
        error: error.message
      });
    }
  }
  
  // Verify portfolio password
  async verifyPortfolioPassword(req, res) {
    try {
      const { id } = req.params;
      const { password } = req.body;
      
      const portfolio = await Portfolio.findById(id).select('+password');
      
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      if (!portfolio.isPasswordProtected) {
        return res.status(400).json({
          success: false,
          message: 'Portfolio is not password protected'
        });
      }
      
      const isPasswordValid = password === portfolio.password;
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }
      
      // Generate temporary access token
      const crypto = require('crypto');
      const accessToken = crypto.randomBytes(32).toString('hex');
      
      // Store in cache (in production, use Redis)
      // For now, we'll use a simple object
      if (!global.portfolioAccessTokens) {
        global.portfolioAccessTokens = new Map();
      }
      global.portfolioAccessTokens.set(accessToken, {
        portfolioId: id,
        expiresAt: Date.now() + 3600000 // 1 hour
      });
      
      res.json({
        success: true,
        data: {
          accessToken
        }
      });
    } catch (error) {
      logger.error('Verify portfolio password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify password',
        error: error.message
      });
    }
  }
  
  // Get protected portfolio content
  async getProtectedPortfolio(req, res) {
    try {
      const { id, token } = req.params;
      
      // Verify access token
      if (!global.portfolioAccessTokens || !global.portfolioAccessTokens.get(token)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired access token'
        });
      }
      
      const tokenData = global.portfolioAccessTokens.get(token);
      if (tokenData.portfolioId !== id || tokenData.expiresAt < Date.now()) {
        global.portfolioAccessTokens.delete(token);
        return res.status(401).json({
          success: false,
          message: 'Access token expired'
        });
      }
      
      const portfolio = await Portfolio.findById(id);
      
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      const user = await User.findById(portfolio.userId).select('name avatar bio');
      
      res.json({
        success: true,
        data: {
          portfolio,
          user
        }
      });
    } catch (error) {
      logger.error('Get protected portfolio error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch portfolio',
        error: error.message
      });
    }
  }
  
  // Create new portfolio
  async createPortfolio(req, res) {
    try {
      const { title, slug } = req.body;
      
      // Check if slug already exists
      const existingPortfolio = await Portfolio.findOne({ slug });
      if (existingPortfolio) {
        return res.status(400).json({
          success: false,
          message: 'Slug already taken. Please choose another one.'
        });
      }
      
      const portfolioData = {
        ...req.body,
        userId: req.user._id,
        sections: [
          {
            type: 'about',
            title: 'About Me',
            content: {
              description: 'Write something about yourself...'
            },
            order: 0,
            isEnabled: true
          },
          {
            type: 'skills',
            title: 'Skills',
            content: {
              skills: []
            },
            order: 1,
            isEnabled: true
          },
          {
            type: 'projects',
            title: 'Projects',
            content: {
              projects: []
            },
            order: 2,
            isEnabled: true
          },
          {
            type: 'contact',
            title: 'Contact',
            content: {
              email: req.user.email,
              formEnabled: true
            },
            order: 3,
            isEnabled: true
          }
        ]
      };
      
      const portfolio = await Portfolio.create(portfolioData);
      
      // Update user analytics
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'analytics.totalPortfoliosCreated': 1 }
      });
      
      logger.info(`New portfolio created: ${portfolio.title} by user ${req.user.email}`);
      
      res.status(201).json({
        success: true,
        message: 'Portfolio created successfully',
        data: portfolio
      });
    } catch (error) {
      logger.error('Create portfolio error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create portfolio',
        error: error.message
      });
    }
  }
  
  // Update portfolio
  async updatePortfolio(req, res) {
    try {
      const { id } = req.params;
      
      const portfolio = await Portfolio.findOne({ _id: id, userId: req.user._id });
      
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      // Check if slug is being changed and if it's available
      if (req.body.slug && req.body.slug !== portfolio.slug) {
        const existingPortfolio = await Portfolio.findOne({ slug: req.body.slug });
        if (existingPortfolio) {
          return res.status(400).json({
            success: false,
            message: 'Slug already taken'
          });
        }
      }
      
      // Update fields
      Object.keys(req.body).forEach(key => {
        if (key !== '_id' && key !== 'userId' && key !== '__v') {
          portfolio[key] = req.body[key];
        }
      });
      
      await portfolio.save();
      
      logger.info(`Portfolio updated: ${portfolio.title} by user ${req.user.email}`);
      
      res.json({
        success: true,
        message: 'Portfolio updated successfully',
        data: portfolio
      });
    } catch (error) {
      logger.error('Update portfolio error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update portfolio',
        error: error.message
      });
    }
  }
  
  // Delete portfolio
  async deletePortfolio(req, res) {
    try {
      const { id } = req.params;
      
      const portfolio = await Portfolio.findOneAndDelete({ _id: id, userId: req.user._id });
      
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      // Update user analytics
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'analytics.totalPortfoliosCreated': -1 }
      });
      
      logger.info(`Portfolio deleted: ${portfolio.title} by user ${req.user.email}`);
      
      res.json({
        success: true,
        message: 'Portfolio deleted successfully'
      });
    } catch (error) {
      logger.error('Delete portfolio error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete portfolio',
        error: error.message
      });
    }
  }
  
  // Publish portfolio
  async publishPortfolio(req, res) {
    try {
      const { id } = req.params;
      
      const portfolio = await Portfolio.findOne({ _id: id, userId: req.user._id });
      
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      portfolio.isPublished = true;
      portfolio.publishedAt = new Date();
      await portfolio.save();
      
      res.json({
        success: true,
        message: 'Portfolio published successfully',
        data: {
          url: `${process.env.CLIENT_URL}/portfolio/${portfolio.slug}`,
          isPublished: true
        }
      });
    } catch (error) {
      logger.error('Publish portfolio error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to publish portfolio',
        error: error.message
      });
    }
  }
  
  // Unpublish portfolio
  async unpublishPortfolio(req, res) {
    try {
      const { id } = req.params;
      
      const portfolio = await Portfolio.findOne({ _id: id, userId: req.user._id });
      
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      portfolio.isPublished = false;
      await portfolio.save();
      
      res.json({
        success: true,
        message: 'Portfolio unpublished successfully',
        isPublished: false
      });
    } catch (error) {
      logger.error('Unpublish portfolio error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unpublish portfolio',
        error: error.message
      });
    }
  }
  
  // Update section order (drag-and-drop)
  async updateSectionOrder(req, res) {
    try {
      const { id } = req.params;
      const { sections } = req.body;
      
      const portfolio = await Portfolio.findOne({ _id: id, userId: req.user._id });
      
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      portfolio.sections = sections;
      await portfolio.save();
      
      res.json({
        success: true,
        message: 'Section order updated successfully',
        data: portfolio.sections
      });
    } catch (error) {
      logger.error('Update section order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update section order',
        error: error.message
      });
    }
  }
  
  // Update section content
  async updateSection(req, res) {
    try {
      const { id, sectionId } = req.params;
      const { content, title, isEnabled } = req.body;
      
      const portfolio = await Portfolio.findOne({ _id: id, userId: req.user._id });
      
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      const section = portfolio.sections.id(sectionId);
      if (!section) {
        return res.status(404).json({
          success: false,
          message: 'Section not found'
        });
      }
      
      if (title) section.title = title;
      if (content) section.content = content;
      if (isEnabled !== undefined) section.isEnabled = isEnabled;
      
      await portfolio.save();
      
      res.json({
        success: true,
        message: 'Section updated successfully',
        data: section
      });
    } catch (error) {
      logger.error('Update section error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update section',
        error: error.message
      });
    }
  }
  
  // Add new section
  async addSection(req, res) {
    try {
      const { id } = req.params;
      const { type, title, content } = req.body;
      
      const portfolio = await Portfolio.findOne({ _id: id, userId: req.user._id });
      
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      const newSection = {
        type,
        title,
        content: content || {},
        order: portfolio.sections.length,
        isEnabled: true
      };
      
      portfolio.sections.push(newSection);
      await portfolio.save();
      
      res.status(201).json({
        success: true,
        message: 'Section added successfully',
        data: portfolio.sections[portfolio.sections.length - 1]
      });
    } catch (error) {
      logger.error('Add section error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add section',
        error: error.message
      });
    }
  }
  
  // Delete section
  async deleteSection(req, res) {
    try {
      const { id, sectionId } = req.params;
      
      const portfolio = await Portfolio.findOne({ _id: id, userId: req.user._id });
      
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      portfolio.sections = portfolio.sections.filter(s => s._id.toString() !== sectionId);
      await portfolio.save();
      
      res.json({
        success: true,
        message: 'Section deleted successfully'
      });
    } catch (error) {
      logger.error('Delete section error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete section',
        error: error.message
      });
    }
  }
  
  // Get portfolio analytics
  async getAnalytics(req, res) {
    try {
      const { id } = req.params;
      
      const portfolio = await Portfolio.findOne({ _id: id, userId: req.user._id });
      
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      // Calculate analytics
      const analytics = {
        totalViews: portfolio.analytics.views,
        uniqueVisitors: portfolio.analytics.uniqueVisitors,
        clicksOnLinks: portfolio.analytics.clicksOnLinks,
        contactFormSubmissions: portfolio.analytics.contactFormSubmissions,
        dailyViews: portfolio.analytics.dailyViews.slice(-30), // Last 30 days
        topReferrers: portfolio.analytics.referrers.sort((a, b) => b.count - a.count).slice(0, 10)
      };
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics',
        error: error.message
      });
    }
  }
  
  // Track contact form submission
  async trackContactSubmission(req, res) {
    try {
      const { slug } = req.params;
      const { name, email, message } = req.body;
      
      const portfolio = await Portfolio.findOne({ slug, isPublished: true });
      
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      // Increment contact form submissions
      portfolio.analytics.contactFormSubmissions += 1;
      await portfolio.save();
      
      // In production, send email notification to portfolio owner
      logger.info(`Contact form submission for portfolio ${portfolio.slug} from ${email}`);
      
      res.json({
        success: true,
        message: 'Message sent successfully'
      });
    } catch (error) {
      logger.error('Track contact submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message
      });
    }
  }
  
  // Get portfolio themes
  async getThemes(req, res) {
    try {
      const themes = [
        {
          id: 'default',
          name: 'Default',
          description: 'Clean and modern layout',
          previewImage: '/themes/default-preview.jpg'
        },
        {
          id: 'minimal',
          name: 'Minimal',
          description: 'Simple and elegant design',
          previewImage: '/themes/minimal-preview.jpg'
        },
        {
          id: 'creative',
          name: 'Creative',
          description: 'Bold design for creative professionals',
          previewImage: '/themes/creative-preview.jpg'
        },
        {
          id: 'corporate',
          name: 'Corporate',
          description: 'Professional business layout',
          previewImage: '/themes/corporate-preview.jpg'
        },
        {
          id: 'portfolio',
          name: 'Portfolio',
          description: 'Grid-based portfolio showcase',
          previewImage: '/themes/portfolio-preview.jpg'
        }
      ];
      
      res.json({
        success: true,
        data: themes
      });
    } catch (error) {
      logger.error('Get themes error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch themes'
      });
    }
  }
}

module.exports = new PortfolioController();