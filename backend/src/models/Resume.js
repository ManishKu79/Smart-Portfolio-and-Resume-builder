const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  location: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String,
  achievements: [String]
});

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String,
  grade: String
});

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, min: 1, max: 5, default: 3 }
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  technologies: [String],
  link: String,
  github: String,
  startDate: Date,
  endDate: Date
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: String,
  date: Date,
  credentialId: String,
  link: String
});

const languageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  proficiency: {
    type: String,
    enum: ['basic', 'conversational', 'fluent', 'native'],
    default: 'basic'
  }
});

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    trim: true
  },
  template: {
    type: String,
    default: 'modern',
    enum: ['modern', 'classic', 'creative', 'minimal']
  },
  personalInfo: {
    fullName: { type: String, required: true },
    jobTitle: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    website: String,
    summary: String
  },
  experience: [experienceSchema],
  education: [educationSchema],
  skills: [skillSchema],
  projects: [projectSchema],
  certifications: [certificationSchema],
  languages: [languageSchema],
  customSections: [{
    title: String,
    content: String,
    order: Number
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  atsScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update updatedAt on save
resumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Resume', resumeSchema);