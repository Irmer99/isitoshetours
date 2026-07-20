#!/bin/sh
set -e

echo "DATABASE_URL is set: $(if [ -n "$DATABASE_URL" ]; then echo 'yes'; else echo 'NO'; fi)"
echo "Running database migrations..."
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

echo "Starting server..."
exec node index.js
