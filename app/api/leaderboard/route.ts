import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getStat, setStat, CACHE_KEYS, connectRedis } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    await connectRedis()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    // Try cache first
    const cached = await getStat(CACHE_KEYS.LEADERBOARD)

    if (cached) {
      return NextResponse.json({
        success: true,
        data: JSON.parse(cached),
        cached: true,
      })
    }

    // Get from database
    const leaderboard = await prisma.leaderboardEntry.findMany({
      take: limit,
      orderBy: {
        totalSpins: 'desc',
      },
      include: {
        _count: false,
      },
    })

    // Assign ranks
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      totalSpins: Number(entry.totalSpins),
    }))

    // Cache for 60 seconds
    await setStat(CACHE_KEYS.LEADERBOARD, JSON.stringify(rankedLeaderboard), 60)

    return NextResponse.json({
      success: true,
      data: rankedLeaderboard,
      cached: false,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
