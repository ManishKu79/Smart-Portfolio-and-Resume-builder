const pdfService = require('../services/pdfService');
const Resume = require('../models/Resume');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const logger = require('../utils/logger');

class PDFController {
  // Export resume to PDF
  async exportResume(req, res) {
    try {
      const { id } = req.params;
      const { format = 'A4', template } = req.query;
      
      // Fetch resume
      const resume = await Resume.findById(id);
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }
      
      // Check access
      if (resume.userId.toString() !== req.user?._id?.toString() && !resume.isPublic) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Fetch user
      const user = await User.findById(resume.userId);
      
      // Update download count
      resume.downloads += 1;
      await resume.save();
      
      // Generate PDF
      const pdf = await pdfService.generateResumePDF(resume, user, {
        format,
        template: template || resume.template
      });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${resume.personalInfo.fullName || 'resume'}_${Date.now()}.pdf"`);
      res.setHeader('Content-Length', pdf.length);
      
      res.send(pdf);
      
      logger.info(`Resume PDF exported: ${resume._id} by ${req.user?.email || 'anonymous'}`);
    } catch (error) {
      logger.error('Export resume PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate PDF',
        error: error.message
      });
    }
  }
  
  // Export portfolio to PDF
  async exportPortfolio(req, res) {
    try {
      const { id } = req.params;
      const { format = 'A4' } = req.query;
      
      // Fetch portfolio
      const portfolio = await Portfolio.findById(id);
      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      // Check access
      if (portfolio.userId.toString() !== req.user?._id?.toString() && !portfolio.isPublished) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Fetch user
      const user = await User.findById(portfolio.userId);
      
      // Update download count (add to analytics)
      portfolio.analytics.downloads = (portfolio.analytics.downloads || 0) + 1;
      await portfolio.save();
      
      // Generate PDF
      const pdf = await pdfService.generatePortfolioPDF(portfolio, user, { format });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${portfolio.title}_${Date.now()}.pdf"`);
      res.setHeader('Content-Length', pdf.length);
      
      res.send(pdf);
      
      logger.info(`Portfolio PDF exported: ${portfolio._id} by ${req.user?.email || 'anonymous'}`);
    } catch (error) {
      logger.error('Export portfolio PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate PDF',
        error: error.message
      });
    }
  }
  
  // Preview resume as PDF (view in browser)
  async previewResume(req, res) {
    try {
      const { id } = req.params;
      
      // Fetch resume
      const resume = await Resume.findById(id);
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }
      
      // Check access
      if (resume.userId.toString() !== req.user?._id?.toString() && !resume.isPublic) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Fetch user
      const user = await User.findById(resume.userId);
      
      // Generate PDF
      const pdf = await pdfService.generateResumePDF(resume, user);
      
      // Set response headers for inline viewing
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="preview.pdf"`);
      res.setHeader('Content-Length', pdf.length);
      
      res.send(pdf);
    } catch (error) {
      logger.error('Preview resume PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate preview',
        error: error.message
      });
    }
  }
  
  // Get PDF generation options
  async getPDFOptions(req, res) {
    res.json({
      success: true,
      data: {
        formats: ['A4', 'Letter', 'Legal'],
        orientations: ['portrait', 'landscape'],
        templates: ['modern', 'classic', 'creative', 'minimal', 'professional']
      }
    });
  }
}

module.exports = new PDFController();