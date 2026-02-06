const User = require('../models/User');

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile.',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Prevent updating sensitive fields
    const restrictedFields = ['password', 'email', 'isVerified', 'verificationToken', 
                             'verificationTokenExpires', 'resetPasswordToken', 
                             'resetPasswordExpires', 'createdAt'];
    
    restrictedFields.forEach(field => delete updates[field]);

    // Update profile last updated timestamp
    updates.profileLastUpdated = Date.now();

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: error.message
    });
  }
};

// Update username (separate endpoint as it's more sensitive)
const updateUsername = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required.'
      });
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ 
      username, 
      _id: { $ne: req.user._id } 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken.'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        username,
        profileLastUpdated: Date.now()
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Username updated successfully.',
      user: user
    });
  } catch (error) {
    console.error('Update username error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update username.',
      error: error.message
    });
  }
};

// Update email (requires re-verification)
const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: req.user._id } 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    const user = await User.findById(req.user._id);
    user.email = email;
    user.isVerified = false; // Require re-verification
    
    // Generate new verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, user.username, verificationToken);

    res.status(200).json({
      success: true,
      message: 'Email updated. Please check your new email for verification link.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email.',
      error: error.message
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('activityStats achievements enrolledSubjects')
      .populate('enrolledSubjects.subjectId', 'name category');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Calculate additional stats
    const stats = {
      activityStats: user.activityStats,
      achievements: user.achievements,
      enrolledSubjects: user.enrolledSubjects,
      totalAchievements: user.achievements.length,
      averageProgress: user.enrolledSubjects.length > 0 
        ? user.enrolledSubjects.reduce((acc, subject) => acc + subject.progress, 0) / user.enrolledSubjects.length
        : 0
    };

    res.status(200).json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics.',
      error: error.message
    });
  }
};

// Update profile picture
const updateProfilePicture = async (req, res) => {
  try {
    const { profilePicture } = req.body;

    // For now, just accept URL string
    // Later, implement file upload with multer
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        'profile.profilePicture': profilePicture,
        profileLastUpdated: Date.now()
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully.',
      user: user
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile picture.',
      error: error.message
    });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account.'
      });
    }

    // Verify password
    const user = await User.findById(req.user._id).select('+password');
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password.'
      });
    }

    // Delete user
    await User.findByIdAndDelete(req.user._id);

    // Clear cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully.'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account.',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateUsername,
  updateEmail,
  getUserStats,
  updateProfilePicture,
  deleteAccount
};
