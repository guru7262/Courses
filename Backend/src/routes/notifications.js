const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get all notifications (including inactive) - for admin
router.get('/all', async (req, res) => {
  console.log('GET /api/notifications/all - Request received');
  
  try {
    const notifications = await Notification.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    console.log(`Found ${notifications.length} notifications`);
    res.json(notifications);
  } catch (err) {
    console.error('Error in GET /api/notifications/all:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Get all active notifications (for users)
router.get('/', async (req, res) => {
  console.log('GET /api/notifications - Request received');
  
  try {
    const notifications = await Notification.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .sort({ order: 1, priority: -1, createdAt: -1 })
    .lean();
    
    console.log(`Found ${notifications.length} active notifications`);
    res.json(notifications);
  } catch (err) {
    console.error('Error in GET /api/notifications:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Create notification (admin)
router.post('/', async (req, res) => {
  console.log('POST /api/notifications - Request received');
  
  try {
    const notification = new Notification(req.body);
    await notification.save();
    
    console.log('✅ Notification created:', notification.id);
    res.status(201).json(notification);
  } catch (err) {
    console.error('Error in POST /api/notifications:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Update notification (admin)
router.put('/:id', async (req, res) => {
  console.log(`PUT /api/notifications/${req.params.id} - Request received`);
  
  try {
    const notification = await Notification.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    console.log('✅ Notification updated:', notification.id);
    res.json(notification);
  } catch (err) {
    console.error(`Error in PUT /api/notifications/${req.params.id}:`, err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Delete notification (hard delete)
router.delete('/:id', async (req, res) => {
  console.log(`DELETE /api/notifications/${req.params.id} - Request received`);
  
  try {
    const notification = await Notification.findOneAndDelete({ id: req.params.id });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    console.log('✅ Notification deleted:', req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error(`Error in DELETE /api/notifications/${req.params.id}:`, err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

module.exports = router;