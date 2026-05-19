const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/public/:slug', portfolioController.getPublicPortfolio);
router.post('/public/:slug/contact', portfolioController.trackContactSubmission);
router.post('/public/:id/verify-password', portfolioController.verifyPortfolioPassword);
router.get('/public/:id/protected/:token', portfolioController.getProtectedPortfolio);
router.get('/themes', portfolioController.getThemes);

// Protected routes (authentication required)
router.use(protect);

// Portfolio CRUD operations
router.get('/', portfolioController.getAllPortfolios);
router.post('/', portfolioController.createPortfolio);
router.get('/analytics/:id', portfolioController.getAnalytics);
router.get('/:id', portfolioController.getPortfolioById);
router.put('/:id', portfolioController.updatePortfolio);
router.delete('/:id', portfolioController.deletePortfolio);

// Portfolio actions
router.post('/:id/publish', portfolioController.publishPortfolio);
router.post('/:id/unpublish', portfolioController.unpublishPortfolio);

// Section management
router.patch('/:id/sections/order', portfolioController.updateSectionOrder);
router.post('/:id/sections', portfolioController.addSection);
router.put('/:id/sections/:sectionId', portfolioController.updateSection);
router.delete('/:id/sections/:sectionId', portfolioController.deleteSection);

module.exports = router;