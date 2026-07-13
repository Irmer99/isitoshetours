require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function seed() {
  const uri = process.env.MONGODB_URI //|| 'mongodb://localhost:27017/ishe_tours';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const role = process.env.ADMIN_ROLE || 'admin';

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${existing.email} (${existing.role})`);
  } else {
    await Admin.create({ email, password, role });
    console.log(`Admin created: ${email}`);
  }

  await mongoose.connection.close();
  console.log('Done');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
