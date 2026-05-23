const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['free', 'pro', 'enterprise'] },
  displayName: { type: String, required: true },
  description: String,
  price: { monthly: { type: Number, default: 0 }, yearly: { type: Number, default: 0 } },
  currency: { type: String, default: 'usd' },
  features: [{ name: String, included: Boolean, limit: Number }],
  limits: {
    maxResumes: { type: Number, default: 1 },
    maxPortfolios: { type: Number, default: 1 },
    aiCredits: { type: Number, default: 0 },
    storage: { type: Number, default: 100 },
    customDomain: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
    teamMembers: { type: Number, default: 0 }
  },
  stripePriceId: { monthly: String, yearly: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const userSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  status: { type: String, enum: ['active', 'past_due', 'canceled', 'incomplete', 'trialing'], default: 'active' },
  stripeSubscriptionId: String,
  stripeCustomerId: String,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: { type: Boolean, default: false },
  trialStart: Date,
  trialEnd: Date,
  aiCreditsUsed: { type: Number, default: 0 },
  aiCreditsTotal: { type: Number, default: 0 },
  features: { type: mongoose.Schema.Types.Mixed, default: {} },
  paymentMethod: {
    brand: String,
    last4: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  invoiceSettings: {
    email: String,
    phone: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Indexes
subscriptionPlanSchema.index({ name: 1 });
userSubscriptionSchema.index({ userId: 1 });
userSubscriptionSchema.index({ stripeCustomerId: 1 });
userSubscriptionSchema.index({ stripeSubscriptionId: 1 });
userSubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });

// Methods
userSubscriptionSchema.methods.hasFeature = function(featureName) {
  const planFeatures = this.features[featureName];
  if (planFeatures !== undefined) return planFeatures;
  
  const defaultLimits = {
    free: { maxResumes: 1, maxPortfolios: 1, aiCredits: 0 },
    pro: { maxResumes: 10, maxPortfolios: 5, aiCredits: 100 },
    enterprise: { maxResumes: -1, maxPortfolios: -1, aiCredits: 1000 }
  };
  
  const limits = defaultLimits[this.plan];
  return limits[featureName] === -1 ? true : (limits[featureName] || 0);
};

userSubscriptionSchema.methods.useAICredit = async function() {
  if (this.aiCreditsUsed >= this.aiCreditsTotal) return false;
  this.aiCreditsUsed += 1;
  await this.save();
  return true;
};

userSubscriptionSchema.methods.getRemainingAICredits = function() {
  return Math.max(0, this.aiCreditsTotal - this.aiCreditsUsed);
};

// Safe export
const SubscriptionPlan = mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
const UserSubscription = mongoose.models.UserSubscription || mongoose.model('UserSubscription', userSubscriptionSchema);

module.exports = { SubscriptionPlan, UserSubscription };