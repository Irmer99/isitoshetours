const Client = require('../models/Client');
const Booking = require('../models/Booking');
const escapeRegex = require('../lib/escapeRegex');

exports.create = async (req, res) => {
  const existing = await Client.findOne({ email: req.body.email });
  if (existing) return res.json(existing);
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
  const clients = await Client.find(filter).sort({ createdAt: -1 });
  res.json(clients);
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
