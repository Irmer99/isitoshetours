const Booking = require('../models/Booking');

exports.create = async (req, res) => {
  const booking = await Booking.create(req.body);
  const populated = await Booking.findById(booking._id).populate('client');
  res.status(201).json(populated);
};

exports.list = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.itinerary) filter.itinerary = req.query.itinerary;
  if (req.query.from || req.query.to) {
    filter.travelDate = {};
    if (req.query.from) filter.travelDate.$gte = new Date(req.query.from);
    if (req.query.to) filter.travelDate.$lte = new Date(req.query.to);
  }

  const bookings = await Booking.find(filter)
    .populate('client')
    .sort({ createdAt: -1 });
  res.json(bookings);
};

exports.detail = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('client');
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const validTransitions = {
    enquiry: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[booking.status].includes(status)) {
    return res.status(400).json({
      error: `Cannot transition from ${booking.status} to ${status}`,
    });
  }

  booking.statusHistory.push({
    from: booking.status,
    to: status,
    changedBy: req.admin.id,
  });

  booking.status = status;
  await booking.save();

  const populated = await Booking.findById(booking._id).populate('client');
  res.json(populated);
};

exports.remove = async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json({ message: 'Booking deleted' });
};

exports.history = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .select('statusHistory')
    .populate('statusHistory.changedBy', 'email');
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking.statusHistory);
};
