const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  notes: { type: String },
}, { timestamps: true });

clientSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Client', clientSchema);
