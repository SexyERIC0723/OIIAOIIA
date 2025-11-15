#!/bin/bash

# Database Reset Script
# ⚠️  WARNING: This will delete ALL data!

set -e

echo "⚠️  WARNING: This will delete ALL data in the database!"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo "🔄 Resetting database..."

# Reset database
npx prisma migrate reset --force

# Reinitialize
echo "📊 Reinitializing data..."
bash scripts/init-db.sh

echo "✅ Database has been reset!"
