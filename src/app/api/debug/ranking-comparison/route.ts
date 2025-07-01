import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Temporarily remove auth for debugging
    // const session = await getServerSession(authOptions) as SessionWithUser | null
    
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    // }

    // Check all users and their predictions
    const allUsers = await prisma.user.findMany({
      where: { role: 'USER' },
      include: {
        predictions: {
          include: {
            match: {
              include: {
                player1: true,
                player2: true,
                winner: true
              }
            }
          }
        },
        tournamentBets: true
      }
    })

    // Check finished predictions for all users
    const allFinishedPredictions = await prisma.prediction.findMany({
      where: { 
        match: {
          status: 'FINISHED'
        }
      },
      include: {
        match: {
          include: {
            player1: true,
            player2: true,
            winner: true
          }
        },
        user: true
      },
      orderBy: {
        match: {
          finishedAt: 'desc'
        }
      }
    })

    return NextResponse.json({
      summary: {
        totalUsers: allUsers.length,
        usersWithPredictions: allUsers.filter(u => u.predictions.length > 0).length,
        usersWithPoints: allUsers.filter(u => u.points > 0).length,
        totalFinishedPredictions: allFinishedPredictions.length,
        finishedPredictionsWithPoints: allFinishedPredictions.filter(p => p.pointsEarned > 0).length
      },
      users: allUsers.map(user => ({
        email: user.email,
        name: user.name,
        storedPoints: user.points,
        predictionsCount: user.predictions.length,
        predictionsWithPoints: user.predictions.filter((p: { pointsEarned: number }) => p.pointsEarned > 0).length,
        totalPredictionPoints: user.predictions.reduce((sum: number, p: { pointsEarned?: number }) => sum + (p.pointsEarned || 0), 0)
      })),
      finishedPredictions: allFinishedPredictions.map(p => ({
        userEmail: p.user.email,
        userName: p.user.name,
        matchId: p.matchId,
        pointsEarned: p.pointsEarned,
        matchStatus: p.match.status,
        player1: p.match.player1.name,
        player2: p.match.player2.name,
        finishedAt: p.match.finishedAt
      }))
    })
  } catch (error) {
    console.error('Error in ranking comparison:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
