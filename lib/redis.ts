import { createClient } from 'redis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redisClient = createClient({
  url: redisUrl,
})

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redisClient.on('connect', () => {
  console.log('✅ Redis connected')
})

// Initialize connection
let isConnected = false

export async function connectRedis() {
  if (!isConnected) {
    await redisClient.connect()
    isConnected = true
  }
  return redisClient
}

// Cache keys
export const CACHE_KEYS = {
  TOTAL_SPINS: 'stats:total_spins',
  TODAY_SPINS: 'stats:today_spins',
  ONLINE_PLAYERS: 'stats:online_players',
  TOTAL_PLAYERS: 'stats:total_players',
  LEADERBOARD: 'leaderboard:top_100',
  COUNTRY_STATS: 'stats:countries',
  RECENT_EVENTS: 'events:recent',
  ACTIVE_SESSIONS: 'sessions:active',
}

// Helper functions for common cache operations
export async function incrementStat(key: string, amount: number = 1): Promise<number> {
  const client = await connectRedis()
  return await client.incrBy(key, amount)
}

export async function getStat(key: string): Promise<string | null> {
  const client = await connectRedis()
  return await client.get(key)
}

export async function setStat(key: string, value: string | number, expirySeconds?: number): Promise<void> {
  const client = await connectRedis()
  if (expirySeconds) {
    await client.setEx(key, expirySeconds, value.toString())
  } else {
    await client.set(key, value.toString())
  }
}

export async function addToList(key: string, value: string, maxLength: number = 100): Promise<void> {
  const client = await connectRedis()
  await client.lPush(key, value)
  await client.lTrim(key, 0, maxLength - 1)
}

export async function getList(key: string, start: number = 0, end: number = -1): Promise<string[]> {
  const client = await connectRedis()
  return await client.lRange(key, start, end)
}

export default redisClient
