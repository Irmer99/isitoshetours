require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

async function seed() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  await prisma.$connect();
  console.log('Connected to PostgreSQL');

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const role = process.env.ADMIN_ROLE || 'admin';

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const strongRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!strongRe.test(password)) {
    console.error('ADMIN_PASSWORD does not meet policy (8+ chars, upper, lower, number, special). Skipping seed.');
    process.exit(1);
  }

  const existing = await prisma.admin.findFirst({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${existing.email} (${existing.role})`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.admin.create({
      data: { email, password: hashedPassword, role },
    });
    console.log(`Admin created: ${email}`);
  }

  await prisma.$disconnect();
  console.log('Done');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
