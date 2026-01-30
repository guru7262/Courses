const mongoose = require('mongoose');

// Schema for individual content items
const ContentItemSchema = new mongoose.Schema({
  notes: {
    type: String,
    default: ''
  },
  videoLectures: [{
    title: String,
    url: String,
    duration: String,
    thumbnail: String
  }],
  mockTests: [{
    title: String,
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    duration: Number,
    totalMarks: Number
  }]
});

const SubTopicSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  content: ContentItemSchema
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