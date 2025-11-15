# 🚀 Quick Setup Guide

This guide will help you get Spin-Kitty running in under 10 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed
- [ ] PostgreSQL 15+ installed and running
- [ ] Redis installed and running
- [ ] Git installed

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd spin-kitty

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your favorite editor
```

**Minimum required settings:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/spinkitty?schema=public"
REDIS_URL="redis://localhost:6379"
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 4. Start Services

**Make sure PostgreSQL and Redis are running:**

```bash
# Check PostgreSQL
pg_isready

# Check Redis
redis-cli ping
# Should return: PONG
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 🐳 Alternative: Docker Setup (Even Easier!)

If you have Docker installed:

```bash
# Start everything with one command
docker-compose up --build

# In another terminal, run migrations
docker-compose exec app npx prisma migrate deploy
```

That's it! Visit [http://localhost:3000](http://localhost:3000)

## ✅ Verify Installation

Once the app is running, verify these features work:

1. **Cat Spinning**: Click and hold "HOLD TO SPIN" button
2. **Stats Panel**: Check the terminal shows data (may show 0s initially)
3. **Rave Mode**: Toggle the Rave Mode switch
4. **WebSocket**: Look for "● LIVE" indicator in top-right

## 🐛 Common Issues

### Issue: Database connection error

**Solution:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Verify connection string in .env
# Make sure database exists
psql -U postgres -c "CREATE DATABASE spinkitty;"
```

### Issue: Redis connection error

**Solution:**
```bash
# Start Redis
sudo systemctl start redis  # Linux
brew services start redis  # macOS

# Test connection
redis-cli ping
```

### Issue: Prisma Client not found

**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate
```

### Issue: WebSocket not connecting

**Solution:**
- Make sure you're using the custom server: `node server.js` or `npm run dev`
- Check `NEXT_PUBLIC_WS_URL` in `.env` matches your app URL

## 📦 Production Deployment

### Using Docker Compose (Recommended)

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

### Using Vercel + External DB

1. Deploy to Vercel: `vercel`
2. Add environment variables in Vercel dashboard
3. Use external PostgreSQL (Supabase/Neon) and Redis (Upstash)

## 🎯 Next Steps

After setup, you should:

1. **Customize the cat image** in `components/CatSpinner.tsx`
2. **Add audio files** to `/public/audio/`
3. **Configure IP geolocation** for country detection
4. **Set up rate limiting** for production
5. **Review security settings** before public deployment

## 💡 Tips

- Use `npm run db:studio` to inspect database visually
- Check Redis keys with `redis-cli KEYS *`
- Monitor logs with `docker-compose logs -f app`
- Use `npx prisma migrate reset` to reset database (⚠️ deletes all data)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Redis Commands](https://redis.io/commands)

Need help? Check the main [README.md](README.md) or open an issue!

---

Happy spinning! 🐱✨
