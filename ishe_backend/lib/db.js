const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const logger = require('./logger');

let prisma;

function getPrisma() {
  if (!prisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

async function connectDB() {
  try {
    const client = getPrisma();
    await client.$connect();
    logger.info('PostgreSQL connected');
  } catch (err) {
    logger.error({ err }, 'PostgreSQL connection failed');
    throw err;
  }
}

module.exports = connectDB;
module.exports.getPrisma = getPrisma;
