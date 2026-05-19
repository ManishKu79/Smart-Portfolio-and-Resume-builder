const express = require('express');
const router = express.Router();
const realtimeController = require('../controllers/realtimeController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Notification routes
router.get('/notifications', realtimeController.getNotifications);
router.put('/notifications/:id/read', realtimeController.markNotificationRead);
router.put('/notifications/read-all', realtimeController.markAllRead);
router.delete('/notifications/:id', realtimeController.deleteNotification);

// Collaboration routes
router.get('/collaboration/:documentType/:documentId', realtimeController.getCollaborationStatus);
router.post('/collaboration/:documentType/:documentId/share', realtimeController.shareDocument);
router.delete('/collaboration/:documentType/:documentId/collaborator/:collaboratorId', realtimeController.removeCollaborator);

// Session routes
router.get('/sessions', realtimeController.getActiveSessions);

module.exports = router;