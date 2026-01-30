const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Categories route is working!' });
});

// Get all categories with their subjects
router.get('/', async (req, res) => {
  console.log('GET /api/categories - Request received');
  
  try {
    const categories = await Category.find().sort({ order: 1 }).lean();
    console.log(`Found ${categories.length} categories`);
    
    // Simplify subjects data for listing page
    const simplifiedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      order: cat.order,
      subjects: cat.subjects.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        icon: s.icon,
        color: s.color,
        categoryId: cat.id
      }))
    }));
    
    res.json(simplifiedCategories);
  } catch (err) {
    console.error('Error in GET /api/categories:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Get single subject by ID across all categories
router.get('/subject/:id', async (req, res) => {
  console.log(`GET /api/categories/subject/${req.params.id} - Request received`);
  
  try {
    const categories = await Category.find().lean();
    
    let foundSubject = null;
    let foundCategory = null;
    
    // Search for subject across all categories
    for (const category of categories) {
      const subject = category.subjects.find(s => s.id === req.params.id);
      if (subject) {
        foundSubject = subject;
        foundCategory = {
          id: category.id,
          name: category.name
        };
        break;
      }
    }
    
    if (!foundSubject) {
      console.log(`Subject ${req.params.id} not found`);
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    console.log(`Found subject: ${foundSubject.name} in category: ${foundCategory.name}`);
    
    // Return subject with category info
    res.json({
      ...foundSubject,
      category: foundCategory
    });
  } catch (err) {
    console.error(`Error in GET /api/categories/subject/${req.params.id}:`, err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

module.exports = router;