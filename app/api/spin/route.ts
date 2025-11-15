// POST /api/spin - Record a spin event

import { NextRequest, NextResponse } from 'next/server'
import { recordSpin } from '@/lib/analytics'
import { checkRateLimit, REDIS_KEYS, addOnlinePlayer } from '@/lib/redis'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { playerId, spinCount, speed = 1.0, raveMode = false } = body

    // Validation
    if (!playerId || typeof spinCount !== 'number' || spinCount < 1) {
      return NextResponse.json(
        { error: 'Invalid request: playerId and spinCount are required' },
        { status: 400 }
      )
    }

    // Rate limiting
    const rateLimitKey = REDIS_KEYS.RATE_LIMIT_SPIN(playerId)
    const limit = parseInt(process.env.RATE_LIMIT_SPIN_PER_MINUTE || '100')
    const withinLimit = await checkRateLimit(rateLimitKey, limit)

    if (!withinLimit) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down!' },
        { status: 429 }
      )
    }

    // Get or create player
    let player = await prisma.player.findUnique({ where: { id: playerId } })

    if (!player) {
      // Get IP and country for new player
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                 req.headers.get('x-real-ip') ||
                 'unknown'

      // For demo, we'll set a placeholder country
      // In production, use getCountryFromIP(ip)
      const countryCode = 'US' // Placeholder

      player = await prisma.player.create({
        data: {
          id: playerId,
          countryCode,
          countryName: 'United States', // Placeholder
        },
      })
    }

    // Mark player as online
    await addOnlinePlayer(playerId)

    // Record the spin event with analytics
    await recordSpin(
      {
        playerId,
        spinCount,
        speed,
        raveMode,
      },
      player.countryCode || undefined
    )

    return NextResponse.json({
      success: true,
      message: `Recorded ${spinCount} spin(s)`,
      playerId,
    })
  } catch (error) {
    console.error('Error recording spin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
