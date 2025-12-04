import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { TournamentBetType } from '@prisma/client'
// import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

// Tournament bet types to include in history
const HISTORY_TOURNAMENT_BET_TYPES: TournamentBetType[] = [TournamentBetType.CHAMPION, TournamentBetType.RUNNER_UP]

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

// Type for prediction with included match data
// type PredictionWithMatch = Prisma.PredictionGetPayload<{
//   include: {
//     match: {
//       include: {
//         player1: true
//         player2: true
//         winner: true
//       }
//     }
//   }
// }>

// Use any for now
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PredictionWithMatch = any

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's prediction history with match details (both finished and unfinished)
    const predictions = await prisma.prediction.findMany({
      where: { 
        userId: user.id
      },
      include: {
        match: {
          include: {
            player1: true,
            player2: true,
            winner: true
          }
        }
      },
      orderBy: {
        match: {
          scheduledAt: 'desc'
        }
      }
    })

    // Format the data for the frontend
    const formattedHistory = predictions.map((prediction: PredictionWithMatch) => {
      const match = prediction.match
      const isFinished = match.status === 'FINISHED'
      
      // Determine the predicted winner name
      let predictedWinner = 'N/A'
      if (prediction.winner === 'player1') {
        predictedWinner = match.player1.name
      } else if (prediction.winner === 'player2') {
        predictedWinner = match.player2.name
      }

      // Determine the actual winner name
      let actualWinner = 'N/A'
      if (isFinished && match.winner) {
        actualWinner = match.winner.name
      } else if (!isFinished) {
        actualWinner = 'Aguardando jogo'
      }

      // Calculate breakdown of what was correct
      let winnerCorrect = false
      let exactScoreCorrect = false
      
      if (isFinished && match.winner) {
        // Check if winner prediction was correct
        const actualWinnerKey = match.winner.id === match.player1.id ? 'player1' : 'player2'
        winnerCorrect = prediction.winner === actualWinnerKey
        
        // Check if exact score prediction was correct
        if (prediction.setScores && match.setScores && Array.isArray(prediction.setScores) && Array.isArray(match.setScores)) {
          let perfectMatch = true
          const minLength = Math.min(prediction.setScores.length, match.setScores.length)
          
          for (let i = 0; i < minLength; i++) {
            const predSet = prediction.setScores[i] as { p1: number; p2: number; tiebreak?: string }
            const actualSet = match.setScores[i] as { p1: number; p2: number; tiebreak?: string }
            
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
          
          exactScoreCorrect = perfectMatch && prediction.setScores.length === match.setScores.length
        }
      }

      // Determine prediction type and details
      let predictionDetails = predictedWinner
      let predictionType = 'Winner'
      
      if (prediction.setScores && Array.isArray(prediction.setScores) && prediction.setScores.length > 0) {
        // Format set scores for display
        const setScoreArray = prediction.setScores as { p1: number; p2: number; tiebreak?: string }[]
        const formattedScores = setScoreArray.map(set => {
          let scoreStr = `${set.p1}-${set.p2}`
          if (set.tiebreak) {
            scoreStr += ` (${set.tiebreak})`
          }
          return scoreStr
        }).join(', ')
        predictionDetails = `${predictedWinner} • ${formattedScores}`
        predictionType = 'Winner + Exact Score'
      }

      // Format the actual match result
      let matchResult = actualWinner
      if (isFinished && match.setScores && Array.isArray(match.setScores)) {
        const setScoreArray = match.setScores as { p1: number; p2: number; tiebreak?: string }[]
        const formattedScores = setScoreArray.map(set => {
          let scoreStr = `${set.p1}-${set.p2}`
          if (set.tiebreak) {
            scoreStr += ` (${set.tiebreak})`
          }
          return scoreStr
        }).join(', ')
        matchResult = `${actualWinner} • ${formattedScores}`
      }

      return {
        id: prediction.id,
        matchId: match.id,
        player1: match.player1.name,
        player2: match.player2.name,
        date: match.finishedAt?.toISOString().split('T')[0] || match.scheduledAt?.toISOString().split('T')[0] || 'N/A',
        prediction: predictionDetails,
        result: matchResult,
        points: prediction.pointsEarned,
        correct: isFinished ? prediction.pointsEarned > 0 : null, // null for unfinished matches
        winnerCorrect: isFinished ? winnerCorrect : null,
        exactScoreCorrect: isFinished ? exactScoreCorrect : null,
        type: predictionType,
        category: match.category,
        isFinished: isFinished
      }
    })

    // Get categories that have a finished FINAL match
    // This is used to determine if tournament bet points should be shown as finished
    const finishedFinalMatches = await prisma.match.findMany({
      where: {
        round: 'FINAL',
        status: 'FINISHED',
        winnerId: { not: null }
      },
      select: { category: true }
    })
    const categoriesWithFinishedFinals = new Set<string>(finishedFinalMatches.map(m => m.category))

    // Get tournament bets (champion/vice-champion) for the user
    const tournamentBets = await prisma.tournamentBet.findMany({
      where: {
        userId: user.id,
        type: { in: HISTORY_TOURNAMENT_BET_TYPES }
      },
      include: {
        player: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Format tournament bets for the frontend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedTournamentBets = tournamentBets.map((bet: any) => {
      const betTypeLabels: Record<string, string> = {
        CHAMPION: 'Campeão',
        RUNNER_UP: 'Vice-Campeão'
      }
      
      // Only consider the bet as finished if the FINAL match for that category has been finished
      const categoryHasFinishedFinal = bet.category && categoriesWithFinishedFinals.has(bet.category)
      // Points should only be considered if the FINAL is finished
      const validPoints = categoryHasFinishedFinal ? bet.pointsEarned : 0
      // Bet is correct if it earned points and the FINAL is finished
      const isCorrect = validPoints > 0
      
      return {
        id: bet.id,
        matchId: null,
        player1: bet.player?.name || 'Jogador',
        player2: betTypeLabels[bet.type] || bet.type,
        date: bet.updatedAt?.toISOString().split('T')[0] || 'N/A',
        prediction: bet.player?.name || 'Sem palpite',
        result: isCorrect ? 'Acertou!' : (categoryHasFinishedFinal ? 'Não acertou' : 'Aguardando resultado'),
        points: validPoints,
        correct: categoryHasFinishedFinal ? isCorrect : null,
        winnerCorrect: null,
        exactScoreCorrect: null,
        type: betTypeLabels[bet.type] || bet.type,
        category: bet.category || 'N/A',
        isFinished: categoryHasFinishedFinal,
        isTournamentBet: true,
        betType: bet.type
      }
    })

    // Combine both predictions and tournament bets
    const allHistory = [...formattedHistory, ...formattedTournamentBets]

    return NextResponse.json(allHistory)
  } catch (error) {
    console.error('Error fetching prediction history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}