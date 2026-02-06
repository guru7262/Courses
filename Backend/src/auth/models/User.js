const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // ========== EXISTING AUTHENTICATION FIELDS (DO NOT MODIFY) ==========
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't return password by default in queries
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    select: false
  },
  verificationTokenExpires: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },

  // ========== NEW PROFILE FIELDS (ADDED FOR PROFILE DASHBOARD) ==========
  profile: {
    fullName: {
      type: String,
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    age: {
      type: Number,
      min: [5, 'Age must be at least 5'],
      max: [120, 'Age cannot exceed 120']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    },
    dateOfBirth: {
      type: Date
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, 'Please provide a valid phone number']
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    location: {
      city: String,
      state: String,
      country: String
    },
    profilePicture: {
      type: String,
      default: '' // Will store image URL/path later
    }
  },

  // Educational Information
  education: {
    currentEducationLevel: {
      type: String,
      enum: ['high-school', 'undergraduate', 'graduate', 'postgraduate', 'professional', 'other']
    },
    institution: {
      type: String,
      trim: true
    },
    fieldOfStudy: {
      type: String,
      trim: true
    },
    graduationYear: {
      type: Number
    }
  },

  // Learning preferences and goals
  learningPreferences: {
    interests: [{
      type: String,
      trim: true
    }],
    learningGoals: [{
      type: String,
      trim: true
    }],
    preferredLearningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'reading-writing', 'kinesthetic', 'mixed']
    }
  },

  // Activity tracking
  activityStats: {
    totalVideosWatched: {
      type: Number,
      default: 0
    },
    totalNotesCreated: {
      type: Number,
      default: 0
    },
    totalQuizzesTaken: {
      type: Number,
      default: 0
    },
    totalStudyHours: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActivityDate: {
      type: Date
    }
  },

  // Achievements and badges (for gamification)
  achievements: [{
    badgeId: String,
    badgeName: String,
    badgeIcon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],

  // Enrolled subjects/courses
  enrolledSubjects: [{
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastAccessedAt: Date
  }],

  profileLastUpdated: {
    type: Date
  },
  // ========== END OF NEW FIELDS ==========
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user data without sensitive info
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  delete user.verificationToken;
  delete user.verificationTokenExpires;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

// Method to generate verification token
userSchema.methods.generateVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.verificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Method to generate password reset token
userSchema.methods.generateResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  
  return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
