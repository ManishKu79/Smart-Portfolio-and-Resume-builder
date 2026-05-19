const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

// All AI routes require authentication
router.use(protect);

// Resume AI features
router.post('/generate-summary', aiController.generateSummary);
router.post('/improve-description', aiController.improveDescription);
router.post('/suggest-skills', aiController.suggestSkills);
router.post('/analyze-ats', aiController.analyzeATS);
router.post('/optimize-for-job', aiController.optimizeForJob);
router.post('/generate-interview-questions', aiController.generateInterviewQuestions);
router.post('/batch-improve', aiController.batchImprove);

// Admin routes
router.get('/usage-stats', authorize('admin'), aiController.getUsageStats);

module.exports = router;