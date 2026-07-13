const mongoose = require('mongoose');

mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err.message);
});
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ishe_tours';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Falling back to local MongoDB...');
    try {
      await mongoose.connect('mongodb://localhost:27017/ishe_tours', {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('Local MongoDB connected');
    } catch (fallbackErr) {
      console.error('Local MongoDB also failed:', fallbackErr.message);
      console.error('Server will continue without database — API routes will return errors');
    }
  }
};

module.exports = connectDB;
