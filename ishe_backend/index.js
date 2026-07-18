const connectDB = require('./lib/db');
const app = require('./app');
const logger = require('./lib/logger');

const port = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(port, () => {
    logger.info({ port }, 'Server running');
  });
});
