const mongoose = require('mongoose');

// Schema for actual content data (leaf nodes in the tree)
const ContentDataSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['notes', 'videos', 'links', 'mockTests', 'mcqs', 'custom']
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Flexible data structure
    required: true
  }
}, { _id: false });

// Recursive SubTopic Schema - supports unlimited nesting
// Each subtopic can have:
// 1. Its own content/data
// 2. Child subtopics (branches)
const SubTopicSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  // Content data at this level (optional - can be a branch without data)
  content: {
    type: ContentDataSchema,
    default: null
  },
  // Child subtopics (branches)
  subTopics: [{
    type: mongoose.Schema.Types.Mixed // Self-referencing for unlimited nesting
  }]
}, { _id: false });

// Content Type Schema - represents tabs like Notes, Videos, Mock Tests, etc.
// Each content type has its own independent subtopic tree
const ContentTypeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: null
  },
  type: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  // Each content type has its own subtopic hierarchy
  subTopics: [SubTopicSchema]
}, { _id: false });

// Subject Schema - represents a course (Physics, Math, etc.)
const SubjectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  // Dynamic content types - can add Notes, Videos, Mock Tests, or custom types
  contentTypes: [ContentTypeSchema]
}, { _id: false });

// Category Schema - represents grade levels (12th, 11th, etc.)
const CategorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  subjects: [SubjectSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
