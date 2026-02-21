const mongoose = require('mongoose');

// ─── Sub-schemas ────────────────────────────────────────────────────────────

// Stores the result of one mock-test attempt
const MockResultSchema = new mongoose.Schema({
  attemptedAt:   { type: Date, default: Date.now },
  totalQuestions:{ type: Number, default: 0 },
  correctAnswers:{ type: Number, default: 0 },
  timeTakenMinutes: { type: Number, default: 0 },
  scorePercent: {                       // derived, stored for quick access
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Which topic IDs the user got wrong (used to build revision list)
  weakTopicIds: [{ type: String }]
}, { _id: false });

// One subject block inside a step
// e.g. "Chapter 1 of Physics → mock → Chapter 1 of Chemistry → mock"
const StepSubjectBlockSchema = new mongoose.Schema({
  subjectId:   { type: String, required: true },  // Subject.id from Category
  subjectName: { type: String, required: true },

  // The specific topic node covered in this block (may be at any nesting depth)
  topicId:   { type: String, required: true },
  topicName: { type: String, required: true },

  // Full ancestral path from root → this node.
  // e.g. ['Mechanics', 'Motion', 'Velocity']
  // Lets the frontend show exactly where in the tree this step lives.
  breadcrumb: [{ type: String }],

  // Depth in the SubTopic tree (0 = top-level chapter, 1 = section, 2 = sub-section…)
  depth: { type: Number, default: 0 },

  // Whether this node has further child subTopics of its own
  hasChildren: { type: Boolean, default: false },

  // The raw nested subTopic tree rooted at this node.
  // Stored as Mixed so the full arbitrary-depth tree is preserved.
  // The frontend uses this to render child navigation or deep-link into children.
  subTopics: { type: mongoose.Schema.Types.Mixed, default: [] },

  // All content-type IDs for this subject (so the frontend can switch tabs)
  contentTypeIds: [{ type: String }],

  // Status of the study part
  studyStatus: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  studyCompletedAt: { type: Date },

  // Mock test for this block
  mockTest: {
    contentTypeId: { type: String },   // ID of the mockTests contentType
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'skipped'],
      default: 'pending'
    },
    result: { type: MockResultSchema, default: null }
  }
}, { _id: false });

// A revision block – auto-generated after mock analysis
const RevisionBlockSchema = new mongoose.Schema({
  generatedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  // Each entry = one weak topic that needs revisiting
  topics: [{
    subjectId:   { type: String },
    subjectName: { type: String },
    topicId:     { type: String },
    topicName:   { type: String },
    reason:      { type: String }, // e.g. "scored 40% in mock"
    revisited:   { type: Boolean, default: false }
  }],
  // Follow-up mock after revision
  revisionMock: {
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'skipped'],
      default: 'pending'
    },
    result: { type: MockResultSchema, default: null }
  }
}, { _id: false });

// One complete step in the pathway
const PathwayStepSchema = new mongoose.Schema({
  stepNumber:  { type: Number, required: true },
  title:       { type: String },          // e.g. "Step 1 – Chapter 1"
  status: {
    type: String,
    enum: ['locked', 'active', 'completed'],
    default: 'locked'
  },
  unlockedAt:  { type: Date },
  completedAt: { type: Date },

  // One block per enrolled subject
  subjectBlocks: [StepSubjectBlockSchema],

  // Auto-generated after all mocks in this step are done
  revision: { type: RevisionBlockSchema, default: null }
}, { _id: false });

// The user's daily targets that seed the pathway
const DailyTargetsSchema = new mongoose.Schema({
  subjectsPerDay:   { type: Number, default: 1, min: 1 },
  mockTestsPerDay:  { type: Number, default: 1, min: 0 },
  hoursPerDay:      { type: Number, default: 2, min: 0.5 },
  // The category (course) the user enrolled in – e.g. "12th", "JEE"
  categoryId:       { type: String, required: true },
  categoryName:     { type: String }
}, { _id: false });

// ─── Root Schema ─────────────────────────────────────────────────────────────

const CoursePathwaySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true   // one active pathway per user (can extend later)
  },

  targets: { type: DailyTargetsSchema, required: true },

  // Ordered list of all steps
  steps: [PathwayStepSchema],

  // Quick pointers
  currentStepIndex: { type: Number, default: 0 },
  totalSteps:       { type: Number, default: 0 },

  overallStatus: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'paused'],
    default: 'not-started'
  },

  // Aggregate progress (0-100)
  overallProgressPercent: { type: Number, default: 0, min: 0, max: 100 },

  startedAt:   { type: Date },
  completedAt: { type: Date }
}, {
  timestamps: true
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
CoursePathwaySchema.index({ userId: 1 });

// ─── Helper: recalculate overall progress ────────────────────────────────────
CoursePathwaySchema.methods.recalculateProgress = function () {
  const total = this.steps.length;
  if (total === 0) { this.overallProgressPercent = 0; return; }
  const done = this.steps.filter(s => s.status === 'completed').length;
  this.overallProgressPercent = Math.round((done / total) * 100);
};

module.exports = mongoose.model('CoursePathway', CoursePathwaySchema);
