const aiService = require('../services/aiService');
const Resume = require('../models/Resume');
const logger = require('../utils/logger');

class AIController {
  // Generate professional summary
  async generateSummary(req, res) {
    try {
      const { jobTitle, experience, skills, industry } = req.body;
      
      const summary = await aiService.generateSummary({
        jobTitle,
        experience,
        skills,
        industry
      });
      
      res.json({
        success: true,
        data: {
          summary,
          type: 'professional_summary'
        }
      });
    } catch (error) {
      logger.error('Generate summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate summary',
        error: error.message
      });
    }
  }
  
  // Improve description
  async improveDescription(req, res) {
    try {
      const { description, type, context } = req.body;
      
      if (!description || description.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Description is required'
        });
      }
      
      const improved = await aiService.improveDescription(description, {
        type: type || 'job_description',
        ...context
      });
      
      res.json({
        success: true,
        data: {
          original: description,
          improved: improved,
          type: type || 'job_description'
        }
      });
    } catch (error) {
      logger.error('Improve description error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to improve description',
        error: error.message
      });
    }
  }
  
  // Suggest skills
  async suggestSkills(req, res) {
    try {
      const { jobTitle, currentSkills, experienceLevel } = req.body;
      
      if (!jobTitle) {
        return res.status(400).json({
          success: false,
          message: 'Job title is required'
        });
      }
      
      const skills = await aiService.suggestSkills(
        jobTitle,
        experienceLevel || 'entry',
        currentSkills || []
      );
      
      res.json({
        success: true,
        data: {
          suggestedSkills: skills,
          jobTitle: jobTitle
        }
      });
    } catch (error) {
      logger.error('Suggest skills error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to suggest skills',
        error: error.message
      });
    }
  }
  
  // Analyze resume for ATS
  async analyzeATS(req, res) {
    try {
      const { resumeId, jobDescription } = req.body;
      
      // Fetch resume data
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }
      
      // Check access
      if (resume.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Analyze with AI
      const analysis = await aiService.analyzeATS(resume, jobDescription);
      
      // Update resume with ATS score
      resume.atsScore = analysis.score;
      resume.atsKeywords = analysis.keywords.map(k => ({
        keyword: k,
        matched: true,
        relevance: 0.8
      }));
      await resume.save();
      
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('ATS analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze resume',
        error: error.message
      });
    }
  }
  
  // Optimize resume for job description
  async optimizeForJob(req, res) {
    try {
      const { resumeId, jobDescription } = req.body;
      
      if (!jobDescription) {
        return res.status(400).json({
          success: false,
          message: 'Job description is required'
        });
      }
      
      // Fetch resume
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }
      
      // Check access
      if (resume.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Get optimization suggestions
      const optimization = await aiService.optimizeForJob(resume, jobDescription);
      
      res.json({
        success: true,
        data: optimization
      });
    } catch (error) {
      logger.error('Job optimization error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to optimize resume',
        error: error.message
      });
    }
  }
  
  // Generate interview questions
  async generateInterviewQuestions(req, res) {
    try {
      const { resumeId } = req.body;
      
      // Fetch resume
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }
      
      // Check access
      if (resume.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Generate questions
      const questions = await aiService.generateInterviewQuestions(resume);
      
      res.json({
        success: true,
        data: {
          questions: questions,
          count: questions.length
        }
      });
    } catch (error) {
      logger.error('Generate interview questions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate interview questions',
        error: error.message
      });
    }
  }
  
  // Batch improve multiple descriptions
  async batchImprove(req, res) {
    try {
      const { descriptions, type } = req.body;
      
      if (!descriptions || !Array.isArray(descriptions)) {
        return res.status(400).json({
          success: false,
          message: 'Descriptions array is required'
        });
      }
      
      const results = await Promise.all(
        descriptions.map(async (desc, index) => {
          const improved = await aiService.improveDescription(desc, { type });
          return {
            index,
            original: desc,
            improved
          };
        })
      );
      
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      logger.error('Batch improve error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process batch improvement',
        error: error.message
      });
    }
  }
  
  // Get AI usage stats (admin only)
  async getUsageStats(req, res) {
    try {
      // This would normally track API usage in database
      const stats = {
        totalRequests: 0,
        requestsByType: {
          summary: 0,
          improvement: 0,
          skills: 0,
          ats: 0,
          optimization: 0,
          interview: 0
        },
        estimatedCost: 0,
        lastReset: new Date()
      };
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get usage stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get usage stats'
      });
    }
  }
}

module.exports = new AIController();