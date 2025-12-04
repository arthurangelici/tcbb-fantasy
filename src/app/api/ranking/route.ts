import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic' // Force dynamic rendering
export const revalidate = 0 // Don't cache this route

// Get ranking by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'general'
    
    // Get categories that have a finished FINAL match
    // This is used to determine which tournament bet points (CHAMPION/RUNNER_UP) should be included
    const finishedFinalMatches = await prisma.match.findMany({
      where: {
        round: 'FINAL',
        status: 'FINISHED',
        winnerId: { not: null }
      },
      select: { category: true }
    })
    const categoriesWithFinishedFinals = new Set<string>(finishedFinalMatches.map(m => m.category))
    
    // Get all users with their predictions
    const users = await prisma.user.findMany({
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

    // Calculate points and statistics by category
    const rankingData = users.map((user: { 
      id: string; 
      name: string | null; 
      email: string; 
      category?: string | null;
      predictions: { 
        pointsEarned?: number; 
        winner?: string | null;
        setScores?: unknown; // JSON field from database
        match: { 
          category: string; 
          status: string; 
          player1: { id: string };
          player2: { id: string };
          winner?: { id: string } | null;
          setScores?: unknown; // JSON field from database
        }; 
        updatedAt: Date;
      }[]; 
      tournamentBets: { 
        pointsEarned?: number; 
        category?: string | null;
        type?: string;
      }[]
    }) => {
      // Calculate total points from predictions and tournament bets
      // For CHAMPION and RUNNER_UP bets, only include points if the FINAL match for that category is finished
      const predictionPoints = user.predictions.reduce((sum: number, p: { pointsEarned?: number }) => sum + (p.pointsEarned || 0), 0);
      const tournamentBetPoints = user.tournamentBets.reduce((sum: number, b: { pointsEarned?: number; category?: string | null; type?: string }) => {
        const points = b.pointsEarned || 0;
        // For CHAMPION and RUNNER_UP bets, only count points if the FINAL match for that category is finished
        if (b.type === 'CHAMPION' || b.type === 'RUNNER_UP') {
          if (b.category && categoriesWithFinishedFinals.has(b.category)) {
            return sum + points;
          }
          return sum; // Don't include points if FINAL is not finished
        }
        return sum + points; // Include other bet types normally
      }, 0);
      const calculatedTotalPoints = predictionPoints + tournamentBetPoints;

      const pointsByCategory = {
        // Always use calculated points to ensure consistency
        general: calculatedTotalPoints,
        A: 0,
        B: 0,
        C: 0,
        ATP: 0,
        RANKING_TCBB: 0
      }

      const predictionsByCategory = {
        general: { correct: 0, total: 0, winnerCorrect: 0, exactScoreCorrect: 0 },
        A: { correct: 0, total: 0, winnerCorrect: 0, exactScoreCorrect: 0 },
        B: { correct: 0, total: 0, winnerCorrect: 0, exactScoreCorrect: 0 },
        C: { correct: 0, total: 0, winnerCorrect: 0, exactScoreCorrect: 0 },
        ATP: { correct: 0, total: 0, winnerCorrect: 0, exactScoreCorrect: 0 },
        RANKING_TCBB: { correct: 0, total: 0, winnerCorrect: 0, exactScoreCorrect: 0 }
      }

      // Calculate predictions statistics and category-specific points
      user.predictions.forEach((prediction) => {
        const matchCategory = prediction.match.category
        const points = prediction.pointsEarned || 0; // Ensure points is a number
        const isFinished = prediction.match.status === 'FINISHED'

        // Add to general stats (but don't add to general points - use stored user.points)
        predictionsByCategory.general.total++
        if (points > 0) {
          predictionsByCategory.general.correct++
        }
        
        // Check if winner prediction was correct for finished matches
        if (isFinished && prediction.match.winner && prediction.winner) {
          const actualWinnerKey = prediction.match.winner.id === prediction.match.player1.id ? 'player1' : 'player2'
          if (prediction.winner === actualWinnerKey) {
            predictionsByCategory.general.winnerCorrect++
          }
        }
        
        // Check if exact score prediction was correct for finished matches
        if (isFinished && prediction.setScores && prediction.match.setScores && Array.isArray(prediction.setScores) && Array.isArray(prediction.match.setScores)) {
          let perfectMatch = true
          const minLength = Math.min(prediction.setScores.length, prediction.match.setScores.length)
          
          for (let i = 0; i < minLength; i++) {
            const predSet = prediction.setScores[i] as { p1: number; p2: number; tiebreak?: string }
            const actualSet = prediction.match.setScores[i] as { p1: number; p2: number; tiebreak?: string }
            
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
          
          if (perfectMatch && prediction.setScores.length === prediction.match.setScores.length) {
            predictionsByCategory.general.exactScoreCorrect++
          }
        }
        
        // Add to category-specific stats and points
        if (matchCategory === 'A' || matchCategory === 'B' || matchCategory === 'C' || matchCategory === 'ATP' || matchCategory === 'RANKING_TCBB') {
          (pointsByCategory as Record<string, number>)[matchCategory] += points;
          (predictionsByCategory as Record<string, { correct: number; total: number; winnerCorrect: number; exactScoreCorrect: number }>)[matchCategory].total++
          if (points > 0) {
            (predictionsByCategory as Record<string, { correct: number; total: number; winnerCorrect: number; exactScoreCorrect: number }>)[matchCategory].correct++
          }
          
          // Check winner prediction for this category
          if (isFinished && prediction.match.winner && prediction.winner) {
            const actualWinnerKey = prediction.match.winner.id === prediction.match.player1.id ? 'player1' : 'player2'
            if (prediction.winner === actualWinnerKey) {
              (predictionsByCategory as Record<string, { correct: number; total: number; winnerCorrect: number; exactScoreCorrect: number }>)[matchCategory].winnerCorrect++
            }
          }
          
          // Check exact score prediction for this category
          if (isFinished && prediction.setScores && prediction.match.setScores && Array.isArray(prediction.setScores) && Array.isArray(prediction.match.setScores)) {
            let perfectMatch = true
            const minLength = Math.min(prediction.setScores.length, prediction.match.setScores.length)
            
            for (let i = 0; i < minLength; i++) {
              const predSet = prediction.setScores[i] as { p1: number; p2: number; tiebreak?: string }
              const actualSet = prediction.match.setScores[i] as { p1: number; p2: number; tiebreak?: string }
              
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
            
            if (perfectMatch && prediction.setScores.length === prediction.match.setScores.length) {
              (predictionsByCategory as Record<string, { correct: number; total: number; winnerCorrect: number; exactScoreCorrect: number }>)[matchCategory].exactScoreCorrect++
            }
          }
        }
      })

      // Add tournament bet points by category
      // For CHAMPION and RUNNER_UP bets, only include points if the FINAL match for that category is finished
      user.tournamentBets.forEach((bet) => {
        const points = bet.pointsEarned || 0; // Ensure points is a number

        if (bet.category && (bet.category === 'A' || bet.category === 'B' || bet.category === 'C' || bet.category === 'ATP' || bet.category === 'RANKING_TCBB')) {
          // For CHAMPION and RUNNER_UP bets, only count points if the FINAL match for that category is finished
          if (bet.type === 'CHAMPION' || bet.type === 'RUNNER_UP') {
            if (categoriesWithFinishedFinals.has(bet.category)) {
              (pointsByCategory as Record<string, number>)[bet.category] += points;
            }
            // Don't add points if FINAL is not finished
          } else {
            // Include other bet types normally
            (pointsByCategory as Record<string, number>)[bet.category] += points;
          }
        }
      })

      // Calculate streak
      const sortedPredictions = user.predictions
        .filter((p) => p.match.status === 'FINISHED')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      
      let streak = 0
      for (const prediction of sortedPredictions) {
        if ((prediction.pointsEarned || 0) > 0) {
          streak++
        } else {
          break
        }
      }

      return {
        id: user.id,
        name: user.name || 'Usuário',
        email: user.email,
        category: user.category || 'A',
        pointsByCategory,
        predictionsByCategory,
        streak
      }
    })

    // Sort by the selected category
    type RankingItem = {
      id: string;
      name: string;
      email: string;
      category: string;
      pointsByCategory: Record<string, number>;
      predictionsByCategory: Record<string, { correct: number; total: number; winnerCorrect: number; exactScoreCorrect: number }>;
      streak: number;
    };
    
    const sortedRanking = rankingData.sort((a: RankingItem, b: RankingItem) => {
      const pointsA = category === 'general' ? a.pointsByCategory.general : a.pointsByCategory[category as 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB'] || 0
      const pointsB = category === 'general' ? b.pointsByCategory.general : b.pointsByCategory[category as 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB'] || 0
      return pointsB - pointsA
    })

    // Add position and trend information
    const finalRanking = sortedRanking.map((player: RankingItem, index: number) => ({
      ...player,
      position: index + 1,
      previousPosition: index + 1, // Simplified for now
      trend: 'stable' as const
    }))

    // Calculate stats
    const totalPlayers = finalRanking.length
    const categoryKey = category === 'general' ? 'general' : category as 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB'
    const averagePoints = totalPlayers > 0 ? Math.round(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      finalRanking.reduce((acc: number, p: any) => acc + (p.pointsByCategory[categoryKey] || 0), 0) / totalPlayers
    ) : 0
    
    const averageWinnerSuccessRate = totalPlayers > 0 ? Number((
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      finalRanking.reduce((acc: number, p: any) => {
        const predictions = p.predictionsByCategory[categoryKey] || { correct: 0, total: 0, winnerCorrect: 0, exactScoreCorrect: 0 }
        const finishedPredictions = predictions.total // Approximation - we don't track finished vs total separately by category
        const rate = finishedPredictions > 0 ? (predictions.winnerCorrect / finishedPredictions) * 100 : 0
        return acc + rate
      }, 0) / totalPlayers
    ).toFixed(1)) : 0
    
    const averageExactScoreSuccessRate = totalPlayers > 0 ? Number((
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      finalRanking.reduce((acc: number, p: any) => {
        const predictions = p.predictionsByCategory[categoryKey] || { correct: 0, total: 0, winnerCorrect: 0, exactScoreCorrect: 0 }
        const finishedPredictions = predictions.total // Approximation - we don't track finished vs total separately by category
        const rate = finishedPredictions > 0 ? (predictions.exactScoreCorrect / finishedPredictions) * 100 : 0
        return acc + rate
      }, 0) / totalPlayers
    ).toFixed(1)) : 0
    
    const averageOverallSuccessRate = totalPlayers > 0 ? Number((
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      finalRanking.reduce((acc: number, p: any) => {
        const predictions = p.predictionsByCategory[categoryKey] || { correct: 0, total: 0, winnerCorrect: 0, exactScoreCorrect: 0 }
        const rate = predictions.total > 0 ? (predictions.correct / predictions.total) * 100 : 0
        return acc + rate
      }, 0) / totalPlayers
    ).toFixed(1)) : 0

    const stats = {
      totalPlayers,
      averagePoints,
      averageSuccessRate: averageOverallSuccessRate,
      averageWinnerSuccessRate: averageWinnerSuccessRate,
      averageExactScoreSuccessRate: averageExactScoreSuccessRate,
      topPlayer: finalRanking[0] || null
    }

    const response = NextResponse.json({
      ranking: finalRanking,
      stats,
      timestamp: new Date().toISOString() // Add timestamp for cache busting
    })
    
    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    
    return response
  } catch (error) {
    console.error('Error fetching ranking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}