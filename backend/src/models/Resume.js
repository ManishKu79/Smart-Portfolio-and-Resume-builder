const mongoose = require('mongoose');

<<<<<<< HEAD
// Sub-schemas
const experienceSchema = new mongoose.Schema({
  company: { 
    type: String, 
    required: true,
    trim: true,
    index: true
  },
  position: { 
    type: String, 
    required: true,
    trim: true
  },
  location: String,
  startDate: { 
    type: Date, 
    required: true,
    index: true
  },
  endDate: Date,
  current: { 
    type: Boolean, 
    default: false 
  },
  description: {
    type: String,
    maxlength: 1000
  },
  achievements: [{
    type: String,
    maxlength: 500
  }],
  technologies: [String]
}, {
  timestamps: true
});

const educationSchema = new mongoose.Schema({
  institution: { 
    type: String, 
    required: true,
    trim: true,
    index: true
  },
  degree: { 
    type: String, 
    required: true,
    trim: true
  },
  field: {
    type: String,
    trim: true
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: Date,
  current: { 
    type: Boolean, 
    default: false 
  },
  description: {
    type: String,
    maxlength: 500
  },
  grade: {
    type: String,
    trim: true
  },
  achievements: [String]
}, {
  timestamps: true
});

const skillSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  category: {
    type: String,
    enum: ['technical', 'soft', 'language', 'other'],
    default: 'technical'
  },
  level: { 
    type: Number, 
    min: 1, 
    max: 5, 
    default: 3 
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    default: 0
  }
});

const projectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  technologies: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  link: {
    type: String,
    trim: true
  },
  github: {
    type: String,
    trim: true
  },
  startDate: Date,
  endDate: Date,
  featured: {
    type: Boolean,
    default: false
  },
  imageUrl: String
}, {
  timestamps: true
});

const certificationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  issuer: {
    type: String,
    required: true,
    trim: true
  },
  date: Date,
  credentialId: String,
  link: String,
  expiresAt: Date
}, {
  timestamps: true
});

const languageSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  proficiency: {
    type: String,
    enum: ['basic', 'conversational', 'fluent', 'native'],
    default: 'basic'
  },
  certificate: String
});

const customSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  isEnabled: {
    type: Boolean,
    default: true
  }
});

// Main Resume Schema
const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  template: {
    type: String,
    default: 'modern',
    enum: ['modern', 'classic', 'creative', 'minimal', 'professional']
  },
  templateColor: {
    type: String,
    default: '#3B82F6'
  },
  fontSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  personalInfo: {
    fullName: { 
      type: String, 
      required: true,
      trim: true,
      index: true
    },
    jobTitle: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    github: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    summary: {
      type: String,
      maxlength: 1000
    },
    photo: String
  },
  experience: [experienceSchema],
  education: [educationSchema],
  skills: [skillSchema],
  projects: [projectSchema],
  certifications: [certificationSchema],
  languages: [languageSchema],
  customSections: [customSectionSchema],
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  atsScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    index: true
  },
  atsKeywords: [{
    keyword: String,
    matched: Boolean,
    relevance: Number
  }],
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  shareableLink: {
    type: String,
    unique: true,
    sparse: true
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
  }],
  lastViewedAt: Date,
  lastDownloadedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ userId: 1, isPublic: 1 });
resumeSchema.index({ userId: 1, isArchived: 1 });
resumeSchema.index({ 'personalInfo.fullName': 1, userId: 1 });
resumeSchema.index({ atsScore: -1, createdAt: -1 });
resumeSchema.index({ tags: 1, isPublic: 1 });

// Text search index
resumeSchema.index({ 
  'personalInfo.fullName': 'text',
  'personalInfo.jobTitle': 'text',
  'personalInfo.summary': 'text',
  title: 'text',
  'skills.name': 'text'
}, {
  weights: {
    'personalInfo.fullName': 10,
    title: 8,
    'personalInfo.jobTitle': 5,
    'skills.name': 3,
    'personalInfo.summary': 2
  },
  name: 'resume_text_search'
});
=======
if (mongoose.models && mongoose.models.Resume) {
  module.exports = mongoose.models.Resume;
} else {
  const experienceSchema = new mongoose.Schema({
    company: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    location: String,
    startDate: { type: Date, required: true },
    endDate: Date,
    current: { type: Boolean, default: false },
    description: { type: String, maxlength: 1000 },
    achievements: [{ type: String, maxlength: 500 }],
    technologies: [String]
  }, { timestamps: true });

  const educationSchema = new mongoose.Schema({
    institution: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    field: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    current: { type: Boolean, default: false },
    description: { type: String, maxlength: 500 },
    grade: String,
    achievements: [String]
  }, { timestamps: true });

  const skillSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, lowercase: true },
    category: { type: String, enum: ['technical', 'soft', 'language', 'other'], default: 'technical' },
    level: { type: Number, min: 1, max: 5, default: 3 },
    yearsOfExperience: { type: Number, min: 0, default: 0 }
  });

  const projectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 1000 },
    technologies: [{ type: String, trim: true, lowercase: true }],
    link: String,
    github: String,
    startDate: Date,
    endDate: Date,
    featured: { type: Boolean, default: false },
    imageUrl: String
  }, { timestamps: true });
>>>>>>> 804ddfb (changes)

  const certificationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    date: Date,
    credentialId: String,
    link: String,
    expiresAt: Date
  }, { timestamps: true });

<<<<<<< HEAD
// Generate shareable link
resumeSchema.pre('save', async function(next) {
  if (this.isPublic && !this.shareableLink) {
    const crypto = require('crypto');
    this.shareableLink = crypto.randomBytes(16).toString('hex');
  }
  next();
});

// Virtual for formatted experience duration
resumeSchema.virtual('totalExperience').get(function() {
  if (!this.experience || this.experience.length === 0) return 0;
  
  let totalMonths = 0;
  this.experience.forEach(exp => {
    if (exp.startDate) {
      const endDate = exp.endDate || new Date();
      const months = (endDate - exp.startDate) / (1000 * 60 * 60 * 24 * 30);
      totalMonths += months;
    }
  });
  return Math.floor(totalMonths / 12);
});

// Method to calculate ATS score
resumeSchema.methods.calculateATSScore = function(jobDescription) {
  let score = 0;
  // This will be implemented in Phase 10 with AI
  return score;
};

// Static method to find popular resumes
resumeSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isPublic: true })
    .sort({ views: -1, downloads: -1 })
    .limit(limit)
    .select('personalInfo.fullName title template views downloads');
};

module.exports = mongoose.model('Resume', resumeSchema);
=======
  const languageSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    proficiency: { type: String, enum: ['basic', 'conversational', 'fluent', 'native'], default: 'basic' },
    certificate: String
  });

  const customSectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    order: { type: Number, default: 0 },
    isEnabled: { type: Boolean, default: true }
  });

  const resumeSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Resume title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    template: {
      type: String,
      default: 'modern',
      enum: ['modern', 'classic', 'creative', 'minimal', 'professional']
    },
    templateColor: { type: String, default: '#3B82F6' },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    personalInfo: {
      fullName: { type: String, required: true, trim: true },
      jobTitle: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      website: String,
      summary: { type: String, maxlength: 1000 },
      photo: String
    },
    experience: [experienceSchema],
    education: [educationSchema],
    skills: [skillSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    languages: [languageSchema],
    customSections: [customSectionSchema],
    isPublic: { type: Boolean, default: false, index: true },
    atsScore: { type: Number, default: 0, min: 0, max: 100, index: true },
    atsKeywords: [{ keyword: String, matched: Boolean, relevance: Number }],
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    shareableLink: { type: String, unique: true, sparse: true },
    version: { type: Number, default: 1 },
    isArchived: { type: Boolean, default: false, index: true },
    tags: [{ type: String, trim: true, index: true }],
    collaborators: [{
      email: String,
      permission: { type: String, enum: ['view', 'edit'], default: 'view' },
      addedBy: mongoose.Schema.Types.ObjectId,
      addedAt: { type: Date, default: Date.now }
    }],
    lastViewedAt: Date,
    lastDownloadedAt: Date
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  // Indexes
  resumeSchema.index({ userId: 1, createdAt: -1 });
  resumeSchema.index({ userId: 1, isPublic: 1 });
  resumeSchema.index({ userId: 1, isArchived: 1 });
  resumeSchema.index({ 'personalInfo.fullName': 1, userId: 1 });
  resumeSchema.index({ atsScore: -1, createdAt: -1 });
  resumeSchema.index({ shareableLink: 1 });

  // Text search index
  resumeSchema.index({ 
    'personalInfo.fullName': 'text',
    'personalInfo.jobTitle': 'text',
    'personalInfo.summary': 'text',
    title: 'text',
    'skills.name': 'text'
  });

  // Pre-save middleware
  resumeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });

  resumeSchema.pre('save', async function(next) {
    if (this.isPublic && !this.shareableLink) {
      const crypto = require('crypto');
      this.shareableLink = crypto.randomBytes(16).toString('hex');
    }
    next();
  });

  // Virtuals
  resumeSchema.virtual('totalExperience').get(function() {
    if (!this.experience || this.experience.length === 0) return 0;
    
    let totalMonths = 0;
    this.experience.forEach(exp => {
      if (exp.startDate) {
        const endDate = exp.endDate || new Date();
        const months = (endDate - exp.startDate) / (1000 * 60 * 60 * 24 * 30);
        totalMonths += months;
      }
    });
    return Math.floor(totalMonths / 12);
  });

  module.exports = mongoose.model('Resume', resumeSchema);
}
>>>>>>> 804ddfb (changes)
