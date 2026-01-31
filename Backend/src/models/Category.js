const mongoose = require('mongoose');

// Schema for content (flexible for different types)
const ContentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['notes', 'videos', 'links', 'mockTests', 'mcqs', 'custom']
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Flexible data structure
    required: true
  }
});

// Schema for subtopics (supports nesting)
const SubTopicSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  subTopics: [{
    type: mongoose.Schema.Types.Mixed // Self-referencing for nesting
  }],
  content: ContentSchema
});

// Schema for content types (dynamic tabs)
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
  }
});

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
  contentTypes: [ContentTypeSchema], // Dynamic content types
  subTopics: [SubTopicSchema]
});

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