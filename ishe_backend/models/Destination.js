const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  description: { type: String },
  images: { type: [String] },
  highlights: { type: [String] },
}, { timestamps: true });

module.exports = mongoose.model('Destination', destinationSchema);
