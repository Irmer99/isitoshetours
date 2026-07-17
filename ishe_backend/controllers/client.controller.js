const Client = require('../models/Client');
const Booking = require('../models/Booking');
const escapeRegex = require('../lib/escapeRegex');

exports.create = async (req, res) => {
  if (req.body.website) {
    return res.status(201).json({ message: 'Enquiry received' });
  }
  const existing = await Client.findOne({ email: req.body.email });
  if (existing) return res.status(409).json({ error: 'Client with this email already exists', clientId: existing._id });
  const client = await Client.create(req.body);
  res.status(201).json(client);
};

exports.list = async (req, res) => {
  const filter = {};
  if (req.query.search) {
    const safe = escapeRegex(req.query.search);
    const regex = new RegExp(safe, 'i');
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;
  const [clients, total] = await Promise.all([
    Client.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Client.countDocuments(filter),
  ]);
  res.json({ data: clients, page, limit, total, pages: Math.ceil(total / limit) });
};

exports.detail = async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  res.json(client);
};

exports.update = async (req, res) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!client) return res.status(404).json({ error: 'Client not found' });
  res.json(client);
};

exports.bookings = async (req, res) => {
  const bookings = await Booking.find({ clientId: req.params.id })
    .populate('clientId')
    .sort({ createdAt: -1 });
  res.json(bookings);
};
