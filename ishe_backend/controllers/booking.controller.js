const { getPrisma } = require('../lib/db');

exports.create = async (req, res) => {
  const prisma = getPrisma();
  let discountApplied = 0;

  const booking = await prisma.$transaction(async (tx) => {
    if (req.body.discountCode) {
      const discount = await tx.discount.findFirst({
        where: {
          code: req.body.discountCode.toUpperCase(),
          active: true,
          deleted: false,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });
      if (!discount) {
        throw Object.assign(new Error('Invalid or expired discount code'), { status: 400 });
      }
      if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
        throw Object.assign(new Error('Discount usage limit reached'), { status: 400 });
      }
      await tx.discount.update({
        where: { id: discount.id },
        data: { usedCount: { increment: 1 } },
      });
      discountApplied = discount.type === 'percent'
        ? req.body.totalAmount * (discount.value / 100)
        : discount.value;
    }

    return tx.booking.create({
      data: {
        clientId: req.body.clientId,
        itinerary: req.body.itinerary,
        itineraryTitle: req.body.itineraryTitle,
        status: req.body.status || 'enquiry',
        travelDate: new Date(req.body.travelDate),
        participants: req.body.participants,
        totalAmount: req.body.totalAmount,
        discountCode: req.body.discountCode,
        discountApplied,
        notes: req.body.notes,
        statusHistory: {
          create: [{ from: 'enquiry', to: 'enquiry', changedAt: new Date() }],
        },
      },
      include: { client: true },
    });
  });

  res.status(201).json(booking);
};

exports.list = async (req, res) => {
  const prisma = getPrisma();
  const where = { deleted: false };
  if (req.query.status) where.status = req.query.status;
  if (req.query.itinerary) where.itinerary = req.query.itinerary;
  if (req.query.from || req.query.to) {
    where.travelDate = {};
    if (req.query.from) where.travelDate.gte = new Date(req.query.from);
    if (req.query.to) where.travelDate.lte = new Date(req.query.to);
  }
  if (req.query.archived === 'true') {
    where.archived = true;
  } else {
    where.archived = false;
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { client: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);
  res.json({ data: bookings, page, limit, total, pages: Math.ceil(total / limit) });
};

exports.detail = async (req, res) => {
  const prisma = getPrisma();
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, deleted: false },
    include: { client: true },
  });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
};

exports.updateStatus = async (req, res) => {
  const { status, comment } = req.body;
  const prisma = getPrisma();
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, deleted: false },
  });
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

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status,
      statusHistory: {
        create: {
          from: booking.status,
          to: status,
          changedBy: req.admin.id,
          comment: comment || null,
        },
      },
    },
    include: { client: true },
  });
  res.json(updated);
};

exports.remove = async (req, res) => {
  const prisma = getPrisma();
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, deleted: false },
  });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  await prisma.booking.update({
    where: { id: booking.id },
    data: { deleted: true },
  });
  res.json({ message: 'Booking deleted' });
};

exports.update = async (req, res) => {
  const prisma = getPrisma();
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, deleted: false },
  });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const allowed = ['itinerary', 'itineraryTitle', 'travelDate', 'participants', 'totalAmount', 'notes'];
  const data = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      data[key] = key === 'travelDate' ? new Date(req.body[key]) : req.body[key];
    }
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data,
    include: { client: true },
  });
  res.json(updated);
};

exports.archive = async (req, res) => {
  const prisma = getPrisma();
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, deleted: false },
  });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { archived: true },
    include: { client: true },
  });
  res.json(updated);
};

exports.history = async (req, res) => {
  const prisma = getPrisma();
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, deleted: false },
    include: {
      statusHistory: {
        include: { admin: { select: { id: true, email: true } } },
        orderBy: { changedAt: 'desc' },
      },
    },
  });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  const sanitized = booking.statusHistory.map((entry) => ({
    from: entry.from,
    to: entry.to,
    changedAt: entry.changedAt,
    comment: entry.comment || null,
  }));
  res.json(sanitized);
};
