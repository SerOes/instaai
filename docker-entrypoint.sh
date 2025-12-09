#!/bin/sh
set -e

echo "🔄 Syncing database schema with Prisma..."
npx prisma db push --accept-data-loss --skip-generate

echo "✅ Database schema synced successfully"
echo "🚀 Starting Next.js server..."
exec node server.js
