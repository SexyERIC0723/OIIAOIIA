import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getStat, setStat, CACHE_KEYS, connectRedis } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    await connectRedis()

    // Try cache first
    const cached = await getStat(CACHE_KEYS.COUNTRY_STATS)

    if (cached) {
      return NextResponse.json({
        success: true,
        data: JSON.parse(cached),
        cached: true,
      })
    }

    // Get from database
    const countryStats = await prisma.countryStats.findMany({
      orderBy: {
        totalSpins: 'desc',
      },
    })

    const formattedStats = countryStats.map(stat => ({
      ...stat,
      totalSpins: Number(stat.totalSpins),
    }))

    // Cache for 120 seconds
    await setStat(CACHE_KEYS.COUNTRY_STATS, JSON.stringify(formattedStats), 120)

    return NextResponse.json({
      success: true,
      data: formattedStats,
      cached: false,
    })
  } catch (error) {
    console.error('Error fetching country stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch country stats' },
      { status: 500 }
    )
  }
}
