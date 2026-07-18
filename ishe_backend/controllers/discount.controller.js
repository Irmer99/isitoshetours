const { getPrisma } = require('../lib/db');

exports.list = async (req, res) => {
  const prisma = getPrisma();
  const discounts = await prisma.discount.findMany({
    where: { deleted: false },
    orderBy: { createdAt: 'desc' },
  });
  res.json(discounts);
};

exports.create = async (req, res) => {
  const prisma = getPrisma();
  const discount = await prisma.discount.create({ data: req.body });
  res.status(201).json(discount);
};

exports.update = async (req, res) => {
  const prisma = getPrisma();
  const existing = await prisma.discount.findFirst({
    where: { id: req.params.id, deleted: false },
  });
  if (!existing) return res.status(404).json({ error: 'Discount not found' });
  const discount = await prisma.discount.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json(discount);
};

exports.remove = async (req, res) => {
  const prisma = getPrisma();
  const existing = await prisma.discount.findFirst({
    where: { id: req.params.id, deleted: false },
  });
  if (!existing) return res.status(404).json({ error: 'Discount not found' });
  await prisma.discount.update({
    where: { id: existing.id },
    data: { deleted: true },
  });
  res.json({ message: 'Discount deleted' });
};

exports.validate = async (req, res) => {
  const prisma = getPrisma();
  const { code, itineraryId } = req.body;

  const discount = await prisma.discount.findFirst({
    where: {
      code: code.toUpperCase(),
      active: true,
      deleted: false,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
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

  res.json({
    valid: true,
    discount: {
      code: discount.code,
      type: discount.type,
      value: discount.value,
      appliesTo: discount.appliesTo,
    },
  });
};
