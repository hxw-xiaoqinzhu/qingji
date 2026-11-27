#!/usr/bin/env sh
set -e

mkdir -p /app/data/uploads
cd /app/backend

echo "📦 Syncing SQLite schema to ${DATABASE_URL}..."
npx prisma db push --skip-generate

echo "🧹 Migrating legacy package descriptions..."
node -e '
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  await prisma.packageTemplate.updateMany({
    where: { description: { contains: "开妆" } },
    data: { description: "早上 6:00 每提前一小时加 100" },
  });
  await prisma.$disconnect();
})();
' || true

echo "🌱 Checking initial seed..."
node -e '
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const count = await prisma.user.count();
  await prisma.$disconnect();
  if (count === 0) {
    process.exit(42);
  }
})();
' || {
  if [ "$?" -eq 42 ]; then
    echo "✨ Empty database detected, seeding demo account luna / 123456..."
    npx tsx prisma/seed.ts || true
  fi
}

echo "🚀 Starting QingJi unified server on port ${PORT:-3001}..."
exec node dist/index.js
