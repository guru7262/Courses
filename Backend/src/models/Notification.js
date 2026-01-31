const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'announcement'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  link: {
    type: String,
    default: null
  },
  linkText: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  targetAudience: {
    type: String,
    enum: ['all', '12th', '11th', '10th', '9th'],
    default: 'all'
  },
  // NEW FIELDS FOR DETAILED VIEW
  bannerImage: {
    type: String,
    default: null
  },
  fullContent: {
    type: String,
    default: null
  },
  metadata: {
    author: {
      type: String,
      default: null
    },
    category: {
      type: String,
      default: null
    },
    tags: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);