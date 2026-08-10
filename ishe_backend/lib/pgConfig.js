function getPgConfig() {
  const connectionString = process.env.DATABASE_URL;
  const config = { connectionString };
  if (connectionString && !/sslmode=/.test(connectionString)) {
    config.ssl = { rejectUnauthorized: false };
  }
  return config;
}

module.exports = getPgConfig;
