import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'general'
    
    // Get all users with their predictions
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      include: {
        predictions: {
          include: {
            match: true
          }
        },
        tournamentBets: true
      }
    })

    // Calculate points and statistics by category
    const rankingData = users.map(user => {
      const pointsByCategory = {
        general: user.points,
        A: 0,
        B: 0,
        C: 0
      }

      const predictionsByCategory = {
        general: { correct: 0, total: 0 },
        A: { correct: 0, total: 0 },
        B: { correct: 0, total: 0 },
        C: { correct: 0, total: 0 }
      }

      // Calculate points and predictions by category
      user.predictions.forEach(prediction => {
        const matchCategory = prediction.match.category
        
        // Add to category-specific stats
        if (matchCategory === 'A' || matchCategory === 'B' || matchCategory === 'C') {
          pointsByCategory[matchCategory] += prediction.pointsEarned
          predictionsByCategory[matchCategory].total++
          if (prediction.pointsEarned > 0) {
            predictionsByCategory[matchCategory].correct++
          }
        }

        // Add to general stats
        predictionsByCategory.general.total++
        if (prediction.pointsEarned > 0) {
          predictionsByCategory.general.correct++
        }
      })

      // Add tournament bet points by category
      user.tournamentBets.forEach(bet => {
        if (bet.category && (bet.category === 'A' || bet.category === 'B' || bet.category === 'C')) {
          pointsByCategory[bet.category] += bet.pointsEarned
        }
      })

      // Calculate streak
      const sortedPredictions = user.predictions
        .filter(p => p.match.status === 'FINISHED')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      
      let streak = 0
      for (const prediction of sortedPredictions) {
        if (prediction.pointsEarned > 0) {
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
    const sortedRanking = rankingData.sort((a, b) => {
      const pointsA = category === 'general' ? a.pointsByCategory.general : a.pointsByCategory[category as 'A' | 'B' | 'C'] || 0
      const pointsB = category === 'general' ? b.pointsByCategory.general : b.pointsByCategory[category as 'A' | 'B' | 'C'] || 0
      return pointsB - pointsA
    })

    // Add position and trend information
    const finalRanking = sortedRanking.map((player, index) => ({
      ...player,
      position: index + 1,
      previousPosition: index + 1, // Simplified for now
      trend: 'stable' as const
    }))

    // Calculate stats
    const totalPlayers = finalRanking.length
    const categoryKey = category === 'general' ? 'general' : category as 'A' | 'B' | 'C'
    const averagePoints = totalPlayers > 0 ? Math.round(
      finalRanking.reduce((acc, p) => acc + (p.pointsByCategory[categoryKey] || 0), 0) / totalPlayers
    ) : 0
    
    const averageSuccessRate = totalPlayers > 0 ? Number((
      finalRanking.reduce((acc, p) => {
        const predictions = p.predictionsByCategory[categoryKey] || { correct: 0, total: 0 }
        const rate = predictions.total > 0 ? (predictions.correct / predictions.total) * 100 : 0
        return acc + rate
      }, 0) / totalPlayers
    ).toFixed(1)) : 0

    const stats = {
      totalPlayers,
      averagePoints,
      averageSuccessRate,
      topPlayer: finalRanking[0] || null
    }

    return NextResponse.json({
      ranking: finalRanking,
      stats
    })
  } catch (error) {
    console.error('Error fetching ranking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}