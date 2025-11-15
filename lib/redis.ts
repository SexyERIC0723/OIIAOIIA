// Redis Client for Caching Real-time Stats
import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
  })

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Redis Keys
export const REDIS_KEYS = {
  ONLINE_PLAYERS: 'online:players',
  TOTAL_SPINS: 'stats:total_spins',
  TODAY_SPINS: 'stats:today_spins',
  SPINS_PER_MIN: 'stats:spins_per_min',
  COUNTRY_SPINS: (code: string) => `stats:country:${code}`,
  PLAYER_SESSION: (id: string) => `session:player:${id}`,
  RATE_LIMIT_SPIN: (id: string) => `ratelimit:spin:${id}`,
  RATE_LIMIT_CHAT: (id: string) => `ratelimit:chat:${id}`,
}

// Helper Functions
export async function incrementTotalSpins(amount: number = 1): Promise<number> {
  return await redis.incrby(REDIS_KEYS.TOTAL_SPINS, amount)
}

export async function incrementTodaySpins(amount: number = 1): Promise<number> {
  const key = REDIS_KEYS.TODAY_SPINS
  const value = await redis.incrby(key, amount)

  // Set expiry to end of day if not already set
  const ttl = await redis.ttl(key)
  if (ttl === -1) {
    const now = new Date()
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const secondsUntilEndOfDay = Math.floor((endOfDay.getTime() - now.getTime()) / 1000)
    await redis.expire(key, secondsUntilEndOfDay)
  }

  return value
}

export async function getOnlinePlayerCount(): Promise<number> {
  return await redis.scard(REDIS_KEYS.ONLINE_PLAYERS)
}

export async function addOnlinePlayer(playerId: string): Promise<void> {
  await redis.sadd(REDIS_KEYS.ONLINE_PLAYERS, playerId)
  await redis.expire(REDIS_KEYS.ONLINE_PLAYERS, 300) // 5 minutes
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number = 60
): Promise<boolean> {
  const current = await redis.incr(key)

  if (current === 1) {
    await redis.expire(key, windowSeconds)
  }

  return current <= limit
}

export default redis
