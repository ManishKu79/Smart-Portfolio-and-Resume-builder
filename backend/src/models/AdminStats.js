const mongoose = require('mongoose');

const adminStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    unique: true,
    index: true
  },
  users: {
    total: { type: Number, default: 0 },
    newToday: { type: Number, default: 0 },
    activeToday: { type: Number, default: 0 },
    verified: { type: Number, default: 0 },
    bySubscription: {
      free: { type: Number, default: 0 },
      pro: { type: Number, default: 0 },
      enterprise: { type: Number, default: 0 }
    }
  },
  resumes: {
    total: { type: Number, default: 0 },
    createdToday: { type: Number, default: 0 },
    public: { type: Number, default: 0 },
    averageATSScore: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalDownloads: { type: Number, default: 0 }
  },
  portfolios: {
    total: { type: Number, default: 0 },
    createdToday: { type: Number, default: 0 },
    published: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 }
  },
  revenue: {
    total: { type: Number, default: 0 },
    today: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 },
    byPlan: {
      pro: { type: Number, default: 0 },
      enterprise: { type: Number, default: 0 }
    }
  },
  ai: {
    totalRequests: { type: Number, default: 0 },
    today: { type: Number, default: 0 },
    estimatedCost: { type: Number, default: 0 }
  },
  performance: {
    averageResponseTime: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0 },
    uptime: { type: Number, default: 100 }
  }
}, {
  timestamps: true
});

// Index for date queries
adminStatsSchema.index({ date: -1 });

// Static method to get today's stats
adminStatsSchema.statics.getTodayStats = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let stats = await this.findOne({ date: today });
  if (!stats) {
    stats = await this.create({ date: today });
  }
  return stats;
};

// Static method to get date range stats
adminStatsSchema.statics.getDateRangeStats = async function(startDate, endDate) {
  return await this.find({
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

module.exports = mongoose.model('AdminStats', adminStatsSchema);