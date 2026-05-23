const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/plans', subscriptionController.getPlans);

// Webhook (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), subscriptionController.handleWebhook);

// Protected routes
router.use(protect);
router.get('/current', subscriptionController.getCurrentSubscription);
router.post('/create-checkout-session', subscriptionController.createCheckoutSession);
router.post('/create-portal-session', subscriptionController.createPortalSession);
router.post('/cancel', subscriptionController.cancelSubscription);
router.get('/invoices', subscriptionController.getInvoices);

module.exports = router;