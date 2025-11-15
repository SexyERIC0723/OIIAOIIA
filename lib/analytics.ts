// Analytics and Geolocation Utilities

import prisma from './db'
import { redis, REDIS_KEYS, incrementTotalSpins, incrementTodaySpins } from './redis'

export interface SpinData {
  playerId: string
  spinCount: number
  speed?: number
  raveMode?: boolean
}

export interface CountryInfo {
  code: string
  name: string
}

/**
 * Get country from IP address
 * Uses free IP geolocation service (can be replaced with premium service)
 */
export async function getCountryFromIP(ip: string): Promise<CountryInfo | null> {
  try {
    // Skip for localhost/private IPs
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { code: 'XX', name: 'Local' }
    }

    const service = process.env.IP_GEOLOCATION_SERVICE || 'ipapi.co'

    if (service === 'ipapi.co') {
      const response = await fetch(`https://ipapi.co/${ip}/json/`)
      const data = await response.json()

      if (data.country_code) {
        return {
          code: data.country_code,
          name: data.country_name || 'Unknown',
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching country from IP:', error)
    return null
  }
}

/**
 * Record a spin event with all analytics
 */
export async function recordSpin(data: SpinData, countryCode?: string): Promise<void> {
  const { playerId, spinCount, speed = 1.0, raveMode = false } = data

  // 1. Create spin record in database
  await prisma.spin.create({
    data: {
      playerId,
      spinCount,
      speed,
      raveMode,
    },
  })

  // 2. Update Redis counters for real-time stats
  await incrementTotalSpins(spinCount)
  await incrementTodaySpins(spinCount)

  // 3. Update country stats if available
  if (countryCode) {
    await updateCountryStats(countryCode, spinCount)
  }

  // 4. Update leaderboard
  await updateLeaderboard(playerId, spinCount, countryCode)

  // 5. Update daily stats
  await updateDailyStats(spinCount)

  // 6. Create event for terminal display
  await createEvent('spin', playerId, countryCode, {
    spinCount,
    speed,
    raveMode,
  })
}

/**
 * Update country statistics
 */
async function updateCountryStats(countryCode: string, spinCount: number): Promise<void> {
  // Update in database
  await prisma.countryStats.upsert({
    where: { countryCode },
    create: {
      countryCode,
      countryName: countryCode, // TODO: Map code to name
      totalSpins: spinCount,
      uniquePlayers: 1,
    },
    update: {
      totalSpins: { increment: spinCount },
    },
  })

  // Update Redis cache
  await redis.incrby(REDIS_KEYS.COUNTRY_SPINS(countryCode), spinCount)
}

/**
 * Update player leaderboard ranking
 */
async function updateLeaderboard(
  playerId: string,
  spinCount: number,
  countryCode?: string
): Promise<void> {
  await prisma.leaderboardEntry.upsert({
    where: { playerId },
    create: {
      playerId,
      totalSpins: spinCount,
      rank: 0, // Will be recalculated
      countryCode,
    },
    update: {
      totalSpins: { increment: spinCount },
    },
  })
}

/**
 * Update daily statistics
 */
async function updateDailyStats(spinCount: number): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.dailyStats.upsert({
    where: { date: today },
    create: {
      date: today,
      totalSpins: spinCount,
      uniquePlayers: 1,
    },
    update: {
      totalSpins: { increment: spinCount },
    },
  })
}

/**
 * Create event for terminal display
 */
export async function createEvent(
  type: string,
  playerId: string | null,
  countryCode: string | null | undefined,
  data?: any
): Promise<void> {
  await prisma.event.create({
    data: {
      type,
      playerId,
      countryCode: countryCode || null,
      data: data || {},
    },
  })
}

/**
 * Get global statistics (cached)
 */
export async function getGlobalStats() {
  // Try to get from Redis first
  const cachedTotal = await redis.get(REDIS_KEYS.TOTAL_SPINS)
  const cachedToday = await redis.get(REDIS_KEYS.TODAY_SPINS)

  if (cachedTotal && cachedToday) {
    return {
      totalSpins: BigInt(cachedTotal),
      todaySpins: BigInt(cachedToday),
      totalPlayers: await getTotalPlayers(),
      onlinePlayers: await redis.scard(REDIS_KEYS.ONLINE_PLAYERS),
    }
  }

  // Fallback to database
  const stats = await prisma.globalStats.findUnique({ where: { id: 1 } })

  if (stats) {
    // Update Redis cache
    await redis.set(REDIS_KEYS.TOTAL_SPINS, stats.totalSpins.toString())
  }

  return {
    totalSpins: stats?.totalSpins || BigInt(0),
    todaySpins: BigInt(cachedToday || 0),
    totalPlayers: stats?.totalPlayers || 0,
    onlinePlayers: await redis.scard(REDIS_KEYS.ONLINE_PLAYERS),
  }
}

async function getTotalPlayers(): Promise<number> {
  return await prisma.player.count()
}
