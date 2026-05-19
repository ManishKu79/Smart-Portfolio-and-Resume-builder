const mongoose = require('mongoose');
const logger = require('./logger');

class DatabaseOptimizer {
  constructor() {
    this.indexesCreated = false;
  }

  // Create all necessary indexes
  async createIndexes() {
    if (this.indexesCreated) {
      logger.info('Indexes already created');
      return;
    }

    try {
      const User = mongoose.model('User');
      const Resume = mongoose.model('Resume');
      const Portfolio = mongoose.model('Portfolio');

      // User indexes
      await User.collection.createIndexes([
        { key: { email: 1 }, unique: true },
        { key: { role: 1, createdAt: -1 } },
        { key: { subscriptionTier: 1, subscriptionExpiresAt: 1 } },
        { key: { lastLogin: -1 } },
        { key: { isActive: 1, createdAt: -1 } }
      ]);

      // Resume indexes
      await Resume.collection.createIndexes([
        { key: { userId: 1, createdAt: -1 } },
        { key: { userId: 1, isPublic: 1 } },
        { key: { 'personalInfo.fullName': 'text' } },
        { key: { atsScore: -1 } },
        { key: { shareableLink: 1 }, unique: true, sparse: true }
      ]);

      // Portfolio indexes
      await Portfolio.collection.createIndexes([
        { key: { userId: 1, createdAt: -1 } },
        { key: { slug: 1 }, unique: true },
        { key: { customDomain: 1 }, unique: true, sparse: true },
        { key: { isPublished: 1, 'analytics.views': -1 } },
        { key: { title: 'text', description: 'text', tags: 'text' } }
      ]);

      this.indexesCreated = true;
      logger.info('✅ Database indexes created successfully');
      
    } catch (error) {
      logger.error('Error creating indexes:', error);
    }
  }

  // Get database statistics
  async getStatistics() {
    try {
      const stats = {
        collections: {},
        totalSize: 0,
        indexes: 0
      };

      const collections = await mongoose.connection.db.collections();
      
      for (const collection of collections) {
        const collectionName = collection.collectionName;
        const collectionStats = await collection.stats();
        
        stats.collections[collectionName] = {
          documentCount: collectionStats.count,
          size: collectionStats.size,
          avgObjectSize: collectionStats.avgObjSize,
          indexes: collectionStats.nindexes,
          indexSize: collectionStats.totalIndexSize
        };
        
        stats.totalSize += collectionStats.size;
        stats.indexes += collectionStats.nindexes;
      }

      return stats;
    } catch (error) {
      logger.error('Error getting database statistics:', error);
      return null;
    }
  }

  // Optimize query performance
  async analyzeSlowQueries() {
    try {
      const slowQueries = await mongoose.connection.db
        .collection('system.profile')
        .find({ millis: { $gt: 100 } })
        .sort({ millis: -1 })
        .limit(10)
        .toArray();
      
      if (slowQueries.length > 0) {
        logger.warn(`Found ${slowQueries.length} slow queries`);
        slowQueries.forEach(query => {
          logger.warn(`Slow query (${query.millis}ms): ${query.query}`);
        });
      }
      
      return slowQueries;
    } catch (error) {
      logger.error('Error analyzing slow queries:', error);
      return [];
    }
  }

  // Enable query profiling (development only)
  enableProfiling(level = 2) {
    if (process.env.NODE_ENV === 'development') {
      mongoose.connection.db.command({
        profile: level,
        slowms: 100
      }, (err, result) => {
        if (err) {
          logger.error('Error enabling profiling:', err);
        } else {
          logger.info(`Query profiling enabled (level ${level})`);
        }
      });
    }
  }
}

module.exports = new DatabaseOptimizer();