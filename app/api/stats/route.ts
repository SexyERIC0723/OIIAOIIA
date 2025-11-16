import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getStat, setStat, CACHE_KEYS, connectRedis } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    await connectRedis()

    // Try to get from cache first
    let totalSpins = await getStat(CACHE_KEYS.TOTAL_SPINS)
    let todaySpins = await getStat(CACHE_KEYS.TODAY_SPINS)
    let onlinePlayers = await getStat(CACHE_KEYS.ONLINE_PLAYERS)

    // If not in cache, get from database
    if (!totalSpins || !todaySpins) {
      const globalStats = await prisma.globalStats.findUnique({
        where: { id: 1 },
      })

      if (globalStats) {
        totalSpins = globalStats.totalSpins.toString()
        todaySpins = globalStats.todaySpins.toString()

        // Cache for 30 seconds
        await setStat(CACHE_KEYS.TOTAL_SPINS, totalSpins, 30)
        await setStat(CACHE_KEYS.TODAY_SPINS, todaySpins, 30)
      } else {
        // Initialize if doesn't exist
        await prisma.globalStats.create({
          data: {
            id: 1,
            totalSpins: 0,
            todaySpins: 0,
            totalPlayers: 0,
            onlinePlayers: 0,
          },
        })
        totalSpins = '0'
        todaySpins = '0'
      }
    }

    // Get total players
    const totalPlayersCount = await prisma.player.count()

    // Get today's unique players
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayPlayers = await prisma.player.count({
      where: {
        lastSeenAt: {
          gte: today,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        totalSpins: parseInt(totalSpins || '0'),
        todaySpins: parseInt(todaySpins || '0'),
        totalPlayers: totalPlayersCount,
        todayPlayers: todayPlayers,
        onlinePlayers: parseInt(onlinePlayers || '0'),
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
