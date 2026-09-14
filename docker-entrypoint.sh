#!/bin/sh
set -e

echo "Starting Pre-Legal Document Generator in Docker..."

# Sync PostgreSQL schema
cp -f prisma/schema.postgresql.prisma prisma/schema.prisma
npx prisma generate
npx prisma db push --accept-data-loss

# Seed initial data
npx tsx prisma/seed.ts || echo "Seed completed or already populated."

echo "Database ready. Launching Next.js..."
exec "$@"
