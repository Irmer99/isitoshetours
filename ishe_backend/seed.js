require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function seed() {
  const uri = process.env.MONGODB_URI //|| 'mongodb://localhost:27017/ishe_tours';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const existing = await Admin.findOne({ email: 'admin@ishetours.com' });
  if (existing) {
    console.log(`Admin already exists: ${existing.email} (${existing.role})`);
  } else {
    await Admin.create({
      email: 'admin@ishetours.com',
      password: 'admin123',
      role: 'superadmin',
    });
    console.log('Admin created: admin@ishetours.com / admin123');
  }

  await mongoose.connection.close();
  console.log('Done');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
