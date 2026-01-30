const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get all active notifications
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
    .sort({ priority: -1, createdAt: -1 })
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
    
    console.log('Notification created:', notification.id);
    res.status(201).json(notification);
  } catch (err) {
    console.error('Error in POST /api/notifications:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  console.log(`DELETE /api/notifications/${req.params.id} - Request received`);
  
  try {
    const notification = await Notification.findOneAndUpdate(
      { id: req.params.id },
      { isActive: false },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
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