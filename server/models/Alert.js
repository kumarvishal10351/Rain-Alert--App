const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  },
  level: {
    type: String,
    enum: ['SAFE', 'WATCH', 'WARNING', 'DANGER'],
    required: true
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  message: {
    type: String,
    required: true
  },
  peakWindow: {
    type: String,
    default: null
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for efficient querying per user, most recent first
alertSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
