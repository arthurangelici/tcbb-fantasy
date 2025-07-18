import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
// import type { Prisma } from '@prisma/client'

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

    return NextResponse.json(formattedHistory)
  } catch (error) {
    console.error('Error fetching prediction history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}