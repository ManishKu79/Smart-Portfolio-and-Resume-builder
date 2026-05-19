const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { protect } = require('../middleware/auth');

// Public route for preview (if resume is public)
router.get('/resume/:id/preview', pdfController.previewResume);

// Protected routes
router.use(protect);

// Resume PDF export
router.get('/resume/:id/export', pdfController.exportResume);
router.get('/resume/:id/preview-protected', pdfController.previewResume);

// Portfolio PDF export
router.get('/portfolio/:id/export', pdfController.exportPortfolio);

// PDF options
router.get('/options', pdfController.getPDFOptions);

module.exports = router;