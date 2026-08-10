require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const getPgConfig = require('../lib/pgConfig');

async function rehash() {
  const adapter = new PrismaPg(getPgConfig());
  const prisma = new PrismaClient({ adapter });
  await prisma.$connect();
  console.log('Connected to PostgreSQL');

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.NEW_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and NEW_ADMIN_PASSWORD (or ADMIN_PASSWORD) must be set in .env');
    process.exit(1);
  }

  const strongRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!strongRe.test(password)) {
    console.error(
      'NEW_ADMIN_PASSWORD does not meet policy (8+ chars, upper, lower, number, special). Aborting.',
    );
    process.exit(1);
  }

  const existing = await prisma.admin.findFirst({ where: { email } });
  if (!existing) {
    console.error(`No admin found with email ${email}. Run db:seed instead.`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.admin.update({
    where: { id: existing.id },
    data: { password: hashedPassword },
  });
  console.log(`Password updated for ${existing.email} (${existing.role})`);
  console.log('Remember to rotate the password in Render env vars too.');

  await prisma.$disconnect();
  console.log('Done');
}

rehash().catch((err) => {
  console.error('Rehash failed:', err.message);
  process.exit(1);
});
