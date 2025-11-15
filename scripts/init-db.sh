#!/bin/bash

# Database Initialization Script
# Run this script to set up the database from scratch

set -e

echo "🗄️  Initializing Spin-Kitty Database..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "   Please copy .env.example to .env and configure it"
    exit 1
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Initialize global stats
echo "📊 Initializing global statistics..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function init() {
  await prisma.globalStats.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      totalSpins: 0,
      totalPlayers: 0,
      totalCountries: 0,
      recordSpinsPerMin: 0,
    },
  });
  console.log('✅ Global stats initialized');
  await prisma.\$disconnect();
}

init();
"

echo "✅ Database initialization complete!"
echo ""
echo "Next steps:"
echo "  1. Start Redis: redis-server"
echo "  2. Run dev server: npm run dev"
