<<<<<<< HEAD
const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const logger = require('./src/utils/logger');
const SocketService = require('./src/services/socketService');

const PORT = process.env.PORT || 5000;

// START SERVER
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server is running!`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 WebSocket: ws://localhost:${PORT}`);

  console.log(`\n📊 Database Status:`);
  console.log(
    `   Connection: ${
      process.env.MONGODB_URI
        ? 'Configured'
        : 'Not configured'
    }`
  );

  console.log(`\n✨ Ready to accept requests\n`);

  logger.info(`Server started on port ${PORT}`);
});

// SOCKET.IO / WEBSOCKET
const socketService = new SocketService(server);

app.set('socketService', socketService);

// UNHANDLED PROMISE REJECTION
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);

  console.error('❌ Unhandled Rejection:', err);

  server.close(() => process.exit(1));
});

// UNCAUGHT EXCEPTION
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);

  console.error('❌ Uncaught Exception:', err);

  process.exit(1);
});

// GRACEFUL SHUTDOWN
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing server...');

  server.close(() => {
    logger.info('Server closed');

    process.exit(0);
  });
=======
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/portfolio_db')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// ==================== MODELS ====================

// User Model
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Resume Model
const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Resume = mongoose.model('Resume', ResumeSchema);

// Portfolio Model
const PortfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: Object, default: {} },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

// ==================== MIDDLEWARE ====================

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.userId);
    
    if (!user) throw new Error();
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Please authenticate' });
  }
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret123');
    
    res.status(201).json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email }, token }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret123');
    
    res.json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email }, token }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Current User
app.get('/api/auth/me', auth, async (req, res) => {
  res.json({ success: true, data: req.user });
});

// ==================== RESUME ROUTES ====================

// Get all resumes
app.get('/api/resumes', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single resume
app.get('/api/resumes/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    res.json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create resume
app.post('/api/resumes', auth, async (req, res) => {
  try {
    const resume = await Resume.create({
      userId: req.user._id,
      title: req.body.title || 'Untitled Resume',
      content: req.body.content || {}
    });
    res.status(201).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update resume
app.put('/api/resumes/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    res.json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete resume
app.delete('/api/resumes/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    res.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PORTFOLIO ROUTES ====================

// Get all portfolios
app.get('/api/portfolios', auth, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: portfolios });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single portfolio
app.get('/api/portfolios/:id', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get public portfolio by slug
app.get('/api/portfolios/public/:slug', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ slug: req.params.slug, isPublished: true });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });
    const user = await User.findById(portfolio.userId).select('name email');
    res.json({ success: true, data: { portfolio, user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create portfolio
app.post('/api/portfolios', auth, async (req, res) => {
  try {
    const slug = req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const portfolio = await Portfolio.create({
      userId: req.user._id,
      title: req.body.title || 'My Portfolio',
      slug,
      content: req.body.content || {}
    });
    res.status(201).json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update portfolio
app.put('/api/portfolios/:id', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Publish portfolio
app.post('/api/portfolios/:id/publish', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isPublished: true, updatedAt: Date.now() },
      { new: true }
    );
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete portfolio
app.delete('/api/portfolios/:id', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });
    res.json({ success: true, message: 'Portfolio deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth routes: /api/auth/register, /api/auth/login`);
  console.log(`📄 Resume routes: /api/resumes`);
  console.log(`🎨 Portfolio routes: /api/portfolios\n`);
>>>>>>> 804ddfb (changes)
});