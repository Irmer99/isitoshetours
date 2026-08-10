require('dotenv').config();
const { execSync } = require('child_process');

execSync('node seed.js', { stdio: 'inherit', env: process.env });
