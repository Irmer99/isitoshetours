const jwt = require('jsonwebtoken');
const { getPrisma } = require('../lib/db');

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const prisma = getPrisma();
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });
    if (!admin) {
      return res.status(401).json({ error: 'Account no longer exists' });
    }
    req.admin = { id: admin.id, email: admin.email, role: admin.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
