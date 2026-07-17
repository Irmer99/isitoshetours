const cache = (durationSeconds) => (req, res, next) => {
  if (req.method !== 'GET') return next();

  const duration = durationSeconds || 300;
  res.set('Cache-Control', `public, max-age=${duration}, s-maxage=${duration}`);
  next();
};

module.exports = cache;
