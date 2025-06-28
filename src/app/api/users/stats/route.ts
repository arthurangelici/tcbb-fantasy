import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
      where: { email: session.user.email },
      include: {
        predictions: {
          include: {
            match: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate user statistics
    const totalPredictions = user.predictions.length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const correctPredictions = user.predictions.filter((p: any) => p.pointsEarned > 0).length
    const successRate = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0
    
    // Calculate streak (consecutive correct predictions)
    let streak = 0
    const sortedPredictions = user.predictions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((p: any) => p.match.status === 'FINISHED')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    
    for (const prediction of sortedPredictions) {
      if (prediction.pointsEarned > 0) {
        streak++
      } else {
        break
      }
    }

    // Get user ranking position
    const allUsers = await prisma.user.findMany({
      where: { role: 'USER' },
      orderBy: { points: 'desc' }
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const position = allUsers.findIndex((u: any) => u.id === user.id) + 1

    // Get recent matches with user predictions
    const recentMatches = await prisma.match.findMany({
      where: {
        status: 'FINISHED',
        predictions: {
          some: {
            userId: user.id
          }
        }
      },
      include: {
        player1: true,
        player2: true,
        predictions: {
          where: { userId: user.id }
        }
      },
      orderBy: { finishedAt: 'desc' },
      take: 3
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedRecentMatches = recentMatches.map((match: any) => {
      const prediction = match.predictions[0]
      const predictedWinner = prediction?.winner === 'player1' ? match.player1.name : match.player2.name
      
      return {
        id: match.id,
        player1: match.player1.name,
        player2: match.player2.name,
        result: `${match.player1Sets}-${match.player2Sets}`,
        userPrediction: predictedWinner || 'Sem palpite',
        points: prediction?.pointsEarned || 0,
        correct: prediction?.pointsEarned > 0
      }
    })

    // Count upcoming matches that can be predicted
    const upcomingMatches = await prisma.match.count({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date()
        }
      }
    })

    const stats = {
      totalPoints: user.points,
      position,
      correctPredictions,
      totalPredictions,
      successRate: Number(successRate.toFixed(1)),
      streak,
      upcomingMatches,
      recentMatches: formattedRecentMatches
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}