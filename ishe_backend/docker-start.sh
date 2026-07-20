#!/bin/sh
set -e

echo "Running database migrations..."
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

echo "Starting server..."
exec node index.js
