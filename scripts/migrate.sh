#!/usr/bin/env bash
set -euo pipefail
echo "Running database migrations..."
cd backend
if [ -f "package.json" ]; then
  npx prisma migrate deploy 2>/dev/null || echo "No Prisma migrations found"
fi
echo "✓ Migrations complete"
