const express = require('express');
const router  = express.Router();
const {
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
} = require('../controllers/pathwayController');
const authenticate = require('../middleware/auth'); // reuse existing auth middleware

// All pathway routes require the user to be logged in
router.use(authenticate);

// ── Pathway lifecycle ──────────────────────────────────────────────────────
router.post  ('/init',         initPathway);       // create / reset pathway
router.get   ('/',             getPathway);        // full pathway
router.get   ('/current-step', getCurrentStep);    // active step only
router.delete('/',             deletePathway);     // delete pathway

// ── Progress updates ───────────────────────────────────────────────────────
router.put('/study-done',    markStudyDone);        // mark study complete
router.put('/mock-result',   submitMockResult);     // submit mock score → triggers revision gen
router.put('/revision-done', markRevisionTopicDone);// tick off a revision topic
router.put('/revision-mock', submitRevisionMock);   // submit post-revision mock
router.put('/next-step',     advanceToNextStep);    // move to next step

// ── Settings ───────────────────────────────────────────────────────────────
router.put('/targets', updateTargets); // change targets → rebuilds pathway

module.exports = router;
