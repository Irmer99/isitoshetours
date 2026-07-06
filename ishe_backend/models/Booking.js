const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  from: { type: String, enum: ['enquiry', 'confirmed', 'completed', 'cancelled'] },
  to: { type: String, enum: ['enquiry', 'confirmed', 'completed', 'cancelled'] },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  changedAt: { type: Date, default: Date.now },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  itinerary: { type: String, required: true },
  itineraryTitle: { type: String },
  status: {
    type: String,
    enum: ['enquiry', 'confirmed', 'completed', 'cancelled'],
    default: 'enquiry',
  },
  travelDate: { type: Date, required: true },
  participants: { type: Number, required: true, min: 1 },
  totalAmount: { type: Number, required: true },
  discountCode: { type: String },
  discountApplied: { type: Number, default: 0 },
  notes: { type: String },
  statusHistory: [statusHistorySchema],
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
