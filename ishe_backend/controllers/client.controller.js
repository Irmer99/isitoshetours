const { getPrisma } = require('../lib/db');

exports.create = async (req, res) => {
  const prisma = getPrisma();
  if (req.body.website) {
    return res.status(201).json({ message: 'Enquiry received' });
  }
  const existing = await prisma.client.findUnique({ where: { email: req.body.email } });
  if (existing) return res.status(409).json({ error: 'Client with this email already exists', clientId: existing.id });
  const client = await prisma.client.create({ data: req.body });

  await prisma.notification.create({
    data: {
      type: 'enquiry',
      title: 'New Enquiry',
      message: `${client.name} submitted a contact enquiry.`,
      link: `/admin/clients/${client.id}`,
      meta: { clientId: client.id, email: client.email },
    },
  });

  res.status(201).json(client);
};

exports.list = async (req, res) => {
  const prisma = getPrisma();
  const where = {};
  if (req.query.search) {
    const search = req.query.search;
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;
  const [clients, total] = await Promise.all([
    prisma.client.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.client.count({ where }),
  ]);
  res.json({ data: clients, page, limit, total, pages: Math.ceil(total / limit) });
};

exports.detail = async (req, res) => {
  const prisma = getPrisma();
  const client = await prisma.client.findUnique({ where: { id: req.params.id } });
  if (!client) return res.status(404).json({ error: 'Client not found' });
  res.json(client);
};

exports.update = async (req, res) => {
  const prisma = getPrisma();
  const client = await prisma.client.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(client);
};

exports.bookings = async (req, res) => {
  const prisma = getPrisma();
  const bookings = await prisma.booking.findMany({
    where: { clientId: req.params.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(bookings);
};
