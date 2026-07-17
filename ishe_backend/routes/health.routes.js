const { Router } = require('express');
const mongoose = require('mongoose');

const router = Router();

router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const healthy = dbState === 1;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    db: healthy ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

module.exports = router;
