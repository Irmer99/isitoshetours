#!/bin/sh
set -e

echo "Running migrations via direct connection..."
DATABASE_URL="$DIRECT_DATABASE_URL" npx prisma migrate deploy

echo "Starting server..."
exec node index.js
