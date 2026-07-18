const { Router } = require('express');
const { getPrisma } = require('../lib/db');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      db: 'connected',
      uptime: process.uptime(),
    });
  } catch {
    res.status(503).json({
      status: 'degraded',
      db: 'disconnected',
      uptime: process.uptime(),
    });
  }
});

module.exports = router;
