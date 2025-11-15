import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const messages = await prisma.chatMessage.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
    })
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerId, nickname, message, countryCode } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      )
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long (max 500 characters)' },
        { status: 400 }
      )
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        playerId: playerId || null,
        nickname: nickname || 'Anonymous',
        message: message.trim(),
        countryCode: countryCode || null,
      },
    })

    return NextResponse.json({
      success: true,
      data: chatMessage,
    })
  } catch (error) {
    console.error('Error posting chat message:', error)
    return NextResponse.json(
      { error: 'Failed to post message' },
      { status: 500 }
    )
  }
}
