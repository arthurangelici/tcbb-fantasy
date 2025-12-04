import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { TournamentBetType } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // Don't cache this route

// Tournament bet types that are shown in dashboard recent results
const DASHBOARD_TOURNAMENT_BET_TYPES: TournamentBetType[] = [TournamentBetType.CHAMPION, TournamentBetType.RUNNER_UP]

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
            match: {
              include: {
                player1: true,
                player2: true,
                winner: true
              }
            }
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
    
    // Calculate winner success rate (predictions where winner was correct)
    let correctWinnerPredictions = 0
    let correctExactScorePredictions = 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finishedPredictions = user.predictions.filter((p: any) => p.match.status === 'FINISHED')
    
    for (const prediction of finishedPredictions) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((prediction as any).match.winner && prediction.winner) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const actualWinnerKey = (prediction as any).match.winner.id === (prediction as any).match.player1.id ? 'player1' : 'player2'
        if (prediction.winner === actualWinnerKey) {
          correctWinnerPredictions++
        }
      }
      
      // Check if exact score prediction was correct
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (prediction.setScores && (prediction as any).match.setScores && Array.isArray(prediction.setScores) && Array.isArray((prediction as any).match.setScores)) {
        let perfectMatch = true
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const minLength = Math.min(prediction.setScores.length, (prediction as any).match.setScores.length)
        
        for (let i = 0; i < minLength; i++) {
          const predSet = prediction.setScores[i] as { p1: number; p2: number; tiebreak?: string }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const actualSet = (prediction as any).match.setScores[i] as { p1: number; p2: number; tiebreak?: string }
          
          if (predSet.p1 !== actualSet.p1 || predSet.p2 !== actualSet.p2) {
            perfectMatch = false
            break
          }
          
          // Check tiebreak prediction
          if (predSet.tiebreak && actualSet.tiebreak) {
            if (predSet.tiebreak !== actualSet.tiebreak) {
              perfectMatch = false
              break
            }
          } else if (predSet.tiebreak || actualSet.tiebreak) {
            perfectMatch = false
            break
          }
        }
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (perfectMatch && prediction.setScores.length === (prediction as any).match.setScores.length) {
          correctExactScorePredictions++
        }
      }
    }
    
    const winnerSuccessRate = finishedPredictions.length > 0 ? (correctWinnerPredictions / finishedPredictions.length) * 100 : 0
    const exactScoreSuccessRate = finishedPredictions.length > 0 ? (correctExactScorePredictions / finishedPredictions.length) * 100 : 0
    const overallSuccessRate = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0
    
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

    // Get recent matches with user predictions (both finished and unfinished)
    const recentMatches = await prisma.match.findMany({
      where: {
        predictions: {
          some: {
            userId: user.id
          }
        }
      },
      include: {
        player1: true,
        player2: true,
        winner: true,
        predictions: {
          where: { userId: user.id }
        }
      },
      orderBy: { scheduledAt: 'desc' },
      take: 3
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedRecentMatches = recentMatches.map((match: any) => {
      const prediction = match.predictions[0]
      const predictedWinner = prediction?.winner === 'player1' ? match.player1.name : match.player2.name
      const isFinished = match.status === 'FINISHED'
      
      // Parse setScores to get the match result
      let result = 'N/A'
      if (isFinished && match.setScores && Array.isArray(match.setScores)) {
        let player1Sets = 0
        let player2Sets = 0
        
        // Count sets won by each player
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        match.setScores.forEach((set: any) => {
          if (set.p1 > set.p2) {
            player1Sets++
          } else if (set.p2 > set.p1) {
            player2Sets++
          }
        })
        
        result = `${player1Sets}-${player2Sets}`
      } else if (!isFinished) {
        result = 'Aguardando jogo'
      }
      
      return {
        id: match.id,
        player1: match.player1.name,
        player2: match.player2.name,
        result,
        userPrediction: predictedWinner || 'Sem palpite',
        points: prediction?.pointsEarned || 0,
        correct: isFinished ? prediction?.pointsEarned > 0 : null, // null for unfinished matches
        isFinished: isFinished,
        isTournamentBet: false
      }
    })

    // Get tournament bets (champion/vice-champion) with points earned
    const tournamentBets = await prisma.tournamentBet.findMany({
      where: {
        userId: user.id,
        type: { in: DASHBOARD_TOURNAMENT_BET_TYPES },
        pointsEarned: { gt: 0 }
      },
      include: {
        player: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedTournamentBets = tournamentBets.map((bet: any) => {
      const betTypeLabels: Record<string, string> = {
        CHAMPION: 'Campeão',
        RUNNER_UP: 'Vice-Campeão'
      }
      
      return {
        id: bet.id,
        player1: bet.player?.name || 'Jogador',
        player2: betTypeLabels[bet.type] || bet.type,
        result: bet.pointsEarned > 0 ? 'Acertou!' : 'Aguardando',
        userPrediction: bet.player?.name || 'Sem palpite',
        points: bet.pointsEarned,
        correct: bet.pointsEarned > 0,
        isFinished: bet.pointsEarned > 0,
        isTournamentBet: true,
        betType: bet.type,
        category: bet.category
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
      correctWinnerPredictions,
      correctExactScorePredictions,
      totalPredictions,
      successRate: Number(overallSuccessRate.toFixed(1)),
      winnerSuccessRate: Number(winnerSuccessRate.toFixed(1)),
      exactScoreSuccessRate: Number(exactScoreSuccessRate.toFixed(1)),
      streak,
      upcomingMatches,
      recentMatches: formattedRecentMatches,
      tournamentBets: formattedTournamentBets
    }

    const response = NextResponse.json({
      ...stats,
      timestamp: new Date().toISOString() // Add timestamp for cache busting
    })
    
    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    
    return response
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}