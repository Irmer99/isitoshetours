const Discount = require('../models/Discount');

exports.list = async (req, res) => {
  const discounts = await Discount.find().sort({ createdAt: -1 });
  res.json(discounts);
};

exports.create = async (req, res) => {
  const discount = await Discount.create(req.body);
  res.status(201).json(discount);
};

exports.update = async (req, res) => {
  const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!discount) return res.status(404).json({ error: 'Discount not found' });
  res.json(discount);
};

exports.remove = async (req, res) => {
  const discount = await Discount.findByIdAndDelete(req.params.id);
  if (!discount) return res.status(404).json({ error: 'Discount not found' });
  res.json({ message: 'Discount deleted' });
};

exports.validate = async (req, res) => {
  const { code, itineraryId } = req.body;

  const discount = await Discount.findOne({
    code: code.toUpperCase(),
    active: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  if (!discount) {
    return res.status(404).json({ valid: false, error: 'Invalid or expired discount code' });
  }

  if (discount.appliesTo !== '*' && discount.appliesTo !== itineraryId) {
    return res.status(400).json({ valid: false, error: 'Discount does not apply to this itinerary' });
  }

  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
    return res.status(400).json({ valid: false, error: 'Discount usage limit reached' });
  }

  res.json({ valid: true, discount });
};
