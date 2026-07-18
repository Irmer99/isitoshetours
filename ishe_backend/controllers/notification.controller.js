const { getPrisma } = require('../lib/db');

exports.list = async (req, res) => {
  const prisma = getPrisma();
  const where = {};
  if (req.query.unread === 'true') where.read = false;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.notification.count({ where }),
  ]);

  res.json({ data: notifications, page, limit, total, pages: Math.ceil(total / limit) });
};

exports.unreadCount = async (req, res) => {
  const prisma = getPrisma();
  const count = await prisma.notification.count({ where: { read: false } });
  res.json({ count });
};

exports.markRead = async (req, res) => {
  const prisma = getPrisma();
  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true },
  });
  res.json(notification);
};

exports.markAllRead = async (req, res) => {
  const prisma = getPrisma();
  await prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
  res.json({ message: 'All notifications marked as read' });
};
