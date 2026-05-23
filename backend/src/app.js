const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
<<<<<<< HEAD
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');

const databaseManager = require('./config/database');
const dbOptimizer = require('./utils/dbOptimizer');
=======
const compression = require('compression');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

>>>>>>> 804ddfb (changes)
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
<<<<<<< HEAD
const pdfRoutes = require('./routes/pdfRoutes');

const app = express();

// Connect to database
databaseManager.connect().then(async () => {
  // Create indexes after connection
  await dbOptimizer.createIndexes();
  
  // Enable profiling in development
  if (process.env.NODE_ENV === 'development') {
    dbOptimizer.enableProfiling(2);
  }
});

=======

const app = express();

>>>>>>> 804ddfb (changes)
// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
<<<<<<< HEAD
app.use(mongoSanitize());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);
=======
>>>>>>> 804ddfb (changes)

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Health check endpoint
<<<<<<< HEAD
app.get('/health', async (req, res) => {
  const dbStatus = databaseManager.getConnectionStatus();
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbStatus,
=======
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
>>>>>>> 804ddfb (changes)
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/portfolios', portfolioRoutes);
<<<<<<< HEAD
app.use('/api/pdf', pdfRoutes);
=======

>>>>>>> 804ddfb (changes)
// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;