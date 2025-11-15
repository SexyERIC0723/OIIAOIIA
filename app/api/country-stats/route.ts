// GET /api/country-stats - Get statistics by country

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const countryStats = await prisma.countryStats.findMany({
      orderBy: { totalSpins: 'desc' },
      take: 50, // Top 50 countries
      select: {
        countryCode: true,
        countryName: true,
        totalSpins: true,
        uniquePlayers: true,
      },
    })

    const formatted = countryStats.map(stat => ({
      countryCode: stat.countryCode,
      countryName: stat.countryName,
      totalSpins: stat.totalSpins.toString(),
      uniquePlayers: stat.uniquePlayers,
    }))

    return NextResponse.json({
      countries: formatted,
      count: formatted.length,
    })
  } catch (error) {
    console.error('Error fetching country stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
