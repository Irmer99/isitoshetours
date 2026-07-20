#!/bin/sh
set -e

echo "Running database migrations..."
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

echo "Seeding admin user..."
DATABASE_URL="$DATABASE_URL" ADMIN_EMAIL="$ADMIN_EMAIL" ADMIN_PASSWORD="$ADMIN_PASSWORD" ADMIN_ROLE="$ADMIN_ROLE" node seed.js

echo "Starting server..."
exec node index.js
