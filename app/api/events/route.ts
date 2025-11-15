// GET /api/events - Get recent events for terminal display

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')

    const where = type ? { type } : {}

    const events = await prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      select: {
        id: true,
        type: true,
        playerId: true,
        countryCode: true,
        data: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      events: events.reverse(), // Oldest first
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
