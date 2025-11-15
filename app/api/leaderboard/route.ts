// GET /api/leaderboard - Get top players

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const countryCode = searchParams.get('country')

    // Build query
    const where = countryCode ? { countryCode } : {}

    const leaderboard = await prisma.leaderboardEntry.findMany({
      where,
      orderBy: { totalSpins: 'desc' },
      take: Math.min(limit, 100), // Max 100 entries
      select: {
        playerId: true,
        totalSpins: true,
        countryCode: true,
        lastSpin: true,
      },
    })

    // Format response with ranks
    const formatted = leaderboard.map((entry, index) => ({
      rank: index + 1,
      playerId: entry.playerId,
      totalSpins: entry.totalSpins.toString(),
      countryCode: entry.countryCode,
      lastSpin: entry.lastSpin.toISOString(),
    }))

    return NextResponse.json({
      leaderboard: formatted,
      count: formatted.length,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
