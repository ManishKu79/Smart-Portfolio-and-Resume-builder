const Notification = require('../models/Notification');
const Resume = require('../models/Resume');
const Portfolio = require('../models/Portfolio');
const logger = require('../utils/logger');

class RealtimeController {
  // Get user notifications
  async getNotifications(req, res) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      
      const query = { userId: req.user._id };
      if (unreadOnly === 'true') {
        query.isRead = false;
      }
      
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      
      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.getUnreadCount(req.user._id);
      
      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications'
      });
    }
  }
  
  // Mark notification as read
  async markNotificationRead(req, res) {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findOne({
        _id: id,
        userId: req.user._id
      });
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }
      
      await notification.markAsRead();
      
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      logger.error('Mark notification read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read'
      });
    }
  }
  
  // Mark all notifications as read
  async markAllRead(req, res) {
    try {
      await Notification.updateMany(
        { userId: req.user._id, isRead: false },
        { isRead: true }
      );
      
      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      logger.error('Mark all read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all as read'
      });
    }
  }
  
  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      
      await Notification.findOneAndDelete({
        _id: id,
        userId: req.user._id
      });
      
      res.json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      logger.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification'
      });
    }
  }
  
  // Get real-time collaboration status
  async getCollaborationStatus(req, res) {
    try {
      const { documentId, documentType } = req.params;
      
      let document;
      if (documentType === 'resume') {
        document = await Resume.findById(documentId);
      } else {
        document = await Portfolio.findById(documentId);
      }
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }
      
      // Check if user has access
      if (document.userId.toString() !== req.user._id.toString() && 
          !document.collaborators?.some(c => c.userId.toString() === req.user._id.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      res.json({
        success: true,
        data: {
          collaborators: document.collaborators || [],
          shareableLink: document.shareableLink,
          isPublic: document.isPublic
        }
      });
    } catch (error) {
      logger.error('Get collaboration status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get collaboration status'
      });
    }
  }
  
  // Share document with collaborator
  async shareDocument(req, res) {
    try {
      const { documentId, documentType } = req.params;
      const { email, permission = 'view' } = req.body;
      
      let document;
      if (documentType === 'resume') {
        document = await Resume.findById(documentId);
      } else {
        document = await Portfolio.findById(documentId);
      }
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }
      
      // Check if user is owner
      if (document.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only document owner can share'
        });
      }
      
      // Add collaborator
      if (!document.collaborators) {
        document.collaborators = [];
      }
      
      const existingCollaborator = document.collaborators.find(
        c => c.email === email
      );
      
      if (!existingCollaborator) {
        document.collaborators.push({
          email,
          permission,
          addedBy: req.user._id,
          addedAt: new Date()
        });
        await document.save();
      }
      
      // Create notification for collaborator
      const notification = await Notification.createNotification(null, {
        type: 'collaboration',
        title: 'Document Shared',
        message: `${req.user.name} shared a ${documentType} with you`,
        data: {
          documentId,
          documentType,
          permission,
          sharedBy: req.user._id
        },
        actionUrl: `/${documentType}s/${documentId}`,
        actionLabel: 'View Document'
      });
      
      res.json({
        success: true,
        message: 'Document shared successfully',
        data: {
          collaborators: document.collaborators
        }
      });
    } catch (error) {
      logger.error('Share document error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share document'
      });
    }
  }
  
  // Remove collaborator
  async removeCollaborator(req, res) {
    try {
      const { documentId, documentType, collaboratorId } = req.params;
      
      let document;
      if (documentType === 'resume') {
        document = await Resume.findById(documentId);
      } else {
        document = await Portfolio.findById(documentId);
      }
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }
      
      // Check if user is owner
      if (document.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only document owner can remove collaborators'
        });
      }
      
      document.collaborators = document.collaborators.filter(
        c => c._id.toString() !== collaboratorId
      );
      await document.save();
      
      res.json({
        success: true,
        message: 'Collaborator removed successfully'
      });
    } catch (error) {
      logger.error('Remove collaborator error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove collaborator'
      });
    }
  }
  
  // Get active sessions (online users)
  async getActiveSessions(req, res) {
    try {
      // This would be populated from socket service
      res.json({
        success: true,
        data: {
          onlineUsers: [], // Populated by socket service
          total: 0
        }
      });
    } catch (error) {
      logger.error('Get active sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active sessions'
      });
    }
  }
}

module.exports = new RealtimeController();