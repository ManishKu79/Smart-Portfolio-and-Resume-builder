const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

<<<<<<< HEAD
// All routes are protected
router.use(protect);

// Resume CRUD operations
router.get('/', resumeController.getAllResumes);
router.post('/', resumeController.createResume);
router.get('/stats', resumeController.getResumeStats);
router.get('/templates', resumeController.getTemplates);
router.get('/public/:shareableLink', resumeController.getPublicResume);
router.get('/:id', resumeController.getResumeById);
router.put('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);
router.post('/:id/duplicate', resumeController.duplicateResume);
router.patch('/:id/toggle-public', resumeController.togglePublic);
router.patch('/:id/archive', resumeController.archiveResume);
router.patch('/:id/section-order', resumeController.updateSectionOrder);
=======
// Simple placeholder routes
router.get('/', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Resume routes - Phase 7 implemented',
    data: []
  });
});

router.post('/', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Create resume - Phase 7 implemented',
    data: { ...req.body, _id: 'mock-id' }
  });
});

router.get('/:id', protect, (req, res) => {
  res.json({
    success: true,
    message: `Get resume ${req.params.id}`,
    data: { id: req.params.id }
  });
});

router.put('/:id', protect, (req, res) => {
  res.json({
    success: true,
    message: `Update resume ${req.params.id}`,
    data: { id: req.params.id, ...req.body }
  });
});

router.delete('/:id', protect, (req, res) => {
  res.json({
    success: true,
    message: `Delete resume ${req.params.id}`
  });
});
>>>>>>> 804ddfb (changes)

module.exports = router;