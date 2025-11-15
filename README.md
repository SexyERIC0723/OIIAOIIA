# 🐱 Spinning Kitty

An interactive web application where your spins fuel the legend! Join thousands of spinners worldwide in the ultimate cat spinning experience.

## ✨ Features

- **Interactive Spinning**: Hold the button to spin the cat, release to slow down
- **Real-time Global Stats**: See worldwide statistics update live
- **Leaderboard**: Compete with spinners from around the globe
- **Rave Mode**: Experience mind-bending visual effects
- **Live Chat**: Connect with other spinners in real-time
- **Country Statistics**: View spinning activity by country
- **Terminal-style UI**: Retro aesthetic with modern animations
- **Mobile Responsive**: Full support for mobile and tablet devices

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations and transitions
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **Next.js API Routes** - REST API
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and real-time data

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Node.js 18+** - Runtime environment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker and Docker Compose (for containerized setup)

### Method 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd spinning-kitty
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env
   ```
   Edit `.env` and configure your settings (database password, etc.)

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec app npx prisma migrate dev
   ```

5. **Access the application**
   Open http://localhost:3000 in your browser

### Method 2: Local Development

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo-url>
   cd spinning-kitty
   npm install
   ```

2. **Set up PostgreSQL and Redis**

   Install and start PostgreSQL and Redis on your local machine, or use Docker:
   ```bash
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=changeme postgres:15-alpine
   docker run -d -p 6379:6379 redis:7-alpine
   ```

3. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   ```
   Update `.env.local` with your database credentials

4. **Set up database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to http://localhost:3000

## 📁 Project Structure

```
spinning-kitty/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── spin/         # Record spin events
│   │   ├── stats/        # Global statistics
│   │   ├── leaderboard/  # Player rankings
│   │   ├── chat/         # Chat messages
│   │   ├── country-stats/# Country-based stats
│   │   └── player/       # Player management
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── CatSpinner.tsx    # Main spinning cat component
│   ├── SpinControls.tsx  # Control buttons
│   ├── TerminalPanel.tsx # Terminal-style stats panel
│   └── CookieBanner.tsx  # Cookie consent banner
├── lib/                   # Utilities and helpers
│   ├── db.ts             # Prisma client
│   ├── redis.ts          # Redis client
│   ├── store.ts          # Zustand state management
│   └── player.ts         # Player utilities
├── prisma/               # Database
│   └── schema.prisma     # Database schema
├── public/               # Static assets
├── docker-compose.yml    # Docker services configuration
├── Dockerfile            # Docker build instructions
├── package.json          # Dependencies
└── README.md            # This file
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **players**: User/player information
- **spins**: Individual spin records
- **leaderboard_entries**: Ranked player statistics
- **daily_stats**: Daily aggregated statistics
- **country_stats**: Country-based aggregations
- **chat_messages**: Chat history
- **global_stats**: Overall statistics (singleton)

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Prisma Studio
```

## 🌐 API Endpoints

### POST `/api/spin`
Record spin events
```json
{
  "playerId": "uuid",
  "spinDelta": 150,
  "speedMultiplier": 1.5
}
```

### GET `/api/stats`
Get global statistics
```json
{
  "totalSpins": 1234567890,
  "todaySpins": 456789,
  "totalPlayers": 12345,
  "onlinePlayers": 42
}
```

### GET `/api/leaderboard?limit=100`
Get top players

### GET `/api/country-stats`
Get statistics by country

### GET/POST `/api/chat`
Get or post chat messages

### GET/POST `/api/player`
Get or update player information

## 🎨 Customization

### Themes
Edit `tailwind.config.js` to customize colors:
```javascript
colors: {
  terminal: {
    bg: '#0a0e17',
    border: '#1a2332',
    text: '#00ff41',
    // ...
  }
}
```

### Cat Design
Modify `components/CatSpinner.tsx` to change the cat SVG design

### Speed Multipliers
Edit `components/SpinControls.tsx` to add or modify speed options

## 📊 Performance & Caching

- Redis caches frequently accessed data (stats, leaderboard)
- Cache TTLs: 30s for stats, 60s for leaderboard, 120s for country stats
- Database queries optimized with indexes
- Prisma connection pooling

## 🔒 Privacy & Cookies

The app uses localStorage for:
- Anonymous player ID (UUID)
- Nickname
- Cookie preferences

No personal information is collected. Players are identified by randomly generated UUIDs.

## 🐛 Troubleshooting

### Database connection errors
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database credentials

### Redis connection errors
- Ensure Redis is running
- Check REDIS_URL in .env
- Try: `redis-cli ping`

### Build errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Regenerate Prisma: `npx prisma generate`

### Port already in use
- Change APP_PORT in .env
- Or kill the process: `lsof -ti:3000 | xargs kill`

## 🚢 Deployment

### Vercel (Recommended for Next.js)
1. Push to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Docker Production
```bash
docker-compose -f docker-compose.yml up -d --build
```

### Manual Server Deployment
```bash
npm run build
npm run start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Inspired by interactive web experiences
- Built with modern web technologies
- Cat lovers and spinners worldwide

## 📞 Support

- Create an issue for bug reports
- Discussions for feature requests
- Community chat for questions

---

Made with ❤️ for cat lovers and spinners everywhere!

**Your spins fuel the legend. Keep the cat spinning!** 🐱💫
