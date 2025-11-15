# 🚀 Spinning Kitty - Setup Guide

Complete step-by-step guide to get Spinning Kitty running on your machine.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Verification](#verification)
7. [Common Issues](#common-issues)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** (v18 or higher)
  ```bash
  node --version  # Should be v18.x.x or higher
  ```
- **npm** (comes with Node.js)
  ```bash
  npm --version
  ```

### Optional (for Docker method)
- **Docker** (v20 or higher)
  ```bash
  docker --version
  ```
- **Docker Compose** (v2 or higher)
  ```bash
  docker-compose --version
  ```

---

## Installation Methods

Choose one of the following methods:

### Method A: Docker Compose (Easiest) ⭐

This method automatically sets up PostgreSQL, Redis, and the Next.js app.

#### Step 1: Clone the repository
```bash
git clone <your-repository-url>
cd spinning-kitty
```

#### Step 2: Create environment file
```bash
cp .env.local.example .env
```

Edit `.env` and update these values:
```env
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL="postgresql://spinning_kitty:your_secure_password_here@localhost:5432/spinning_kitty?schema=public"
```

#### Step 3: Start all services
```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Next.js app (port 3000)

#### Step 4: Run database migrations
```bash
# Wait 10 seconds for PostgreSQL to be ready
sleep 10

# Run migrations
docker-compose exec app npx prisma migrate dev --name init
```

#### Step 5: Access the app
Open http://localhost:3000 in your browser

✅ **Done!** Your app is running.

---

### Method B: Local Development

This method runs the Next.js app locally and uses Docker for databases.

#### Step 1: Clone and install
```bash
git clone <your-repository-url>
cd spinning-kitty
npm install
```

#### Step 2: Start PostgreSQL and Redis
```bash
# PostgreSQL
docker run -d \
  --name spinning-kitty-postgres \
  -e POSTGRES_USER=spinning_kitty \
  -e POSTGRES_PASSWORD=changeme \
  -e POSTGRES_DB=spinning_kitty \
  -p 5432:5432 \
  postgres:15-alpine

# Redis
docker run -d \
  --name spinning-kitty-redis \
  -p 6379:6379 \
  redis:7-alpine
```

#### Step 3: Configure environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://spinning_kitty:changeme@localhost:5432/spinning_kitty?schema=public"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

#### Step 4: Set up database
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

#### Step 5: Start development server
```bash
npm run dev
```

#### Step 6: Open browser
Navigate to http://localhost:3000

✅ **Done!** Your app is running in development mode.

---

### Method C: Fully Local (No Docker)

Install PostgreSQL and Redis directly on your machine.

#### For macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Install Redis
brew install redis
brew services start redis

# Create database
createdb spinning_kitty
```

#### For Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Install Redis
sudo apt install redis-server
sudo systemctl start redis

# Create database
sudo -u postgres createdb spinning_kitty
sudo -u postgres psql -c "CREATE USER spinning_kitty WITH PASSWORD 'changeme';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE spinning_kitty TO spinning_kitty;"
```

#### For Windows
Download and install:
- PostgreSQL: https://www.postgresql.org/download/windows/
- Redis: https://github.com/microsoftarchive/redis/releases

Then follow Method B steps 1, 3, 4, 5, and 6.

---

## Environment Configuration

### Required Variables

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Redis
REDIS_URL="redis://HOST:PORT"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Optional Variables

```env
# IP Geolocation (for country detection)
IP_GEOLOCATION_API_KEY="your_api_key"

# Analytics
NEXT_PUBLIC_ANALYTICS_ID="your_analytics_id"

# Custom Ports
APP_PORT=3000
POSTGRES_PORT=5432
REDIS_PORT=6379
```

---

## Database Setup

### Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init
```

### Seed Database (Optional)

Create a seed file `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create initial global stats
  await prisma.globalStats.create({
    data: {
      id: 1,
      totalSpins: 0,
      todaySpins: 0,
      totalPlayers: 0,
      onlinePlayers: 0,
    },
  })

  console.log('✅ Database seeded!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run seed:
```bash
npx tsx prisma/seed.ts
```

### Manage Database

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name your_migration_name

# Deploy migrations to production
npx prisma migrate deploy
```

---

## Running the Application

### Development Mode
```bash
npm run dev
```
- Hot reload enabled
- Detailed error messages
- Prisma query logging

### Production Mode
```bash
# Build
npm run build

# Start
npm run start
```

### Docker Mode
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

---

## Verification

### Check if everything is working:

1. **Homepage loads**: http://localhost:3000
2. **Cat spins** when you hold the button
3. **Terminal panel** shows tabs (Events, Spinners, etc.)
4. **Cookie banner** appears at the bottom
5. **Stats update** when you spin

### Test API endpoints:

```bash
# Get stats
curl http://localhost:3000/api/stats

# Get leaderboard
curl http://localhost:3000/api/leaderboard

# Record a spin (replace YOUR_PLAYER_ID)
curl -X POST http://localhost:3000/api/spin \
  -H "Content-Type: application/json" \
  -d '{"playerId":"YOUR_PLAYER_ID","spinDelta":100,"speedMultiplier":1.0}'
```

### Check database connection:

```bash
# Using Prisma Studio
npx prisma studio

# Using psql
psql -U spinning_kitty -d spinning_kitty -c "SELECT COUNT(*) FROM players;"
```

### Check Redis connection:

```bash
# Using redis-cli
redis-cli ping
# Should return: PONG

# Check cached stats
redis-cli GET "stats:total_spins"
```

---

## Common Issues

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps  # (if using Docker)
# or
pg_isready  # (if installed locally)

# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### Issue: "Redis connection refused"

**Solution:**
```bash
# Check if Redis is running
docker ps  # (if using Docker)
# or
redis-cli ping  # (if installed locally)

# Restart Redis
docker restart spinning-kitty-redis
# or
brew services restart redis  # (macOS)
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill

# Or change the port in .env
APP_PORT=3001
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate

# If still failing, delete and regenerate
rm -rf node_modules/.prisma
npx prisma generate
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Issue: "Database schema out of sync"

**Solution:**
```bash
# Reset and re-migrate
npx prisma migrate reset
npx prisma migrate dev
```

---

## Next Steps

After successful setup:

1. 📖 Read the [README.md](README.md) for full documentation
2. 🎨 Customize the cat design in `components/CatSpinner.tsx`
3. 🌈 Modify colors in `tailwind.config.js`
4. 🚀 Deploy to Vercel or your preferred platform

---

## Need Help?

- 📝 Check the [README.md](README.md)
- 🐛 Open an issue on GitHub
- 💬 Join our community chat

Happy spinning! 🐱✨
