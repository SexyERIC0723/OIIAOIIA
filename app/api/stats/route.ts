// GET /api/stats - Get global statistics

import { NextResponse } from 'next/server'
import { getGlobalStats } from '@/lib/analytics'
import { redis, REDIS_KEYS } from '@/lib/redis'

export async function GET() {
  try {
    const stats = await getGlobalStats()

    // Calculate spins per minute (from Redis)
    const spinsPerMin = await redis.get(REDIS_KEYS.SPINS_PER_MIN) || '0'

    return NextResponse.json({
      totalSpins: stats.totalSpins.toString(), // BigInt to string for JSON
      todaySpins: stats.todaySpins.toString(),
      totalPlayers: stats.totalPlayers,
      onlinePlayers: stats.onlinePlayers,
      spinsPerMin: parseInt(spinsPerMin),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
