const mongoose = require('mongoose');

const streakLogSchema = new mongoose.Schema({
  userId: { type: String, index: true, required: true },
  platform: { type: String, enum: ['leetcode', 'codeforces', 'gfg', 'hackerrank'], required: true },
  username: { type: String },
  date: { type: Date, required: true, index: true },
  maintained: { type: Boolean, required: true },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
}, { timestamps: true });

streakLogSchema.index({ userId: 1, platform: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StreakLog', streakLogSchema); 