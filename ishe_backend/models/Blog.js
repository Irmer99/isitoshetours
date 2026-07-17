const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  title: { type: String, required: true },
  excerpt: { type: String },
  content: { type: String },
  coverImage: { type: String },
  images: { type: [String] },
  tags: { type: [String] },
  archived: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
