const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');

<<<<<<< HEAD
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
=======
// Simple placeholder routes
router.get('/', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Portfolio routes - Phase 8 implemented',
    data: []
  });
});

router.post('/', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Create portfolio - Phase 8 implemented',
    data: { ...req.body, _id: 'mock-id' }
  });
});

router.get('/:id', protect, (req, res) => {
  res.json({
    success: true,
    message: `Get portfolio ${req.params.id}`,
    data: { id: req.params.id }
  });
});

router.put('/:id', protect, (req, res) => {
  res.json({
    success: true,
    message: `Update portfolio ${req.params.id}`,
    data: { id: req.params.id, ...req.body }
  });
});

router.delete('/:id', protect, (req, res) => {
  res.json({
    success: true,
    message: `Delete portfolio ${req.params.id}`
  });
});
>>>>>>> 804ddfb (changes)

module.exports = router;