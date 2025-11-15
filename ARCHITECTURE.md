# 🏗️ Architecture Overview

This document explains the technical architecture of Spin-Kitty.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Browser                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  React UI    │  │ WebSocket    │  │  REST API    │     │
│  │  Components  │  │  Client      │  │  Calls       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          │      │            │
                          │      │            │
                          ▼      ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Server                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  SSR/Pages   │  │ Socket.IO    │  │  API Routes  │     │
│  │  Rendering   │  │  Server      │  │  (REST)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          │                   │
                          │                   │
                          ▼                   ▼
              ┌──────────────────┐  ┌──────────────────┐
              │   PostgreSQL     │  │      Redis       │
              │   (Persistent)   │  │   (Cache/RT)     │
              └──────────────────┘  └──────────────────┘
```

## Data Flow

### 1. Spin Event Flow

```
User clicks button
    ↓
Frontend calculates spin count
    ↓
POST /api/spin
    ↓
API Route validates & rate limits
    ↓
recordSpin() → Analytics Layer
    ↓
┌─────────────────────────────────┐
│ 1. Write to PostgreSQL (Spin)   │
│ 2. Update Redis counters         │
│ 3. Update country stats          │
│ 4. Update leaderboard            │
│ 5. Create event log              │
└─────────────────────────────────┘
    ↓
Broadcast via WebSocket
    ↓
All connected clients receive update
    ↓
UI updates in real-time
```

### 2. Real-time Stats Flow

```
Component mounts
    ↓
Fetch initial data (GET /api/stats)
    ↓
Subscribe to WebSocket events
    ↓
Server broadcasts updates
    ↓
Client receives and updates state
    ↓
React re-renders with new data
```

## Component Architecture

### Frontend Components

```
app/page.tsx (Main Page)
├── CatSpinner
│   └── Framer Motion animations
├── SpinControls
│   ├── Speed selector
│   ├── Rave mode toggle
│   └── Remix selector
├── TerminalPanel
│   ├── Stats tab
│   ├── Events tab
│   ├── Leaderboard tab
│   ├── Chat tab
│   └── Globe tab
├── AudioPlayer
└── CookieBanner
```

### Backend Architecture

```
server.js (Custom Server)
├── Next.js handler
└── Socket.IO server

app/api/
├── spin/route.ts        → Record spins
├── stats/route.ts       → Global stats
├── leaderboard/route.ts → Player rankings
├── chat/route.ts        → Chat messages
├── events/route.ts      → Event log
└── country-stats/route.ts → Geographic data
```

## Database Schema

### Core Tables

**Player**
- Stores user identity
- Country information
- Timestamps

**Spin**
- Individual spin records
- Links to player
- Metadata (speed, rave mode)

**LeaderboardEntry**
- Aggregated player totals
- Rank calculation
- Cached for performance

**ChatMessage**
- Message content
- User attribution
- Country flag

**Event**
- Activity log
- Used for terminal display
- Flexible JSON data

**Stats Tables**
- DailyStats: Daily aggregates
- CountryStats: Geographic aggregates
- GlobalStats: Overall totals

## Caching Strategy

### Redis Keys

```
stats:total_spins        → BigInt counter
stats:today_spins        → Daily counter (expires EOD)
stats:spins_per_min      → Rolling counter
stats:country:{code}     → Per-country counter
online:players           → Set of active player IDs
session:player:{id}      → Session data
ratelimit:spin:{id}      → Rate limiting
ratelimit:chat:{id}      → Rate limiting
```

### Cache Invalidation

- Stats: Read from Redis, fallback to PostgreSQL
- Today's spins: Auto-expire at midnight
- Online players: 5-minute TTL
- Rate limits: 60-second windows

## WebSocket Events

### Client → Server

- `join`: Authenticate with player ID
- `ping`: Keep-alive heartbeat

### Server → Client

- `spin`: New spin event occurred
- `stats`: Updated global statistics
- `chat`: New chat message
- `player_join`: Player connected

## State Management

### Client State (React Hooks)

```typescript
// Player state
usePlayer() → playerId from localStorage

// WebSocket state
useSocket() → { socket, isConnected }

// Component state (useState)
- isSpinning
- speed
- raveMode
- spinCount
```

### Server State

- **PostgreSQL**: Source of truth
- **Redis**: Fast cache & counters
- **In-memory**: WebSocket connections

## Performance Optimizations

### 1. Database
- Indexes on frequently queried fields
- Materialized leaderboard table
- Batch operations for stats

### 2. Caching
- Redis for real-time counters
- Avoid DB queries for every spin
- TTL-based expiration

### 3. Frontend
- Lazy load terminal data
- Debounce WebSocket updates
- Optimize re-renders with memo

### 4. Network
- WebSocket for real-time data
- HTTP/2 for API calls
- CDN for static assets

## Security Measures

### Rate Limiting
- Spin: 100/min per player
- Chat: 5/min per player
- Stored in Redis

### Input Validation
- Sanitize chat messages
- Validate spin counts
- Type checking with TypeScript

### Authentication
- Anonymous UUID-based
- No passwords stored
- Optional future OAuth

## Deployment Architecture

### Development
```
Developer machine
├── Next.js dev server
├── Local PostgreSQL
└── Local Redis
```

### Production (Docker)
```
Docker Compose
├── app container (Next.js)
├── postgres container
└── redis container
```

### Production (Cloud)
```
Vercel (Frontend + API)
├── Supabase (PostgreSQL)
└── Upstash (Redis)
```

## Scalability Considerations

### Horizontal Scaling
- Next.js: Multiple instances behind load balancer
- PostgreSQL: Read replicas for queries
- Redis: Redis Cluster for high availability

### WebSocket Scaling
- Use Redis Pub/Sub for multi-instance communication
- Socket.IO Redis adapter

### Database Partitioning
- Partition spins by date
- Archive old data
- Separate analytics from operational data

## Monitoring & Observability

### Logs
- API request logs
- WebSocket connection events
- Database query performance
- Redis cache hit/miss rates

### Metrics
- Total spins/second
- Active WebSocket connections
- API response times
- Database query times
- Redis memory usage

### Alerts
- High error rates
- Database connection failures
- Redis connection failures
- Abnormal traffic patterns

## Future Enhancements

### Planned Features
- User authentication (OAuth, Fediverse)
- Advanced analytics dashboard
- Custom themes/skins
- Achievements system
- Mobile app (React Native)

### Technical Debt
- Add comprehensive test suite
- Implement proper logging system
- Set up CI/CD pipeline
- Add database migrations versioning
- Improve error handling

---

This architecture is designed to be:
- **Scalable**: Can grow with user base
- **Maintainable**: Clean separation of concerns
- **Performant**: Redis caching, optimized queries
- **Real-time**: WebSocket for instant updates
- **Resilient**: Graceful degradation, error handling
