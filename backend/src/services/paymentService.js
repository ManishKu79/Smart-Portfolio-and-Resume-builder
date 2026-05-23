const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { UserSubscription, SubscriptionPlan } = require('../models/Subscription');
const User = require('../models/User');
const logger = require('../utils/logger');

class PaymentService {
  constructor() {
    this.initializePlans();
  }

  async initializePlans() {
    try {
      // Check if plans exist
      const planCount = await SubscriptionPlan.countDocuments();
      if (planCount === 0) {
        await this.createDefaultPlans();
      }
    } catch (error) {
      logger.error('Failed to initialize plans:', error);
    }
  }

  async createDefaultPlans() {
    const plans = [
      {
        name: 'free',
        displayName: 'Free',
        description: 'Perfect for getting started',
        price: { monthly: 0, yearly: 0 },
        features: [
          { name: 'Resumes', included: true, limit: 1 },
          { name: 'Portfolios', included: true, limit: 1 },
          { name: 'AI Suggestions', included: false, limit: 0 },
          { name: 'Custom Domain', included: false, limit: 0 },
          { name: 'Analytics', included: false, limit: 0 }
        ],
        limits: {
          maxResumes: 1,
          maxPortfolios: 1,
          aiCredits: 0,
          storage: 100,
          customDomain: false,
          prioritySupport: false,
          analytics: false,
          teamMembers: 0
        },
        order: 0
      },
      {
        name: 'pro',
        displayName: 'Pro',
        description: 'For professionals building their brand',
        price: { monthly: 19, yearly: 190 },
        features: [
          { name: 'Resumes', included: true, limit: 10 },
          { name: 'Portfolios', included: true, limit: 5 },
          { name: 'AI Suggestions', included: true, limit: 100 },
          { name: 'Custom Domain', included: true, limit: 1 },
          { name: 'Analytics', included: true, limit: 0 }
        ],
        limits: {
          maxResumes: 10,
          maxPortfolios: 5,
          aiCredits: 100,
          storage: 500,
          customDomain: true,
          prioritySupport: false,
          analytics: true,
          teamMembers: 0
        },
        order: 1
      },
      {
        name: 'enterprise',
        displayName: 'Enterprise',
        description: 'For teams and organizations',
        price: { monthly: 49, yearly: 490 },
        features: [
          { name: 'Resumes', included: true, limit: -1 },
          { name: 'Portfolios', included: true, limit: -1 },
          { name: 'AI Suggestions', included: true, limit: 1000 },
          { name: 'Custom Domain', included: true, limit: 3 },
          { name: 'Analytics', included: true, limit: 0 },
          { name: 'Priority Support', included: true, limit: 0 },
          { name: 'Team Members', included: true, limit: 5 }
        ],
        limits: {
          maxResumes: -1,
          maxPortfolios: -1,
          aiCredits: 1000,
          storage: 2000,
          customDomain: true,
          prioritySupport: true,
          analytics: true,
          teamMembers: 5
        },
        order: 2
      }
    ];

    for (const plan of plans) {
      await SubscriptionPlan.create(plan);
    }
    logger.info('Default subscription plans created');
  }

  async createCustomer(user) {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });

      // Update user with stripe customer id
      await User.findByIdAndUpdate(user._id, {
        'subscriptionDetails.stripeCustomerId': customer.id
      });

      return customer;
    } catch (error) {
      logger.error('Create customer error:', error);
      throw error;
    }
  }

  async createSubscription(user, priceId, paymentMethodId = null) {
    try {
      let customerId = user.subscriptionDetails?.stripeCustomerId;
      
      if (!customerId) {
        const customer = await this.createCustomer(user);
        customerId = customer.id;
      }

      if (paymentMethodId) {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId
        });
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId
          }
        });
      }

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: user._id.toString()
        }
      });

      // Create user subscription record
      const plan = await SubscriptionPlan.findOne({ stripePriceId: priceId });
      const userSubscription = await UserSubscription.create({
        userId: user._id,
        plan: plan.name,
        status: subscription.status,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        aiCreditsTotal: plan.limits.aiCredits
      });

      // Update user
      await User.findByIdAndUpdate(user._id, {
        subscriptionTier: plan.name,
        'subscriptionDetails.stripeSubscriptionId': subscription.id,
        subscriptionExpiresAt: new Date(subscription.current_period_end * 1000)
      });

      return {
        subscription,
        userSubscription,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
      };
    } catch (error) {
      logger.error('Create subscription error:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId, cancelImmediately = false) {
    try {
      if (cancelImmediately) {
        const subscription = await stripe.subscriptions.cancel(subscriptionId);
        await UserSubscription.findOneAndUpdate(
          { stripeSubscriptionId: subscriptionId },
          { status: 'canceled' }
        );
        return subscription;
      } else {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
        await UserSubscription.findOneAndUpdate(
          { stripeSubscriptionId: subscriptionId },
          { cancelAtPeriodEnd: true }
        );
        return subscription;
      }
    } catch (error) {
      logger.error('Cancel subscription error:', error);
      throw error;
    }
  }

  async updateSubscription(subscriptionId, newPriceId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const subscriptionItem = subscription.items.data[0];
      
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscriptionItem.id,
          price: newPriceId
        }],
        proration_behavior: 'create_prorations'
      });

      const plan = await SubscriptionPlan.findOne({ stripePriceId: newPriceId });
      await UserSubscription.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        { plan: plan.name }
      );

      return updatedSubscription;
    } catch (error) {
      logger.error('Update subscription error:', error);
      throw error;
    }
  }

  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      logger.error('Webhook handling error:', error);
      throw error;
    }
  }

  async handleSubscriptionUpdated(subscription) {
    const userSubscription = await UserSubscription.findOne({
      stripeSubscriptionId: subscription.id
    });
    
    if (userSubscription) {
      userSubscription.status = subscription.status;
      userSubscription.currentPeriodStart = new Date(subscription.current_period_start * 1000);
      userSubscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      userSubscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;
      await userSubscription.save();

      // Update user
      await User.findByIdAndUpdate(userSubscription.userId, {
        subscriptionExpiresAt: new Date(subscription.current_period_end * 1000)
      });
    }
  }

  async handleSubscriptionDeleted(subscription) {
    await UserSubscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      { status: 'canceled' }
    );

    const userSubscription = await UserSubscription.findOne({
      stripeSubscriptionId: subscription.id
    });
    
    if (userSubscription) {
      await User.findByIdAndUpdate(userSubscription.userId, {
        subscriptionTier: 'free',
        subscriptionExpiresAt: null
      });
    }
  }

  async handlePaymentSucceeded(invoice) {
    // Update subscription credits
    if (invoice.subscription) {
      const userSubscription = await UserSubscription.findOne({
        stripeSubscriptionId: invoice.subscription
      });
      
      if (userSubscription) {
        // Reset AI credits for new period
        const plan = await SubscriptionPlan.findOne({ name: userSubscription.plan });
        userSubscription.aiCreditsUsed = 0;
        userSubscription.aiCreditsTotal = plan.limits.aiCredits;
        await userSubscription.save();
      }
    }
  }

  async handlePaymentFailed(invoice) {
    // Send notification to user about payment failure
    const userSubscription = await UserSubscription.findOne({
      stripeSubscriptionId: invoice.subscription
    });
    
    if (userSubscription) {
      userSubscription.status = 'past_due';
      await userSubscription.save();
      // Trigger notification
    }
  }

  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata
      });
      return paymentIntent;
    } catch (error) {
      logger.error('Create payment intent error:', error);
      throw error;
    }
  }

  async getInvoice(subscriptionId) {
    try {
      const invoices = await stripe.invoices.list({
        subscription: subscriptionId,
        limit: 1
      });
      return invoices.data[0];
    } catch (error) {
      logger.error('Get invoice error:', error);
      throw error;
    }
  }

  async getUpcomingInvoice(subscriptionId) {
    try {
      const invoice = await stripe.invoices.upcoming({
        subscription: subscriptionId
      });
      return invoice;
    } catch (error) {
      logger.error('Get upcoming invoice error:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();