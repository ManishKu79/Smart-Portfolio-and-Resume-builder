const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

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

module.exports = router;