const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', adminController.getSystemAnalytics);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Resume management
router.get('/resumes', adminController.getAllResumes);
router.delete('/resumes/:id', adminController.deleteResume);

// System management
router.post('/notifications', adminController.sendSystemNotification);
router.get('/logs', adminController.getActivityLogs);

module.exports = router;