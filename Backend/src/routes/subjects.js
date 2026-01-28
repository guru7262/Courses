const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

// Test route for debugging
router.get('/test', (req, res) => {
  res.json({ message: 'Subjects route is working!' });
});

// Get all subjects
router.get('/', async (req, res) => {
  console.log('GET /api/subjects - Request received');
  
  try {
    const subjects = await Subject.find().lean();
    console.log(`Found ${subjects.length} subjects`);
    
    // Only send back needed fields for listing page
    const simplifiedSubjects = subjects.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
      color: s.color
    }));
    
    res.json(simplifiedSubjects);
  } catch (err) {
    console.error('Error in GET /api/subjects:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Get single subject by ID
router.get('/:id', async (req, res) => {
  console.log(`GET /api/subjects/${req.params.id} - Request received`);
  
  try {
    const subject = await Subject.findOne({ id: req.params.id }).lean();
    
    if (!subject) {
      console.log(`Subject ${req.params.id} not found`);
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    console.log(`Found subject: ${subject.name}`);
    res.json(subject);
  } catch (err) {
    console.error(`Error in GET /api/subjects/${req.params.id}:`, err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

module.exports = router;