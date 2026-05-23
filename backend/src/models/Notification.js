const mongoose = require('mongoose');

<<<<<<< HEAD
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['collaboration', 'document_shared', 'comment', 'mention', 'system', 'reminder'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: String,
  actionLabel: String,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  await this.save();
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ userId, isRead: false });
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(userId, data) {
  const notification = new this({
    userId,
    ...data
  });
  await notification.save();
  return notification;
};

module.exports = mongoose.model('Notification', notificationSchema);
=======
if (mongoose.models && mongoose.models.Notification) {
  module.exports = mongoose.models.Notification;
} else {
  const notificationSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['collaboration', 'document_shared', 'comment', 'mention', 'system', 'reminder'],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    actionUrl: String,
    actionLabel: String,
    expiresAt: Date
  }, {
    timestamps: true
  });

  // Indexes
  notificationSchema.index({ userId: 1, createdAt: -1 });
  notificationSchema.index({ userId: 1, isRead: 1 });
  notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  // Methods
  notificationSchema.methods.markAsRead = async function() {
    this.isRead = true;
    await this.save();
    return this;
  };

  // Statics
  notificationSchema.statics.getUnreadCount = async function(userId) {
    return await this.countDocuments({ userId, isRead: false });
  };

  notificationSchema.statics.createNotification = async function(userId, data) {
    const notification = new this({ userId, ...data });
    await notification.save();
    return notification;
  };

  module.exports = mongoose.model('Notification', notificationSchema);
}
>>>>>>> 804ddfb (changes)
