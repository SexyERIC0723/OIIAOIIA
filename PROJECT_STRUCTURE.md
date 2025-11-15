# 📁 Complete Project Structure

This document provides a complete overview of the Spin-Kitty project structure.

## Directory Tree

```
spin-kitty/
│
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── spin/route.ts         # Record spin events
│   │   ├── stats/route.ts        # Global statistics
│   │   ├── leaderboard/route.ts  # Player rankings
│   │   ├── chat/route.ts         # Chat messages
│   │   ├── events/route.ts       # Event log
│   │   └── country-stats/route.ts # Country statistics
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── components/                   # React Components
│   ├── CatSpinner.tsx            # Main spinning cat
│   ├── SpinControls.tsx          # Control panel
│   ├── TerminalPanel.tsx         # Multi-tab stats panel
│   ├── CookieBanner.tsx          # Cookie consent
│   └── AudioPlayer.tsx           # Background music
│
├── lib/                          # Utility Libraries
│   ├── db.ts                     # Prisma client
│   ├── redis.ts                  # Redis client
│   ├── analytics.ts              # Analytics functions
│   ├── websocket.ts              # WebSocket types
│   ├── socket-client.ts          # Socket.IO client
│   └── use-player.ts             # Player ID hook
│
├── prisma/                       # Database
│   └── schema.prisma             # Database schema
│
├── public/                       # Static Assets
│   ├── audio/                    # Audio files (placeholder)
│   │   └── .gitkeep
│   └── images/                   # Images (placeholder)
│       └── .gitkeep
│
├── scripts/                      # Utility Scripts
│   ├── init-db.sh                # Initialize database
│   └── reset-db.sh               # Reset database
│
├── .dockerignore                 # Docker ignore file
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore file
├── ARCHITECTURE.md               # Architecture documentation
├── CONTRIBUTING.md               # Contribution guidelines
├── docker-compose.yml            # Multi-container setup
├── Dockerfile                    # Container image
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.js             # PostCSS configuration
├── PROJECT_STRUCTURE.md          # This file
├── README.md                     # Main documentation
├── server.js                     # Custom server with Socket.IO
├── SETUP_GUIDE.md                # Quick setup guide
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## File Descriptions

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, and metadata |
| `tsconfig.json` | TypeScript compiler configuration |
| `tailwind.config.ts` | Tailwind CSS theme and configuration |
| `next.config.js` | Next.js framework configuration |
| `postcss.config.js` | PostCSS configuration for Tailwind |
| `.env.example` | Environment variable template |
| `.gitignore` | Git ignore patterns |
| `.dockerignore` | Docker ignore patterns |

### Application Code

| File/Directory | Purpose |
|----------------|---------|
| `app/page.tsx` | Main homepage component |
| `app/layout.tsx` | Root layout and metadata |
| `app/globals.css` | Global CSS and animations |
| `app/api/*` | RESTful API endpoints |
| `components/*` | Reusable React components |
| `lib/*` | Utility functions and clients |

### Database

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema definition |

### Infrastructure

| File | Purpose |
|------|---------|
| `server.js` | Custom Node.js server with Socket.IO |
| `Dockerfile` | Container image definition |
| `docker-compose.yml` | Multi-container orchestration |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `SETUP_GUIDE.md` | Quick setup instructions |
| `ARCHITECTURE.md` | Technical architecture |
| `CONTRIBUTING.md` | Contribution guidelines |
| `PROJECT_STRUCTURE.md` | This file |

### Scripts

| File | Purpose |
|------|---------|
| `scripts/init-db.sh` | Database initialization |
| `scripts/reset-db.sh` | Database reset (⚠️ deletes data) |

## Key Technologies by File

### Frontend (Browser)
- `app/page.tsx` - React, Framer Motion
- `components/*.tsx` - React, TypeScript
- `app/globals.css` - Tailwind CSS, Custom CSS
- `lib/socket-client.ts` - Socket.IO Client
- `lib/use-player.ts` - React Hooks

### Backend (Server)
- `server.js` - Node.js, Socket.IO Server
- `app/api/*/route.ts` - Next.js API Routes
- `lib/db.ts` - Prisma Client
- `lib/redis.ts` - Redis Client (ioredis)
- `lib/analytics.ts` - Business logic

### Database
- `prisma/schema.prisma` - Prisma ORM, PostgreSQL

### Infrastructure
- `Dockerfile` - Docker, Node.js
- `docker-compose.yml` - Docker Compose

## Code Organization Principles

### 1. Separation of Concerns
- **UI**: `components/` and `app/page.tsx`
- **API**: `app/api/`
- **Business Logic**: `lib/analytics.ts`
- **Data Access**: `lib/db.ts`, `lib/redis.ts`

### 2. Type Safety
- All `.ts` and `.tsx` files use TypeScript
- Shared types in `lib/websocket.ts`
- Prisma generates type-safe database client

### 3. Reusability
- Components are modular and reusable
- Utility functions in `lib/`
- Custom hooks for common patterns

### 4. Scalability
- API routes are separate endpoints
- Database models are normalized
- Redis for caching and performance

## Important Files to Customize

When setting up your own instance:

1. **Environment Variables**
   - `.env` (create from `.env.example`)

2. **Assets**
   - `public/audio/` - Add your audio files
   - `public/images/` - Add your images
   - `components/CatSpinner.tsx` - Replace cat SVG

3. **Branding**
   - `app/page.tsx` - Update text and titles
   - `tailwind.config.ts` - Customize colors
   - `app/layout.tsx` - Update metadata

4. **Database**
   - `prisma/schema.prisma` - Modify if needed
   - Run migrations after changes

## Generated Files (Not in Git)

These files are generated and should not be committed:

```
node_modules/           # Dependencies
.next/                  # Next.js build output
.env                    # Environment variables
prisma/migrations/      # Database migrations (optional)
```

## Size Estimates

| Component | Approximate Size |
|-----------|-----------------|
| Source code | ~50 KB |
| Dependencies (node_modules) | ~500 MB |
| Built application | ~5 MB |
| Docker image | ~200 MB |

## Dependencies Overview

### Production Dependencies (17)
- **Framework**: next, react, react-dom
- **Database**: @prisma/client, prisma
- **Cache**: ioredis
- **WebSocket**: socket.io, socket.io-client
- **UI**: @radix-ui/react-tabs, framer-motion
- **State**: zustand
- **Utils**: uuid

### Dev Dependencies (9)
- **TypeScript**: typescript, @types/*
- **Styling**: tailwindcss, autoprefixer, postcss
- **Linting**: eslint, eslint-config-next

## Build Outputs

### Development (`npm run dev`)
- Hot reload enabled
- Source maps included
- Verbose logging

### Production (`npm run build`)
- Optimized bundle
- Minified code
- Static optimization
- Standalone output for Docker

## Entry Points

| Environment | Entry Point |
|-------------|-------------|
| Development | `npm run dev` → Next.js dev server → `server.js` |
| Production | `npm start` → `server.js` → Next.js production |
| Docker | `CMD ["node", "server.js"]` |

---

**Note**: This structure follows Next.js 14 App Router conventions and is optimized for both development and production deployments.
