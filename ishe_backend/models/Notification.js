const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false, index: true },
  link: { type: String },
  meta: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

notificationSchema.index({ createdAt: 1, expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Notification', notificationSchema);
