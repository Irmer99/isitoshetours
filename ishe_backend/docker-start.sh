#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy --url "$DATABASE_URL"

echo "Starting server..."
exec node index.js
