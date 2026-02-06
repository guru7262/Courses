const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updateUsername,
  updateEmail,
  getUserStats,
  updateProfilePicture,
  deleteAccount
} = require('../controllers/profileController');
const authenticate = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/username', updateUsername);
router.put('/email', updateEmail);
router.put('/picture', updateProfilePicture);

// Statistics
router.get('/stats', getUserStats);

// Account management
router.delete('/account', deleteAccount);

module.exports = router;
