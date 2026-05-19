const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server is running!`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📊 Database Status:`);
  console.log(`   Connection: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
  console.log(`\n✨ Ready to accept requests\n`);
  
  logger.info(`Server started on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing server...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});