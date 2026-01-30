const mongoose = require('mongoose');
const Notification = require('../models/Notification');
require('dotenv').config();

const sampleNotifications = [
  {
    id: 'welcome-2026',
    title: 'Welcome to EduLearn! 🎉',
    message: 'Start your learning journey with comprehensive study materials for grades 9-12.',
    type: 'announcement',
    priority: 'high',
    icon: '🎓',
    targetAudience: 'all'
  },
  {
    id: 'dark-mode-feature',
    title: 'Dark Mode Available',
    message: 'Switch to dark mode from your profile menu for a better viewing experience.',
    type: 'info',
    priority: 'low',
    icon: '🌙',
    targetAudience: 'all'
  },
  {
    id: 'mock-test-reminder',
    title: 'Practice Makes Perfect',
    message: 'Take mock tests to prepare for your exams and track your progress.',
    type: 'info',
    priority: 'medium',
    icon: '📝',
    link: '/',
    linkText: 'Start Now',
    targetAudience: 'all'
  }
];

async function seedNotifications() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing notifications...');
    await Notification.deleteMany({});
    
    console.log('Inserting sample notifications...');
    await Notification.insertMany(sampleNotifications);
    
    console.log('✅ Notifications seeded successfully:', sampleNotifications.length);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding notifications:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedNotifications();
}

module.exports = { sampleNotifications, seedNotifications };