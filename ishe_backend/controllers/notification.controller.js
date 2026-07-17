const Notification = require('../models/Notification');

exports.list = async (req, res) => {
  const filter = {};
  if (req.query.unread === 'true') filter.read = false;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  res.json({ data: notifications, page, limit, total, pages: Math.ceil(total / limit) });
};

exports.unreadCount = async (req, res) => {
  const count = await Notification.countDocuments({ read: false });
  res.json({ count });
};

exports.markRead = async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true },
  );
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  res.json(notification);
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany({ read: false }, { read: true });
  res.json({ message: 'All notifications marked as read' });
};
