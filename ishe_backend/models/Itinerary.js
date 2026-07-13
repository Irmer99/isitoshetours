const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String },
  description: { type: String },
  meals: { type: [String] },
  accommodation: { type: String },
}, { _id: false });

const itinerarySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  difficulty: { type: String, enum: ['easy', 'moderate', 'hard'], default: 'moderate' },
  duration: { type: String },
  pricing: {
    from: { type: Number },
    currency: { type: String, default: 'MAD' },
  },
  days: [daySchema],
  includes: { type: [String] },
  excludes: { type: [String] },
  images: { type: [String] },
  destinations: { type: [String] },
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);
