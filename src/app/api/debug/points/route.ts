import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Type for the session with user data
type SessionWithUser = {
  user: {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: string
  }
  expires: string
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    // Get diagnostic info about the points system
    const diagnostics = {
      timestamp: new Date().toISOString(),
      
      // Count total users
      totalUsers: await prisma.user.count({
        where: { role: 'USER' }
      }),
      
      // Count total matches
      totalMatches: await prisma.match.count(),
      
      // Count finished matches
      finishedMatches: await prisma.match.count({
        where: { status: 'FINISHED' }
      }),
      
      // Count total predictions
      totalPredictions: await prisma.prediction.count(),
      
      // Count predictions with points > 0
      predictionsWithPoints: await prisma.prediction.count({
        where: { pointsEarned: { gt: 0 } }
      }),
      
      // Get sample finished matches
      sampleFinishedMatches: await prisma.match.findMany({
        where: { status: 'FINISHED' },
        include: {
          player1: { select: { name: true } },
          player2: { select: { name: true } },
          predictions: {
            select: {
              id: true,
              winner: true,
              pointsEarned: true,
              user: { select: { name: true, email: true } }
            }
          }
        },
        take: 3
      }),
      
      // Get sample users with their total points
      sampleUsers: await prisma.user.findMany({
        where: { role: 'USER' },
        select: {
          id: true,
          name: true,
          email: true,
          points: true,
          _count: {
            select: {
              predictions: true
            }
          }
        },
        take: 5,
        orderBy: { points: 'desc' }
      }),
      
      // Check if any predictions have pointsEarned > 0
      samplePredictionsWithPoints: await prisma.prediction.findMany({
        where: { pointsEarned: { gt: 0 } },
        include: {
          user: { select: { name: true, email: true } },
          match: {
            select: {
              status: true,
              player1: { select: { name: true } },
              player2: { select: { name: true } }
            }
          }
        },
        take: 5
      })
    }

    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error('Error in debug points:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}