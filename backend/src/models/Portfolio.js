const mongoose = require('mongoose');

<<<<<<< HEAD
// Section Schema
const sectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['about', 'work', 'projects', 'skills', 'contact', 'blog', 'gallery', 'testimonials', 'services'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  order: {
    type: Number,
    default: 0,
    index: true
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  customStyles: {
    backgroundColor: String,
    textColor: String,
    padding: String,
    margin: String
  }
}, {
  timestamps: true
});

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
  views: {
    type: Number,
    default: 0
  },
  uniqueVisitors: {
    type: Number,
    default: 0
  },
  clicksOnLinks: {
    type: Number,
    default: 0
  },
  contactFormSubmissions: {
    type: Number,
    default: 0
  },
  dailyViews: [{
    date: Date,
    count: { type: Number, default: 0 }
  }],
  referrers: [{
    source: String,
    count: { type: Number, default: 0 }
  }]
});

// Customization Schema
const customizationSchema = new mongoose.Schema({
  primaryColor: {
    type: String,
    default: '#3B82F6'
  },
  secondaryColor: {
    type: String,
    default: '#10B981'
  },
  accentColor: {
    type: String,
    default: '#EF4444'
  },
  fontFamily: {
    type: String,
    default: 'Inter'
  },
  headingFont: {
    type: String,
    default: 'Poppins'
  },
  layout: {
    type: String,
    enum: ['default', 'minimal', 'creative', 'corporate'],
    default: 'default'
  },
  navbarStyle: {
    type: String,
    enum: ['fixed', 'static', 'sticky'],
    default: 'sticky'
  },
  footerEnabled: {
    type: Boolean,
    default: true
  },
  animationsEnabled: {
    type: Boolean,
    default: true
  },
  customCSS: String,
  customJS: String
});

// SEO Schema
const seoSchema = new mongoose.Schema({
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  ogTitle: String,
  ogDescription: String,
  ogImage: String,
  twitterCard: String,
  canonicalUrl: String,
  robots: {
    type: String,
    default: 'index, follow'
  }
});

// Main Portfolio Schema
const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  title: {
    type: String,
    required: [true, 'Portfolio title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  sections: [sectionSchema],
  customization: customizationSchema,
  seo: seoSchema,
  analytics: {
    type: analyticsSchema,
    default: () => ({})
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  publishedAt: Date,
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  showResume: {
    type: Boolean,
    default: true
  },
  enableContactForm: {
    type: Boolean,
    default: true
  },
  enableAnalytics: {
    type: Boolean,
    default: true
  },
  customDomain: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  customDomainVerified: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    select: false
  },
  isPasswordProtected: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    index: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
portfolioSchema.index({ userId: 1, createdAt: -1 });
portfolioSchema.index({ userId: 1, isPublished: 1 });
portfolioSchema.index({ slug: 1, isPublished: 1 });
portfolioSchema.index({ customDomain: 1, isPublished: 1 });
portfolioSchema.index({ tags: 1, isPublished: 1 });
portfolioSchema.index({ createdAt: -1, 'analytics.views': -1 });

// Text search index
portfolioSchema.index({ 
  title: 'text',
  description: 'text',
  'sections.title': 'text',
  'sections.content': 'text',
  tags: 'text'
}, {
  name: 'portfolio_text_search'
});

// Update timestamps
portfolioSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  next();
});

// Generate unique slug
portfolioSchema.pre('save', async function(next) {
  if (!this.isModified('slug')) {
    return next();
  }
  
  const slug = this.slug;
  const existingPortfolio = await this.constructor.findOne({ slug });
  
  if (existingPortfolio && existingPortfolio._id.toString() !== this._id.toString()) {
    this.slug = `${slug}-${Date.now()}`;
  }
  
  next();
});

// Virtual for formatted URL
portfolioSchema.virtual('url').get(function() {
  if (this.customDomain && this.customDomainVerified) {
    return `https://${this.customDomain}`;
  }
  return `https://portfolio-builder.com/${this.slug}`;
});

// Method to increment view count
portfolioSchema.methods.incrementViews = async function() {
  this.analytics.views += 1;
  this.analytics.dailyViews.push({
    date: new Date(),
    count: 1
  });
  
  // Keep only last 30 days of daily views
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  this.analytics.dailyViews = this.analytics.dailyViews.filter(v => v.date > thirtyDaysAgo);
  
  await this.save();
};

// Method to get popular portfolios
portfolioSchema.statics.getPopular = async function(limit = 10) {
  return this.find({ isPublished: true })
    .sort({ 'analytics.views': -1, createdAt: -1 })
    .limit(limit)
    .select('title slug description customization.primaryColor analytics.views');
};

// Method to search portfolios
portfolioSchema.statics.searchPortfolios = async function(query, limit = 20) {
  return this.find(
    { $text: { $search: query }, isPublished: true },
    { score: { $meta: 'textScore' } }
  )
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit);
};

module.exports = mongoose.model('Portfolio', portfolioSchema);
=======
if (mongoose.models && mongoose.models.Portfolio) {
  module.exports = mongoose.models.Portfolio;
} else {
  const sectionSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['about', 'work', 'projects', 'skills', 'contact', 'blog', 'gallery', 'testimonials', 'services'],
      required: true
    },
    title: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0, index: true },
    isEnabled: { type: Boolean, default: true },
    customStyles: {
      backgroundColor: String,
      textColor: String,
      padding: String,
      margin: String
    }
  }, { timestamps: true });

  const analyticsSchema = new mongoose.Schema({
    views: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    clicksOnLinks: { type: Number, default: 0 },
    contactFormSubmissions: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    dailyViews: [{ date: Date, count: { type: Number, default: 0 } }],
    referrers: [{ source: String, count: { type: Number, default: 0 } }]
  });

  const customizationSchema = new mongoose.Schema({
    primaryColor: { type: String, default: '#3B82F6' },
    secondaryColor: { type: String, default: '#10B981' },
    accentColor: { type: String, default: '#EF4444' },
    fontFamily: { type: String, default: 'Inter' },
    headingFont: { type: String, default: 'Poppins' },
    layout: { type: String, enum: ['default', 'minimal', 'creative', 'corporate'], default: 'default' },
    navbarStyle: { type: String, enum: ['fixed', 'static', 'sticky'], default: 'sticky' },
    footerEnabled: { type: Boolean, default: true },
    animationsEnabled: { type: Boolean, default: true },
    customCSS: String,
    customJS: String
  });

  const seoSchema = new mongoose.Schema({
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    twitterCard: String,
    canonicalUrl: String,
    robots: { type: String, default: 'index, follow' }
  });

  const portfolioSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    title: {
      type: String,
      required: [true, 'Portfolio title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: { type: String, maxlength: [500, 'Description cannot exceed 500 characters'] },
    sections: [sectionSchema],
    customization: customizationSchema,
    seo: seoSchema,
    analytics: { type: analyticsSchema, default: () => ({}) },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: Date,
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
    showResume: { type: Boolean, default: true },
    enableContactForm: { type: Boolean, default: true },
    enableAnalytics: { type: Boolean, default: true },
    customDomain: { type: String, unique: true, sparse: true, lowercase: true },
    customDomainVerified: { type: Boolean, default: false },
    password: { type: String, select: false },
    isPasswordProtected: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    isArchived: { type: Boolean, default: false, index: true },
    tags: [{ type: String, trim: true, index: true }],
    collaborators: [{
      email: String,
      permission: { type: String, enum: ['view', 'edit'], default: 'view' },
      addedBy: mongoose.Schema.Types.ObjectId,
      addedAt: { type: Date, default: Date.now }
    }]
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  // Indexes
  portfolioSchema.index({ userId: 1, createdAt: -1 });
  portfolioSchema.index({ userId: 1, isPublished: 1 });
  portfolioSchema.index({ slug: 1, isPublished: 1 });
  portfolioSchema.index({ customDomain: 1, isPublished: 1 });
  portfolioSchema.index({ createdAt: -1, 'analytics.views': -1 });

  // Text search index
  portfolioSchema.index({ title: 'text', description: 'text', tags: 'text' });

  // Pre-save middleware
  portfolioSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    if (this.isPublished && !this.publishedAt) {
      this.publishedAt = Date.now();
    }
    next();
  });

  portfolioSchema.pre('save', async function(next) {
    if (!this.isModified('slug')) return next();
    
    const slug = this.slug;
    const existingPortfolio = await this.constructor.findOne({ slug });
    
    if (existingPortfolio && existingPortfolio._id.toString() !== this._id.toString()) {
      this.slug = `${slug}-${Date.now()}`;
    }
    next();
  });

  // Methods
  portfolioSchema.methods.incrementViews = async function() {
    this.analytics.views += 1;
    this.analytics.dailyViews.push({ date: new Date(), count: 1 });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.analytics.dailyViews = this.analytics.dailyViews.filter(v => v.date > thirtyDaysAgo);
    
    await this.save();
    return this;
  };

  // Virtuals
  portfolioSchema.virtual('url').get(function() {
    if (this.customDomain && this.customDomainVerified) {
      return `https://${this.customDomain}`;
    }
    return `https://portfolio-builder.com/${this.slug}`;
  });

  module.exports = mongoose.model('Portfolio', portfolioSchema);
}
>>>>>>> 804ddfb (changes)
