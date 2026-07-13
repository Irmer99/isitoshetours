const mongoose = require('mongoose');
const logger = require('./logger');

mongoose.connection.on('error', (err) => {
  logger.error({ err }, 'MongoDB runtime error');
});
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ishe_tours';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.warn({ err }, 'Primary MongoDB connection failed, falling back to local');
    try {
      await mongoose.connect('mongodb://localhost:27017/ishe_tours', {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      logger.info('Local MongoDB connected');
    } catch (fallbackErr) {
      logger.error({ err: fallbackErr }, 'Local MongoDB also failed — API routes will return errors');
    }
  }
};

module.exports = connectDB;
