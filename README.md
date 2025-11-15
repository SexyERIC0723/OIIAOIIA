# 🐱 Spin-Kitty - Interactive Cat Spinning Experience

A full-stack interactive web application where users can spin a virtual cat and participate in a global community. Features real-time statistics, leaderboards, chat, and an immersive "Rave Mode" with music and visual effects.

**⚠️ Note:** This project is inspired by spinning.cat but is a completely original implementation with custom code, design, and assets.

## ✨ Features

- **Interactive Cat Spinner**: Hold to spin, release to decelerate with smooth animations
- **Real-time Global Statistics**: Track total spins, daily spins, and active players
- **Leaderboard System**: Compete globally or by country
- **Terminal-style UI**: Retro aesthetic with multiple information tabs
- **Rave Mode**: Enhanced visuals and audio for maximum excitement
- **Live Chat**: Community interaction with real-time messaging
- **Country Statistics**: Geographic distribution of players and spins
- **WebSocket Integration**: Real-time updates across all connected clients
- **Mobile Responsive**: Optimized for both desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Socket.IO Client** - Real-time communication

### Backend
- **Next.js API Routes** - RESTful endpoints
- **Socket.IO Server** - WebSocket connections
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Primary database
- **Redis** - Caching and real-time counters

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **Node.js 18** - Runtime environment

## 📁 Project Structure

```
spin-kitty/
├── app/
│   ├── api/              # API routes
│   │   ├── spin/         # Record spin events
│   │   ├── stats/        # Global statistics
│   │   ├── leaderboard/  # Player rankings
│   │   ├── chat/         # Chat messages
│   │   ├── events/       # Event log
│   │   └── country-stats/ # Geographic data
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/
│   ├── CatSpinner.tsx    # Main spinning cat component
│   ├── SpinControls.tsx  # Control panel (buttons, toggles)
│   ├── TerminalPanel.tsx # Multi-tab statistics panel
│   ├── CookieBanner.tsx  # Cookie consent UI
│   └── AudioPlayer.tsx   # Background music player
├── lib/
│   ├── db.ts             # Prisma client singleton
│   ├── redis.ts          # Redis client & helpers
│   ├── analytics.ts      # Analytics functions
│   ├── websocket.ts      # WebSocket type definitions
│   ├── socket-client.ts  # Socket.IO client hook
│   └── use-player.ts     # Player ID management hook
├── prisma/
│   └── schema.prisma     # Database schema
├── public/
│   └── audio/            # Audio files (placeholder)
├── server.js             # Custom Next.js server with Socket.IO
├── docker-compose.yml    # Multi-container setup
├── Dockerfile            # Production container image
└── package.json          # Dependencies & scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 15+
- **Redis** 7+
- **Docker** and **Docker Compose** (for containerized setup)

### Option 1: Local Development (Manual Setup)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd spin-kitty
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/spinkitty?schema=public"
   REDIS_URL="redis://localhost:6379"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_WS_URL="ws://localhost:3000"
   ```

4. **Start PostgreSQL and Redis**
   ```bash
   # PostgreSQL (example using Homebrew on macOS)
   brew services start postgresql@15

   # Redis
   brew services start redis
   ```

5. **Initialize the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev --name init

   # (Optional) Seed initial data
   npx prisma db push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Option 2: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd spin-kitty
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

   This will start:
   - PostgreSQL on port 5432
   - Redis on port 6379
   - Next.js app on port 3000

4. **Run database migrations**
   ```bash
   # In a new terminal
   docker-compose exec app npx prisma migrate deploy
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Key Models

- **Player**: Stores user information and country data
- **Spin**: Individual spin records with speed and mode
- **DailyStats**: Aggregated daily statistics
- **CountryStats**: Geographic statistics
- **ChatMessage**: Chat history
- **LeaderboardEntry**: Player rankings
- **Event**: Activity log for terminal display
- **GlobalStats**: Overall statistics (singleton)

### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create migration
npm run db:migrate

# Push schema without migration
npm run db:push

# Open Prisma Studio (DB GUI)
npm run db:studio
```

## 🔌 API Endpoints

### POST `/api/spin`
Record a spin event
```json
{
  "playerId": "uuid",
  "spinCount": 10,
  "speed": 1.5,
  "raveMode": true
}
```

### GET `/api/stats`
Get global statistics
```json
{
  "totalSpins": "1234567",
  "todaySpins": "12345",
  "totalPlayers": 5678,
  "onlinePlayers": 123,
  "spinsPerMin": 45
}
```

### GET `/api/leaderboard?limit=10&country=US`
Get top players (optionally filtered by country)

### GET `/api/country-stats`
Get statistics grouped by country

### GET `/api/chat?limit=50`
Get recent chat messages

### POST `/api/chat`
Send a chat message
```json
{
  "playerId": "uuid",
  "nickname": "CatLover",
  "message": "Hello world!"
}
```

### GET `/api/events?limit=20&type=spin`
Get recent events for terminal display

## 🌐 WebSocket Events

### Client → Server
- `join`: Join with player ID
- `ping`: Keep-alive ping

### Server → Client
- `spin`: New spin event
- `stats`: Statistics update
- `chat`: New chat message
- `player_join`: Player joined

## 🎨 Customization

### Replace Cat Image

Edit `components/CatSpinner.tsx` and replace the SVG placeholder with your own design:

```tsx
// Replace this SVG with your own image
<svg width="300" height="300" viewBox="0 0 200 200">
  {/* Your custom cat design */}
</svg>
```

Or use an image file:
```tsx
<Image src="/images/cat.png" alt="Spinning Cat" width={300} height={300} />
```

### Add Audio Files

Place audio files in `/public/audio/`:
```
/public/audio/
  ├── classic-beat.mp3
  ├── electronic-mix.mp3
  ├── chill-vibes.mp3
  └── hyper-mode.mp3
```

Update `components/AudioPlayer.tsx` with actual file paths.

### Customize Colors

Edit `tailwind.config.ts` to change the color scheme:

```typescript
colors: {
  terminal: {
    bg: '#0a0e14',      // Background
    text: '#00ff41',    // Primary text
    border: '#1a2332',  // Borders
    highlight: '#00cc33', // Highlights
  },
  rave: {
    pink: '#ff00ff',
    cyan: '#00ffff',
    yellow: '#ffff00',
    purple: '#9d00ff',
  },
}
```

## 🚀 Deployment

### Vercel (Recommended for Frontend)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Set environment variables in Vercel dashboard
4. Note: You'll need external PostgreSQL and Redis (e.g., Supabase, Upstash)

### Railway / Render (Full-Stack)

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy with Docker Compose support

### Self-Hosted with Docker

```bash
# Production build
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f app
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Required |
| `NEXT_PUBLIC_APP_URL` | Public app URL | http://localhost:3000 |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | ws://localhost:3000 |
| `RATE_LIMIT_SPIN_PER_MINUTE` | Max spins per minute per player | 100 |
| `RATE_LIMIT_CHAT_PER_MINUTE` | Max chat messages per minute | 5 |
| `IP_GEOLOCATION_API_KEY` | API key for geolocation service | Optional |
| `IP_GEOLOCATION_SERVICE` | Service name (ipapi.co, etc.) | ipapi.co |

### Rate Limiting

Adjust rate limits in `.env`:
```env
RATE_LIMIT_SPIN_PER_MINUTE=100
RATE_LIMIT_CHAT_PER_MINUTE=5
```

## 📊 Monitoring

### Redis CLI

```bash
# Connect to Redis
redis-cli

# View all keys
KEYS *

# Get total spins
GET stats:total_spins

# Get online players
SMEMBERS online:players
```

### Database Monitoring

```bash
# Open Prisma Studio
npm run db:studio
```

Access at [http://localhost:5555](http://localhost:5555)

## 🐛 Troubleshooting

### WebSocket Connection Issues

- Ensure `NEXT_PUBLIC_WS_URL` matches your deployment URL
- Check firewall rules for WebSocket connections
- Verify custom server (`server.js`) is running

### Database Connection Errors

- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` format
- Run migrations: `npx prisma migrate deploy`

### Redis Connection Errors

- Verify Redis is running: `redis-cli ping`
- Check `REDIS_URL` configuration

## 📝 License

This project is provided as-is for educational and personal use. All code is original.

## 🙏 Acknowledgments

- Inspired by the concept of spinning.cat
- Built with modern web technologies
- Community-driven and open for contributions

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues and questions:
- Open a GitHub issue
- Check existing documentation
- Review troubleshooting section

---

**Happy Spinning! 🐱💫**
