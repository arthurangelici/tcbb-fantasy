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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        usersWithPredictions: allUsers.filter((u: any) => u.predictions.length > 0).length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        usersWithPoints: allUsers.filter((u: any) => u.points > 0).length,
        totalFinishedPredictions: allFinishedPredictions.length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        finishedPredictionsWithPoints: allFinishedPredictions.filter((p: any) => p.pointsEarned > 0).length
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      users: allUsers.map((user: any) => ({
        email: user.email,
        name: user.name,
        storedPoints: user.points,
        predictionsCount: user.predictions.length,
        predictionsWithPoints: user.predictions.filter((p: { pointsEarned: number }) => p.pointsEarned > 0).length,
        totalPredictionPoints: user.predictions.reduce((sum: number, p: { pointsEarned?: number }) => sum + (p.pointsEarned || 0), 0)
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      finishedPredictions: allFinishedPredictions.map((p: any) => ({
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
