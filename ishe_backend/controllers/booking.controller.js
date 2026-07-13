const Booking = require('../models/Booking');
const Discount = require('../models/Discount');

exports.create = async (req, res) => {
  if (req.body.discountCode) {
    const discount = await Discount.findOne({
      code: req.body.discountCode.toUpperCase(),
      active: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });
    if (!discount) {
      return res.status(400).json({ error: 'Invalid or expired discount code' });
    }
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return res.status(400).json({ error: 'Discount usage limit reached' });
    }
    await Discount.findByIdAndUpdate(discount._id, { $inc: { usedCount: 1 } });
  }

  req.body.statusHistory = [{ from: 'enquiry', to: 'enquiry', changedAt: new Date() }];

  const booking = await Booking.create(req.body);
  await booking.populate('clientId');
  res.status(201).json(booking);
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
  if (req.query.archived === 'true') {
    filter.archived = true;
  } else {
    filter.archived = { $ne: true };
  }

  const bookings = await Booking.find(filter)
    .populate('clientId')
    .sort({ createdAt: -1 });
  res.json(bookings);
};

exports.detail = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('clientId');
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

  const populated = await Booking.findById(booking._id)    .populate('clientId');
  res.json(populated);
};

exports.remove = async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json({ message: 'Booking deleted' });
};

exports.update = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const allowed = ['itinerary', 'itineraryTitle', 'travelDate', 'participants', 'totalAmount', 'notes'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      booking[key] = req.body[key];
    }
  }

  await booking.save();
  const populated = await Booking.findById(booking._id).populate('clientId');
  res.json(populated);
};

exports.archive = async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { archived: true },
    { new: true },
  ).populate('clientId');
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
};

exports.history = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .select('statusHistory')
    .populate('statusHistory.changedBy', 'email');
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking.statusHistory);
};
