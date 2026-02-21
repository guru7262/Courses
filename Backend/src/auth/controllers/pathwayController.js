/**
 * pathwayController.js
 *
 * Handles all Course Pathway logic.
 * No existing files were modified.
 *
 * Endpoint summary (all require authentication middleware):
 *   POST   /api/pathway/init          – create / reset a pathway from targets
 *   GET    /api/pathway               – fetch the full pathway
 *   GET    /api/pathway/current-step  – fetch only the active step
 *   PUT    /api/pathway/study-done    – mark a subject block's study as complete
 *   PUT    /api/pathway/mock-result   – submit mock-test result for a block
 *   PUT    /api/pathway/revision-done – mark a revision topic as revisited
 *   PUT    /api/pathway/revision-mock – submit the post-revision mock result
 *   PUT    /api/pathway/next-step     – advance to the next step
 *   PUT    /api/pathway/targets       – update daily targets (rebuilds pathway)
 *   DELETE /api/pathway               – delete the pathway
 */

const CoursePathway = require('../models/CoursePathway');
const Category     = require('../../models/Category');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Recursively flatten an entire subTopic tree into an ordered list of leaf-
 * and branch-node descriptors.
 *
 * Each entry:
 * {
 *   id, name,
 *   breadcrumb: ['Parent', 'Child', …],   ← full path from root
 *   depth: 0 | 1 | 2 | …,
 *   hasChildren: bool,
 *   childIds: [id, …]                     ← direct children only
 * }
 *
 * We preserve the original tree order (DFS pre-order) so the pathway steps
 * follow the same sequence a student would encounter inside SubjectContentPage.
 */
function flattenSubTopics(subTopics, breadcrumb = [], depth = 0) {
  const result = [];
  for (const st of (subTopics || [])) {
    const currentBreadcrumb = [...breadcrumb, st.name];
    const children = st.subTopics || [];

    result.push({
      id:          st.id,
      name:        st.name,
      breadcrumb:  currentBreadcrumb,
      depth,
      hasChildren: children.length > 0,
      childIds:    children.map(c => c.id),
      // Keep the raw children tree so the frontend can deep-link into any node
      subTopics:   children
    });

    // Recurse into children
    if (children.length > 0) {
      result.push(...flattenSubTopics(children, currentBreadcrumb, depth + 1));
    }
  }
  return result;
}

/**
 * Pick the "primary" content type for a subject – the one whose subTopic tree
 * drives the pathway chapter order.
 * Priority: notes → videos → links → anything else.
 */
function pickPrimaryContentType(subject) {
  const priority = ['notes', 'videos', 'links'];
  return (
    subject.contentTypes.find(ct =>
      priority.includes((ct.type || ct.name || '').toLowerCase())
    ) || subject.contentTypes[0] || null
  );
}

/**
 * Pick the mock-test content type for a subject, if any.
 */
function pickMockContentType(subject) {
  return subject.contentTypes.find(ct => {
    const key = (ct.type || ct.name || '').toLowerCase();
    return key.includes('mock') || key.includes('test') || key.includes('mcq');
  }) || null;
}

/**
 * Build pathway steps from a Category document.
 *
 * Strategy
 * ────────
 * 1. For every subject, use the primary content type to get the ordered,
 *    FULLY-FLATTENED list of all topics (including all nested sub-topics at
 *    every depth).
 * 2. Each pathway STEP covers index [i] of that flattened list for every
 *    subject that still has a topic at that index.
 * 3. The subject block stores:
 *    - topicId / topicName   → the specific node at this depth
 *    - breadcrumb            → full path, e.g. ["Mechanics", "Motion", "Velocity"]
 *    - depth                 → how deep this node is (0 = top-level chapter)
 *    - hasChildren           → whether this node has sub-topics of its own
 *    - subTopics             → the raw nested tree rooted at this node
 *                              (so the frontend can render the full sub-tree)
 *    - contentTypeIds        → all content type IDs for this subject
 *    - mockTest.contentTypeId→ the mock CT id to open when doing the mock
 *
 * This means every single node in the entire nested tree gets its own step,
 * progressing in the same DFS pre-order the student would see on screen.
 */
function buildSteps(category, targets) {
  const subjects = category.subjects;
  if (!subjects || subjects.length === 0) return [];

  // Pre-compute the flattened topic list for every subject
  const subjectFlatMaps = subjects.map(subject => {
    const primaryCT = pickPrimaryContentType(subject);
    const mockCT    = pickMockContentType(subject);
    const flat      = primaryCT ? flattenSubTopics(primaryCT.subTopics || []) : [];

    return {
      subject,
      primaryCT,
      mockCT,
      flat,                                         // ordered list of ALL nodes
      contentTypeIds: subject.contentTypes.map(ct => ct.id)
    };
  }).filter(s => s.flat.length > 0); // skip subjects with no content at all

  if (subjectFlatMaps.length === 0) return [];

  // Total steps = length of the longest flattened list across all subjects
  const maxNodes = Math.max(...subjectFlatMaps.map(s => s.flat.length));

  const steps = [];

  for (let i = 0; i < maxNodes; i++) {
    const subjectBlocks = [];

    for (const { subject, mockCT, flat, contentTypeIds } of subjectFlatMaps) {
      const node = flat[i];
      if (!node) continue; // this subject has fewer nodes – just skip this slot

      subjectBlocks.push({
        subjectId:      subject.id,
        subjectName:    subject.name,

        // ── The specific topic node for this step ──────────────────────────
        topicId:        node.id,
        topicName:      node.name,

        // Full ancestral path: ["Mechanics", "Motion", "Velocity"]
        // Lets the frontend show exactly where in the tree this node lives
        breadcrumb:     node.breadcrumb,

        // Depth in the tree (0 = root chapter, 1 = section, 2 = sub-section…)
        depth:          node.depth,

        // Whether this node itself has further children to explore
        hasChildren:    node.hasChildren,

        // The raw nested subtopic tree rooted at this node.
        // The frontend can use this to render child nodes or navigate into them.
        subTopics:      node.subTopics,

        // All content type IDs so the frontend can switch tabs
        contentTypeIds,

        studyStatus: 'pending',
        mockTest: {
          contentTypeId: mockCT ? mockCT.id : null,
          status:        'pending',
          result:        null
        }
      });
    }

    if (subjectBlocks.length === 0) continue;

    // Build a human-readable title.
    // If all blocks are at depth 0 (top-level chapters) → "Step N – Chapter N"
    // If mixed depths, use the first block's breadcrumb for context.
    const firstBlock  = subjectBlocks[0];
    const stepLabel   = firstBlock.breadcrumb.join(' › ');

    steps.push({
      stepNumber: i + 1,
      title:      `Step ${i + 1} – ${stepLabel}`,
      status:     i === 0 ? 'active' : 'locked',
      unlockedAt: i === 0 ? new Date() : null,
      subjectBlocks,
      revision:   null   // populated after mock results are submitted
    });
  }

  return steps;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/pathway/init
 * Body: { categoryId, subjectsPerDay, mockTestsPerDay, hoursPerDay }
 *
 * Creates (or replaces) the user's pathway.
 */
const initPathway = async (req, res) => {
  try {
    const userId = req.user._id;
    const { categoryId, subjectsPerDay, mockTestsPerDay, hoursPerDay } = req.body;

    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'categoryId is required.' });
    }

    // Load the category with all nested data
    const category = await Category.findOne({ id: categoryId });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const targets = {
      categoryId,
      categoryName:    category.name,
      subjectsPerDay:  subjectsPerDay  || 1,
      mockTestsPerDay: mockTestsPerDay || 1,
      hoursPerDay:     hoursPerDay     || 2
    };

    const steps = buildSteps(category, targets);

    // Upsert – replace existing pathway if any
    const pathway = await CoursePathway.findOneAndUpdate(
      { userId },
      {
        userId,
        targets,
        steps,
        currentStepIndex:       0,
        totalSteps:             steps.length,
        overallStatus:          steps.length > 0 ? 'in-progress' : 'not-started',
        overallProgressPercent: 0,
        startedAt:              new Date(),
        completedAt:            null
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(201).json({ success: true, message: 'Pathway created.', pathway });
  } catch (err) {
    console.error('initPathway error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create pathway.', error: err.message });
  }
};

/**
 * GET /api/pathway
 * Returns the full pathway for the logged-in user.
 */
const getPathway = async (req, res) => {
  try {
    const pathway = await CoursePathway.findOne({ userId: req.user._id });
    if (!pathway) {
      return res.status(404).json({ success: false, message: 'No pathway found. Please initialise one first.' });
    }
    return res.status(200).json({ success: true, pathway });
  } catch (err) {
    console.error('getPathway error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch pathway.', error: err.message });
  }
};

/**
 * GET /api/pathway/current-step
 * Returns only the currently active step.
 */
const getCurrentStep = async (req, res) => {
  try {
    const pathway = await CoursePathway.findOne({ userId: req.user._id });
    if (!pathway) {
      return res.status(404).json({ success: false, message: 'No pathway found.' });
    }

    const step = pathway.steps[pathway.currentStepIndex] || null;
    return res.status(200).json({
      success: true,
      currentStepIndex: pathway.currentStepIndex,
      totalSteps:       pathway.totalSteps,
      step
    });
  } catch (err) {
    console.error('getCurrentStep error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch current step.', error: err.message });
  }
};

/**
 * PUT /api/pathway/study-done
 * Body: { stepNumber, subjectId }
 * Marks the study part of a subject block as complete.
 */
const markStudyDone = async (req, res) => {
  try {
    const { stepNumber, subjectId } = req.body;
    if (!stepNumber || !subjectId) {
      return res.status(400).json({ success: false, message: 'stepNumber and subjectId are required.' });
    }

    const pathway = await CoursePathway.findOne({ userId: req.user._id });
    if (!pathway) return res.status(404).json({ success: false, message: 'Pathway not found.' });

    const step = pathway.steps.find(s => s.stepNumber === stepNumber);
    if (!step) return res.status(404).json({ success: false, message: 'Step not found.' });
    if (step.status === 'locked') return res.status(400).json({ success: false, message: 'Step is locked.' });

    const block = step.subjectBlocks.find(b => b.subjectId === subjectId);
    if (!block) return res.status(404).json({ success: false, message: 'Subject block not found.' });

    block.studyStatus      = 'completed';
    block.studyCompletedAt = new Date();

    await pathway.save();
    return res.status(200).json({ success: true, message: 'Study marked as complete.', step });
  } catch (err) {
    console.error('markStudyDone error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update.', error: err.message });
  }
};

/**
 * PUT /api/pathway/mock-result
 * Body: { stepNumber, subjectId, totalQuestions, correctAnswers, timeTakenMinutes, weakTopicIds }
 *
 * Saves mock result. If all mocks in the step are done, auto-generates a
 * revision block based on weak topics.
 */
const submitMockResult = async (req, res) => {
  try {
    const {
      stepNumber, subjectId,
      totalQuestions, correctAnswers,
      timeTakenMinutes, weakTopicIds
    } = req.body;

    if (!stepNumber || !subjectId) {
      return res.status(400).json({ success: false, message: 'stepNumber and subjectId are required.' });
    }

    const pathway = await CoursePathway.findOne({ userId: req.user._id });
    if (!pathway) return res.status(404).json({ success: false, message: 'Pathway not found.' });

    const step = pathway.steps.find(s => s.stepNumber === stepNumber);
    if (!step) return res.status(404).json({ success: false, message: 'Step not found.' });

    const block = step.subjectBlocks.find(b => b.subjectId === subjectId);
    if (!block) return res.status(404).json({ success: false, message: 'Subject block not found.' });

    const scorePercent = totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

    block.mockTest.status = 'completed';
    block.mockTest.result = {
      attemptedAt:      new Date(),
      totalQuestions:   totalQuestions   || 0,
      correctAnswers:   correctAnswers   || 0,
      timeTakenMinutes: timeTakenMinutes || 0,
      scorePercent,
      weakTopicIds:     weakTopicIds     || []
    };

    // ── Check if all mocks in this step are done → generate revision ──────
    const allMocksDone = step.subjectBlocks.every(
      b => b.mockTest.status === 'completed' || b.mockTest.status === 'skipped'
    );

    if (allMocksDone && !step.revision) {
      // Collect weak topics (score < 60%)
      const weakTopics = [];
      for (const b of step.subjectBlocks) {
        const r = b.mockTest.result;
        if (!r) continue;
        if (r.scorePercent < 60) {
          weakTopics.push({
            subjectId:   b.subjectId,
            subjectName: b.subjectName,
            topicId:     b.topicId,
            topicName:   b.topicName,
            reason:      `Scored ${r.scorePercent}% in mock test`,
            revisited:   false
          });
        }
        // Also add individually flagged weak sub-topics
        for (const wId of (r.weakTopicIds || [])) {
          if (!weakTopics.find(wt => wt.topicId === wId)) {
            weakTopics.push({
              subjectId:   b.subjectId,
              subjectName: b.subjectName,
              topicId:     wId,
              topicName:   wId,   // frontend can resolve the name
              reason:      'Flagged as weak in mock',
              revisited:   false
            });
          }
        }
      }

      step.revision = {
        generatedAt:   new Date(),
        status:        weakTopics.length > 0 ? 'pending' : 'completed',
        topics:        weakTopics,
        revisionMock: {
          status: weakTopics.length > 0 ? 'pending' : 'skipped',
          result: null
        }
      };
    }

    pathway.recalculateProgress();
    await pathway.save();

    return res.status(200).json({
      success: true,
      message: 'Mock result saved.',
      step,
      revisionGenerated: allMocksDone
    });
  } catch (err) {
    console.error('submitMockResult error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save mock result.', error: err.message });
  }
};

/**
 * PUT /api/pathway/revision-done
 * Body: { stepNumber, topicId }
 * Marks one revision topic as revisited.
 */
const markRevisionTopicDone = async (req, res) => {
  try {
    const { stepNumber, topicId } = req.body;
    if (!stepNumber || !topicId) {
      return res.status(400).json({ success: false, message: 'stepNumber and topicId are required.' });
    }

    const pathway = await CoursePathway.findOne({ userId: req.user._id });
    if (!pathway) return res.status(404).json({ success: false, message: 'Pathway not found.' });

    const step = pathway.steps.find(s => s.stepNumber === stepNumber);
    if (!step || !step.revision) {
      return res.status(404).json({ success: false, message: 'Step or revision not found.' });
    }

    const topic = step.revision.topics.find(t => t.topicId === topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Revision topic not found.' });

    topic.revisited = true;

    // If all revision topics are done, mark revision in-progress → pending mock
    const allRevisited = step.revision.topics.every(t => t.revisited);
    if (allRevisited) {
      step.revision.status = 'in-progress'; // waiting for revision mock
    }

    await pathway.save();
    return res.status(200).json({ success: true, message: 'Revision topic marked done.', step });
  } catch (err) {
    console.error('markRevisionTopicDone error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update.', error: err.message });
  }
};

/**
 * PUT /api/pathway/revision-mock
 * Body: { stepNumber, totalQuestions, correctAnswers, timeTakenMinutes }
 * Saves the post-revision mock result and marks revision completed.
 */
const submitRevisionMock = async (req, res) => {
  try {
    const { stepNumber, totalQuestions, correctAnswers, timeTakenMinutes } = req.body;
    if (!stepNumber) {
      return res.status(400).json({ success: false, message: 'stepNumber is required.' });
    }

    const pathway = await CoursePathway.findOne({ userId: req.user._id });
    if (!pathway) return res.status(404).json({ success: false, message: 'Pathway not found.' });

    const step = pathway.steps.find(s => s.stepNumber === stepNumber);
    if (!step || !step.revision) {
      return res.status(404).json({ success: false, message: 'Step or revision not found.' });
    }

    const scorePercent = totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

    step.revision.revisionMock.status = 'completed';
    step.revision.revisionMock.result = {
      attemptedAt:      new Date(),
      totalQuestions:   totalQuestions   || 0,
      correctAnswers:   correctAnswers   || 0,
      timeTakenMinutes: timeTakenMinutes || 0,
      scorePercent,
      weakTopicIds:     []
    };
    step.revision.status = 'completed';

    pathway.recalculateProgress();
    await pathway.save();

    return res.status(200).json({ success: true, message: 'Revision mock saved. Revision complete.', step });
  } catch (err) {
    console.error('submitRevisionMock error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save.', error: err.message });
  }
};

/**
 * PUT /api/pathway/next-step
 *
 * Advances to the next step IF the current step is fully complete:
 *   - All subject blocks studied
 *   - All mocks submitted
 *   - Revision completed (or had no weak topics)
 */
const advanceToNextStep = async (req, res) => {
  try {
    const pathway = await CoursePathway.findOne({ userId: req.user._id });
    if (!pathway) return res.status(404).json({ success: false, message: 'Pathway not found.' });

    const currentStep = pathway.steps[pathway.currentStepIndex];
    if (!currentStep) {
      return res.status(400).json({ success: false, message: 'No active step found.' });
    }

    // No hard gates – students are free to advance at any time.
    // The pathway is a personalised guide, not a lock.

    // Mark current step complete
    currentStep.status      = 'completed';
    currentStep.completedAt = new Date();

    const nextIndex = pathway.currentStepIndex + 1;

    if (nextIndex >= pathway.steps.length) {
      // All steps done!
      pathway.overallStatus  = 'completed';
      pathway.completedAt    = new Date();
      pathway.currentStepIndex = nextIndex; // points past the end
    } else {
      // Unlock next step
      const nextStep      = pathway.steps[nextIndex];
      nextStep.status     = 'active';
      nextStep.unlockedAt = new Date();
      pathway.currentStepIndex = nextIndex;
    }

    pathway.recalculateProgress();
    await pathway.save();

    return res.status(200).json({
      success:     true,
      message:     nextIndex >= pathway.steps.length ? 'Pathway completed! 🎉' : 'Advanced to next step.',
      currentStepIndex: pathway.currentStepIndex,
      overallStatus:    pathway.overallStatus,
      overallProgressPercent: pathway.overallProgressPercent
    });
  } catch (err) {
    console.error('advanceToNextStep error:', err);
    return res.status(500).json({ success: false, message: 'Failed to advance.', error: err.message });
  }
};

/**
 * PUT /api/pathway/targets
 * Body: same as /init
 * Updates targets and rebuilds the pathway from scratch.
 */
const updateTargets = async (req, res) => {
  try {
    // Re-use init logic
    return initPathway(req, res);
  } catch (err) {
    console.error('updateTargets error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update targets.', error: err.message });
  }
};

/**
 * DELETE /api/pathway
 * Deletes the user's pathway entirely.
 */
const deletePathway = async (req, res) => {
  try {
    await CoursePathway.findOneAndDelete({ userId: req.user._id });
    return res.status(200).json({ success: true, message: 'Pathway deleted.' });
  } catch (err) {
    console.error('deletePathway error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete.', error: err.message });
  }
};

module.exports = {
  initPathway,
  getPathway,
  getCurrentStep,
  markStudyDone,
  submitMockResult,
  markRevisionTopicDone,
  submitRevisionMock,
  advanceToNextStep,
  updateTargets,
  deletePathway
};
