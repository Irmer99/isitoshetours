const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI //|| 'mongodb://localhost:27017/ishe_tours';
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Server will continue without database — API routes will return errors');
  }
};

module.exports = connectDB;
