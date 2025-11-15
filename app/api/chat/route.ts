// GET /api/chat - Get recent chat messages
// POST /api/chat - Send a chat message

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { checkRateLimit, REDIS_KEYS } from '@/lib/redis'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
      select: {
        id: true,
        nickname: true,
        message: true,
        countryCode: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      messages: messages.reverse(), // Oldest first
    })
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { playerId, nickname = 'Anonymous', message } = body

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long (max 500 characters)' },
        { status: 400 }
      )
    }

    // Rate limiting
    const rateLimitKey = REDIS_KEYS.RATE_LIMIT_CHAT(playerId || 'anonymous')
    const limit = parseInt(process.env.RATE_LIMIT_CHAT_PER_MINUTE || '5')
    const withinLimit = await checkRateLimit(rateLimitKey, limit)

    if (!withinLimit) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending another message.' },
        { status: 429 }
      )
    }

    // Get player country if available
    let countryCode: string | null = null
    if (playerId) {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        select: { countryCode: true },
      })
      countryCode = player?.countryCode || null
    }

    // Create message
    const chatMessage = await prisma.chatMessage.create({
      data: {
        playerId: playerId || null,
        nickname: nickname.substring(0, 50), // Limit nickname length
        message: message.trim().substring(0, 500),
        countryCode,
      },
    })

    return NextResponse.json({
      success: true,
      message: chatMessage,
    })
  } catch (error) {
    console.error('Error posting chat message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
