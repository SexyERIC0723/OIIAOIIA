import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerId, nickname, countryCode } = body

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    const player = await prisma.player.upsert({
      where: { id: playerId },
      update: {
        nickname: nickname || null,
        countryCode: countryCode || null,
        lastSeenAt: new Date(),
      },
      create: {
        id: playerId,
        nickname: nickname || null,
        countryCode: countryCode || null,
      },
    })

    return NextResponse.json({
      success: true,
      data: player,
    })
  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json(
      { error: 'Failed to update player' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('id')

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        spins: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Calculate total spins
    const totalSpins = await prisma.spin.aggregate({
      where: { playerId },
      _sum: { spinCount: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...player,
        totalSpins: totalSpins._sum.spinCount || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    )
  }
}
