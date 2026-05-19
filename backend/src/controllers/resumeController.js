const Resume = require('../models/Resume');
const User = require('../models/User');
const logger = require('../utils/logger');

class ResumeController {
  // Get all resumes for current user
  async getAllResumes(req, res) {
    try {
      const { page = 1, limit = 10, search, isPublic, isArchived } = req.query;
      const query = { userId: req.user._id };
      
      if (search) {
        query.$text = { $search: search };
      }
      
      if (isPublic !== undefined) {
        query.isPublic = isPublic === 'true';
      }
      
      if (isArchived !== undefined) {
        query.isArchived = isArchived === 'true';
      }
      
      const resumes = await Resume.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('-__v');
      
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
        message: 'Failed to fetch resumes',
        error: error.message
      });
    }
  }
  
  // Get single resume by ID
  async getResumeById(req, res) {
    try {
      const { id } = req.params;
      
      const resume = await Resume.findById(id);
      
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }
      
      // Check if user has access
      if (resume.userId.toString() !== req.user._id.toString() && !resume.isPublic) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Increment view count if public
      if (resume.isPublic && resume.userId.toString() !== req.user._id.toString()) {
        resume.views += 1;
        await resume.save();
      }
      
      res.json({
        success: true,
        data: resume
      });
    } catch (error) {
      logger.error('Get resume by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch resume',
        error: error.message
      });
    }
  }
  
  // Get public resume by shareable link
  async getPublicResume(req, res) {
    try {
      const { shareableLink } = req.params;
      
      const resume = await Resume.findOne({ shareableLink, isPublic: true });
      
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found or not public'
        });
      }
      
      // Increment view count
      resume.views += 1;
      await resume.save();
      
      // Get user info
      const user = await User.findById(resume.userId).select('name avatar');
      
      res.json({
        success: true,
        data: {
          resume,
          user
        }
      });
    } catch (error) {
      logger.error('Get public resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch public resume',
        error: error.message
      });
    }
  }
  
  // Create new resume
  async createResume(req, res) {
    try {
      const resumeData = {
        ...req.body,
        userId: req.user._id
      };
      
      const resume = await Resume.create(resumeData);
      
      // Update user analytics
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'analytics.totalResumesCreated': 1 }
      });
      
      logger.info(`New resume created: ${resume.title} by user ${req.user.email}`);
      
      res.status(201).json({
        success: true,
        message: 'Resume created successfully',
        data: resume
      });
    } catch (error) {
      logger.error('Create resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create resume',
        error: error.message
      });
    }
  }
  
  // Update resume
  async updateResume(req, res) {
    try {
      const { id } = req.params;
      
      const resume = await Resume.findOne({ _id: id, userId: req.user._id });
      
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }
      
      // Update fields
      Object.keys(req.body).forEach(key => {
        if (key !== '_id' && key !== 'userId' && key !== '__v') {
          resume[key] = req.body[key];
        }
      });
      
      await resume.save();
      
      logger.info(`Resume updated: ${resume.title} by user ${req.user.email}`);
      
      res.json({
        success: true,
        message: 'Resume updated successfully',
        data: resume
      });
    } catch (error) {
      logger.error('Update resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update resume',
        error: error.message
      });
    }
  }
  
  // Delete resume
  async deleteResume(req, res) {
    try {
      const { id } = req.params;
      
      const resume = await Resume.findOneAndDelete({ _id: id, userId: req.user._id });
      
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }
      
      // Update user analytics
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'analytics.totalResumesCreated': -1 }
      });
      
      logger.info(`Resume deleted: ${resume.title} by user ${req.user.email}`);
      
      res.json({
        success: true,
        message: 'Resume deleted successfully'
      });
    } catch (error) {
      logger.error('Delete resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete resume',
        error: error.message
      });
    }
  }
  
  // Duplicate resume
  async duplicateResume(req, res) {
    try {
      const { id } = req.params;
      
      const originalResume = await Resume.findOne({ _id: id, userId: req.user._id });
      
      if (!originalResume) {
        return res.status(404).json({
          success: false,
          message: 'Original resume not found'
        });
      }
      
      // Create copy
      const resumeData = originalResume.toObject();
      delete resumeData._id;
      delete resumeData.__v;
      delete resumeData.createdAt;
      delete resumeData.updatedAt;
      delete resumeData.shareableLink;
      delete resumeData.views;
      delete resumeData.downloads;
      
      resumeData.title = `${resumeData.title} (Copy)`;
      resumeData.isPublic = false;
      
      const newResume = await Resume.create(resumeData);
      
      // Update user analytics
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'analytics.totalResumesCreated': 1 }
      });
      
      res.status(201).json({
        success: true,
        message: 'Resume duplicated successfully',
        data: newResume
      });
    } catch (error) {
      logger.error('Duplicate resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to duplicate resume',
        error: error.message
      });
    }
  }
  
  // Toggle public status
  async togglePublic(req, res) {
    try {
      const { id } = req.params;
      
      const resume = await Resume.findOne({ _id: id, userId: req.user._id });
      
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }
      
      resume.isPublic = !resume.isPublic;
      
      if (resume.isPublic && !resume.shareableLink) {
        const crypto = require('crypto');
        resume.shareableLink = crypto.randomBytes(16).toString('hex');
      }
      
      await resume.save();
      
      res.json({
        success: true,
        message: `Resume is now ${resume.isPublic ? 'public' : 'private'}`,
        data: {
          isPublic: resume.isPublic,
          shareableLink: resume.shareableLink
        }
      });
    } catch (error) {
      logger.error('Toggle public error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update resume visibility',
        error: error.message
      });
    }
  }
  
  // Archive resume
  async archiveResume(req, res) {
    try {
      const { id } = req.params;
      
      const resume = await Resume.findOne({ _id: id, userId: req.user._id });
      
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }
      
      resume.isArchived = !resume.isArchived;
      await resume.save();
      
      res.json({
        success: true,
        message: `Resume ${resume.isArchived ? 'archived' : 'unarchived'} successfully`
      });
    } catch (error) {
      logger.error('Archive resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to archive resume',
        error: error.message
      });
    }
  }
  
  // Get resume templates
  async getTemplates(req, res) {
    try {
      const templates = [
        {
          id: 'modern',
          name: 'Modern',
          description: 'Clean and contemporary design with a focus on skills',
          previewImage: '/templates/modern-preview.jpg',
          category: 'professional'
        },
        {
          id: 'classic',
          name: 'Classic',
          description: 'Traditional layout perfect for corporate roles',
          previewImage: '/templates/classic-preview.jpg',
          category: 'corporate'
        },
        {
          id: 'creative',
          name: 'Creative',
          description: 'Bold design for creative professionals',
          previewImage: '/templates/creative-preview.jpg',
          category: 'creative'
        },
        {
          id: 'minimal',
          name: 'Minimal',
          description: 'Simple and elegant design with plenty of white space',
          previewImage: '/templates/minimal-preview.jpg',
          category: 'professional'
        },
        {
          id: 'professional',
          name: 'Professional',
          description: 'Executive-style template for senior roles',
          previewImage: '/templates/professional-preview.jpg',
          category: 'corporate'
        }
      ];
      
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      logger.error('Get templates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch templates'
      });
    }
  }
  
  // Update section order (drag-and-drop)
  async updateSectionOrder(req, res) {
    try {
      const { id } = req.params;
      const { sections, type } = req.body; // type: 'experience', 'education', 'skills', 'projects'
      
      const resume = await Resume.findOne({ _id: id, userId: req.user._id });
      
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }
      
      // Update section order based on type
      switch(type) {
        case 'experience':
          resume.experience = sections;
          break;
        case 'education':
          resume.education = sections;
          break;
        case 'skills':
          resume.skills = sections;
          break;
        case 'projects':
          resume.projects = sections;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid section type'
          });
      }
      
      await resume.save();
      
      res.json({
        success: true,
        message: 'Section order updated successfully',
        data: resume[type]
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
  
  // Get resume statistics
  async getResumeStats(req, res) {
    try {
      const stats = await Resume.aggregate([
        { $match: { userId: req.user._id } },
        { $group: {
            _id: null,
            totalResumes: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalDownloads: { $sum: '$downloads' },
            averageATSScore: { $avg: '$atsScore' },
            publicResumes: { $sum: { $cond: ['$isPublic', 1, 0] } }
          }
        }
      ]);
      
      const templateStats = await Resume.aggregate([
        { $match: { userId: req.user._id } },
        { $group: {
            _id: '$template',
            count: { $sum: 1 }
          }
        }
      ]);
      
      res.json({
        success: true,
        data: {
          overall: stats[0] || {
            totalResumes: 0,
            totalViews: 0,
            totalDownloads: 0,
            averageATSScore: 0,
            publicResumes: 0
          },
          templates: templateStats
        }
      });
    } catch (error) {
      logger.error('Get resume stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch resume statistics',
        error: error.message
      });
    }
  }
}

module.exports = new ResumeController();