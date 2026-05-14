const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  lat: {
    type: Number,
    required: true
  },
  lon: {
    type: Number,
    required: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Ensure max 5 locations per user (enforced at controller level too)
locationSchema.index({ user: 1 });

module.exports = mongoose.model('Location', locationSchema);
