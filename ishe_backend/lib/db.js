const mongoose = require('mongoose');
const logger = require('./logger');

let isConnecting = false;
let reconnectTimer = null;

mongoose.connection.on('error', (err) => {
  logger.error({ err }, 'MongoDB runtime error');
});
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
  scheduleReconnect();
});

function scheduleReconnect() {
  if (isConnecting || reconnectTimer) return;
  logger.info('Attempting MongoDB reconnect in 5s...');
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    isConnecting = true;
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ishe_tours';
      await mongoose.disconnect();
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      logger.info('MongoDB reconnected');
    } catch (err) {
      logger.warn({ err }, 'MongoDB reconnect failed, will retry in 5s');
      scheduleReconnect();
    } finally {
      isConnecting = false;
    }
  }, 5000);
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ishe_tours';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
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
      logger.error({ err: fallbackErr }, 'Local MongoDB also failed — will retry');
      scheduleReconnect();
    }
  }
};

module.exports = connectDB;
