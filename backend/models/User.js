 const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: [true, "Firebase UID (_id) is required."], // Clear error message
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function () {
      // Only require password if not a Google user
      return !this.googleId;
    },
    default: null, // <-- Add this line
  },
  googleId: {
    type: String,
    sparse: true, // Allows multiple null values
  },
  name: {
    type: String,
    required: [true, "Username is required."],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [20, "Username must be less than 20 characters"],
    match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
  },
  phone: {
    type: String,
    trim: true,
  },
  photo: {
    type: String,
  },
  selectedPlatforms: {
    type: [String],
    default: [],
  },
  platforms: [{
    platform: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      trim: true,
    },
  }],
  currentStreaks: {
    leetcode: {
      type: Number,
      default: 0,
    },
  },
  longestStreaks: {
    leetcode: {
      type: Number,
      default: 0,
    },
  },
  lastUpdated: {
    leetcode: {
      type: Date,
      default: Date.now,
    },
  },
  lastTotalSolved: {
    leetcode: {
      type: Number,
      default: 0,
    },
    codeforces: {
      type: Number,
      default: 0,
    },
    gfg: {
      type: Number,
      default: 0,
    },
    hackerrank: {
      type: Number,
      default: 0,
    },
  },
  friends: {
    type: [String], // Array of usernames
    default: [],
  },
  pendingFriends: {
    type: [String], // Array of usernames
    default: [],
  },
  friendRequests: {
    type: [String], // Array of usernames
    default: [],
  },
  leetcodeUsernameValid: {
    type: Boolean,
    default: false,
  },
  // PRO subscription fields
  subscription: {
    tier: { type: String, enum: ['free', 'pro'], default: 'free' },
    status: { type: String, enum: ['inactive', 'active', 'canceled', 'past_due'], default: 'inactive' },
    startedAt: { type: Date },
    expiresAt: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    paymentProvider: { type: String, default: 'fake' },
    lastPaymentId: { type: String },
  },
  // Alert settings (Pro features)
  alertSettings: {
    enabled: { type: Boolean, default: false },
    windowStart: { type: String, default: '19:00' },
    windowEnd: { type: String, default: '21:00' },
    notifyEmail: { type: Boolean, default: true },
    notifyPush: { type: Boolean, default: false },
    dailyReminder: { type: Boolean, default: true },
  },
  // Profile stats
  totalProblems: { type: Number, default: 0 },
  totalProblemsSolvedSinceJoin: { type: Number, default: 0 },
  achievements: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' }
  }],
  recentActivity: [{
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['streak', 'problem', 'achievement', 'friend'], default: 'streak' }
  }],
  onboarded: { type: Boolean, default: false },
  streakGoal: { type: Number, default: 7 },
  dailyGoalType: { type: String, enum: ['problems', 'minutes'], default: 'problems' },
  dailyGoalNumber: { type: Number, default: 3 },
  // Additional settings
  settings: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    language: { type: String, default: 'en' },
    sound: { type: Boolean, default: true },
    streakAlerts: { type: Boolean, default: true },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
