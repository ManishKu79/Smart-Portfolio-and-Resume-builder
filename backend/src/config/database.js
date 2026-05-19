const mongoose = require('mongoose');
const logger = require('../utils/logger');

class DatabaseManager {
  constructor() {
    this.isConnected = false;
    this.retryCount = 0;
    this.maxRetries = 5;
  }

  async connect() {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    try {
      await mongoose.connect(process.env.MONGODB_URI, options);
      this.isConnected = true;
      this.retryCount = 0;
      
      logger.info('✅ Database connected successfully');
      this.setupEventHandlers();
      this.optimizeConnection();
      
    } catch (error) {
      logger.error('Database connection error:', error);
      await this.handleConnectionError(error);
    }
  }

  setupEventHandlers() {
    mongoose.connection.on('error', (err) => {
      logger.error('Database error:', err);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Database disconnected');
      this.isConnected = false;
      this.attemptReconnection();
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('Database reconnected');
      this.isConnected = true;
    });
  }

  async handleConnectionError(error) {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
      
      logger.info(`Retrying connection in ${delay}ms (Attempt ${this.retryCount}/${this.maxRetries})`);
      
      setTimeout(() => this.connect(), delay);
    } else {
      logger.error('Max retries reached. Could not connect to database.');
      process.exit(1);
    }
  }

  async attemptReconnection() {
    if (!this.isConnected) {
      logger.info('Attempting to reconnect to database...');
      await this.connect();
    }
  }

  optimizeConnection() {
    // Enable mongoose debug mode in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }

    // Enable query optimization
    mongoose.set('strictQuery', true);
    
    // Enable auto-indexing in development
    mongoose.set('autoIndex', process.env.NODE_ENV === 'development');
  }

  async disconnect() {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Database disconnected');
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  }
}

module.exports = new DatabaseManager();