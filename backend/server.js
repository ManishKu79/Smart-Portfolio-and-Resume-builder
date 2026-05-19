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
});