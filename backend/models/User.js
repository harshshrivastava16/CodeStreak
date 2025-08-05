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
    required: function() {
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
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
