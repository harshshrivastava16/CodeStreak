const mongoose = require('mongoose');

const mlInsightSchema = new mongoose.Schema({
  userId: { type: String, index: true, unique: true },
  data: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('MlInsight', mlInsightSchema); 