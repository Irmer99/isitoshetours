const logger = require('../lib/logger');

const errorHandler = (err, req, res, _next) => {
  logger.error({ err, url: req.url, method: req.method }, 'Unhandled error');

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large', details: 'Maximum file size is 500KB' });
    }
    return res.status(400).json({ error: 'Upload error', details: err.message });
  }
  if (err.name === 'ZodError' || err.name === 'PrismaClientValidationError') {
    return res.status(400).json({ error: 'Validation error', details: err.message });
  }
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(409).json({ error: `Duplicate value for ${field}` });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'Related record not found' });
  }

  const status = err.status || 500;
  if (process.env.NODE_ENV === 'production' && status === 500) {
    return res.status(500).json({ error: 'Internal server error' });
  }
  res.status(status).json({ error: err.message || 'Internal server error' });
};

module.exports = errorHandler;
