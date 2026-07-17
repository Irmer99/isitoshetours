const logger = require('../lib/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({ err, url: req.url, method: req.method }, 'Unhandled error');

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const status = err.status || 500;
  if (process.env.NODE_ENV === 'production' && status === 500) {
    return res.status(500).json({ error: 'Internal server error' });
  }
  res.status(status).json({ error: err.message || 'Internal server error' });
};

module.exports = errorHandler;
