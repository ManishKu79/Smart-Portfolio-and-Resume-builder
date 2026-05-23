const { UserSubscription, SubscriptionPlan } = require('../models/Subscription');
const paymentService = require('../services/paymentService');
const User = require('../models/User');
const logger = require('../utils/logger');

class SubscriptionController {
  // Get all available plans
  async getPlans(req, res) {
    try {
      const plans = await SubscriptionPlan.find({ isActive: true })
        .sort({ order: 1 });
      
      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      logger.error('Get plans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch plans'
      });
    }
  }

  // Get current user's subscription
  async getCurrentSubscription(req, res) {
    try {
      const subscription = await UserSubscription.findOne({ userId: req.user._id });
      const user = await User.findById(req.user._id);
      
      res.json({
        success: true,
        data: {
          plan: user.subscriptionTier,
          subscription: subscription,
          usage: {
            resumes: await this.getResumeCount(req.user._id),
            portfolios: await this.getPortfolioCount(req.user._id),
            aiCreditsUsed: subscription?.aiCreditsUsed || 0,
            aiCreditsTotal: subscription?.aiCreditsTotal || 0
          }
        }
      });
    } catch (error) {
      logger.error('Get current subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscription'
      });
    }
  }

  // Create checkout session
  async createCheckoutSession(req, res) {
    try {
      const { priceId, successUrl, cancelUrl } = req.body;
      
      let customerId = req.user.subscriptionDetails?.stripeCustomerId;
      
      if (!customerId) {
        const customer = await paymentService.createCustomer(req.user);
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'subscription',
        success_url: successUrl || `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.CLIENT_URL}/pricing`,
        metadata: {
          userId: req.user._id.toString()
        }
      });

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url
        }
      });
    } catch (error) {
      logger.error('Create checkout session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create checkout session'
      });
    }
  }

  // Create billing portal session
  async createPortalSession(req, res) {
    try {
      const customerId = req.user.subscriptionDetails?.stripeCustomerId;
      
      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'No customer found'
        });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.CLIENT_URL}/dashboard`
      });

      res.json({
        success: true,
        data: {
          url: session.url
        }
      });
    } catch (error) {
      logger.error('Create portal session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create portal session'
      });
    }
  }

  // Cancel subscription
  async cancelSubscription(req, res) {
    try {
      const { cancelImmediately = false } = req.body;
      const subscription = await UserSubscription.findOne({ userId: req.user._id });
      
      if (!subscription || !subscription.stripeSubscriptionId) {
        return res.status(400).json({
          success: false,
          message: 'No active subscription found'
        });
      }

      await paymentService.cancelSubscription(
        subscription.stripeSubscriptionId,
        cancelImmediately
      );

      if (cancelImmediately) {
        await User.findByIdAndUpdate(req.user._id, {
          subscriptionTier: 'free'
        });
      }

      res.json({
        success: true,
        message: cancelImmediately ? 'Subscription canceled' : 'Subscription will cancel at period end'
      });
    } catch (error) {
      logger.error('Cancel subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription'
      });
    }
  }

  // Get invoice history
  async getInvoices(req, res) {
    try {
      const subscription = await UserSubscription.findOne({ userId: req.user._id });
      
      if (!subscription || !subscription.stripeCustomerId) {
        return res.json({
          success: true,
          data: []
        });
      }

      const invoices = await stripe.invoices.list({
        customer: subscription.stripeCustomerId,
        limit: 12
      });

      res.json({
        success: true,
        data: invoices.data
      });
    } catch (error) {
      logger.error('Get invoices error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch invoices'
      });
    }
  }

  // Webhook handler
  async handleWebhook(req, res) {
    try {
      const sig = req.headers['stripe-signature'];
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      await paymentService.handleWebhook(event);

      res.json({ received: true });
    } catch (error) {
      logger.error('Webhook error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Helper methods
  async getResumeCount(userId) {
    const Resume = require('../models/Resume');
    return await Resume.countDocuments({ userId });
  }

  async getPortfolioCount(userId) {
    const Portfolio = require('../models/Portfolio');
    return await Portfolio.countDocuments({ userId });
  }
}

module.exports = new SubscriptionController();