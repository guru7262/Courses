const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Categories route is working!' });
});

// Get all categories with their subjects (for subject selection page)
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
        banner: s.banner,
        categoryId: cat.id,
        contentTypes: s.contentTypes // Include for admin
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

// Get single subject by ID with all content
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
    
    // Return subject with full content
    res.json({
      id: foundSubject.id,
      name: foundSubject.name,
      description: foundSubject.description,
      icon: foundSubject.icon,
      color: foundSubject.color,
      banner: foundSubject.banner,
      contentTypes: foundSubject.contentTypes || [],
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

// Update a subject (PUT)
router.put('/:categoryId/subject/:subjectId', async (req, res) => {
  console.log(`PUT /api/categories/${req.params.categoryId}/subject/${req.params.subjectId}`);
  
  try {
    const category = await Category.findOne({ id: req.params.categoryId });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const subjectIndex = category.subjects.findIndex(s => s.id === req.params.subjectId);
    
    if (subjectIndex === -1) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Update the subject
    category.subjects[subjectIndex] = {
      ...category.subjects[subjectIndex],
      ...req.body,
      id: req.params.subjectId // Ensure ID doesn't change
    };
    
    await category.save();
    
    console.log(`✅ Subject ${req.params.subjectId} updated successfully`);
    res.json({ 
      message: 'Subject updated successfully',
      subject: category.subjects[subjectIndex]
    });
  } catch (err) {
    console.error('Error updating subject:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Add a new subject (POST) - with auto-create category
router.post('/:categoryId/subject', async (req, res) => {
  console.log(`POST /api/categories/${req.params.categoryId}/subject`);
  
  try {
    let category = await Category.findOne({ id: req.params.categoryId });
    let categoryWasCreated = false;
    
    // If category doesn't exist, create it
    if (!category) {
      console.log(`Category ${req.params.categoryId} not found, creating new category...`);
      
      // Get the highest order number from existing categories
      const categories = await Category.find().sort({ order: -1 }).limit(1);
      const nextOrder = categories.length > 0 ? categories[0].order + 1 : 1;
      
      // Create new category with formatted name
      const categoryName = req.params.categoryId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      category = new Category({
        id: req.params.categoryId,
        name: categoryName,
        order: nextOrder,
        subjects: []
      });
      
      categoryWasCreated = true;
      console.log(`✅ Created new category: ${categoryName}`);
    }
    
    // Check if subject ID already exists in this category
    const existingSubject = category.subjects.find(s => s.id === req.body.id);
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject ID already exists in this category' });
    }
    
    // Add the new subject
    category.subjects.push(req.body);
    await category.save();
    
    console.log(`✅ Subject ${req.body.id} added successfully to category ${req.params.categoryId}`);
    res.status(201).json({ 
      message: 'Subject created successfully',
      subject: req.body,
      categoryCreated: categoryWasCreated
    });
  } catch (err) {
    console.error('Error creating subject:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Delete a subject (DELETE)
router.delete('/:categoryId/subject/:subjectId', async (req, res) => {
  console.log(`DELETE /api/categories/${req.params.categoryId}/subject/${req.params.subjectId}`);
  
  try {
    const category = await Category.findOne({ id: req.params.categoryId });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const subjectIndex = category.subjects.findIndex(s => s.id === req.params.subjectId);
    
    if (subjectIndex === -1) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Remove the subject
    category.subjects.splice(subjectIndex, 1);
    
    // If category has no more subjects, delete the category
    if (category.subjects.length === 0) {
      await Category.deleteOne({ id: req.params.categoryId });
      console.log(`✅ Subject ${req.params.subjectId} deleted and category ${req.params.categoryId} auto-deleted (no subjects left)`);
      res.json({ 
        message: 'Subject deleted successfully',
        categoryDeleted: true
      });
    } else {
      await category.save();
      console.log(`✅ Subject ${req.params.subjectId} deleted successfully`);
      res.json({ 
        message: 'Subject deleted successfully',
        categoryDeleted: false
      });
    }
  } catch (err) {
    console.error('Error deleting subject:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

module.exports = router;
