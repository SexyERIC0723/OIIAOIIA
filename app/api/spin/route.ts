import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { incrementStat, CACHE_KEYS, connectRedis } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerId, spinDelta, speedMultiplier } = body

    if (!playerId || typeof spinDelta !== 'number' || spinDelta <= 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Connect to Redis
    await connectRedis()

    // Ensure player exists
    const player = await prisma.player.upsert({
      where: { id: playerId },
      update: { lastSeenAt: new Date() },
      create: {
        id: playerId,
        lastSeenAt: new Date(),
      },
    })

    // Record the spin
    await prisma.spin.create({
      data: {
        playerId,
        spinCount: spinDelta,
        speedMultiplier: speedMultiplier || 1.0,
      },
    })

    // Update Redis cache
    await incrementStat(CACHE_KEYS.TOTAL_SPINS, spinDelta)
    await incrementStat(CACHE_KEYS.TODAY_SPINS, spinDelta)

    // Update global stats in database (async, don't wait)
    updateGlobalStats(spinDelta).catch(console.error)

    // Update leaderboard (async, don't wait)
    updateLeaderboard(playerId, spinDelta).catch(console.error)

    // Get current totals
    const totalSpins = await incrementStat(CACHE_KEYS.TOTAL_SPINS, 0) // Get without incrementing
    const todaySpins = await incrementStat(CACHE_KEYS.TODAY_SPINS, 0)

    return NextResponse.json({
      success: true,
      data: {
        totalSpins: parseInt(totalSpins.toString()),
        todaySpins: parseInt(todaySpins.toString()),
        sessionSpins: spinDelta,
      },
    })
  } catch (error) {
    console.error('Error recording spin:', error)
    return NextResponse.json(
      { error: 'Failed to record spin' },
      { status: 500 }
    )
  }
}

async function updateGlobalStats(spinDelta: number) {
  const today = new Date().toISOString().split('T')[0]

  // Update or create daily stats
  await prisma.dailyStats.upsert({
    where: { date: new Date(today) },
    update: {
      totalSpins: { increment: spinDelta },
    },
    create: {
      date: new Date(today),
      totalSpins: spinDelta,
      uniquePlayers: 1,
    },
  })

  // Update global stats
  await prisma.globalStats.upsert({
    where: { id: 1 },
    update: {
      totalSpins: { increment: spinDelta },
      todaySpins: { increment: spinDelta },
    },
    create: {
      id: 1,
      totalSpins: spinDelta,
      todaySpins: spinDelta,
      totalPlayers: 1,
      onlinePlayers: 0,
      lastResetDate: new Date(today),
    },
  })
}

async function updateLeaderboard(playerId: string, spinDelta: number) {
  await prisma.leaderboardEntry.upsert({
    where: { playerId },
    update: {
      totalSpins: { increment: spinDelta },
    },
    create: {
      playerId,
      totalSpins: spinDelta,
    },
  })
}
