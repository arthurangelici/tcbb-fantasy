import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic' // Force dynamic rendering
export const revalidate = 0 // Don't cache this route

// Get ranking by category
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rankingData = users.map((user: any) => {
      const pointsByCategory = {
        general: 0, // Calculate general points by summing predictions and bets
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user.predictions.forEach((prediction: any) => {
        const matchCategory = prediction.match.category
        const points = prediction.pointsEarned || 0; // Ensure points is a number

        // Add to general stats
        pointsByCategory.general += points;
        predictionsByCategory.general.total++
        if (points > 0) {
          predictionsByCategory.general.correct++
        }
        
        // Add to category-specific stats
        if (matchCategory === 'A' || matchCategory === 'B' || matchCategory === 'C') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (pointsByCategory as any)[matchCategory] += points;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (predictionsByCategory as any)[matchCategory].total++
          if (points > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (predictionsByCategory as any)[matchCategory].correct++
          }
        }
      })

      // Add tournament bet points by category
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user.tournamentBets.forEach((bet: any) => {
        const points = bet.pointsEarned || 0; // Ensure points is a number
        pointsByCategory.general += points;

        if (bet.category && (bet.category === 'A' || bet.category === 'B' || bet.category === 'C')) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (pointsByCategory as any)[bet.category] += points;
        }
      })

      // Calculate streak
      const sortedPredictions = user.predictions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((p: any) => p.match.status === 'FINISHED')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortedRanking = rankingData.sort((a: any, b: any) => {
      const pointsA = category === 'general' ? a.pointsByCategory.general : a.pointsByCategory[category as 'A' | 'B' | 'C'] || 0
      const pointsB = category === 'general' ? b.pointsByCategory.general : b.pointsByCategory[category as 'A' | 'B' | 'C'] || 0
      return pointsB - pointsA
    })

    // Add position and trend information
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalRanking = sortedRanking.map((player: any, index: number) => ({
      ...player,
      position: index + 1,
      previousPosition: index + 1, // Simplified for now
      trend: 'stable' as const
    }))

    // Calculate stats
    const totalPlayers = finalRanking.length
    const categoryKey = category === 'general' ? 'general' : category as 'A' | 'B' | 'C'
    const averagePoints = totalPlayers > 0 ? Math.round(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      finalRanking.reduce((acc: number, p: any) => acc + (p.pointsByCategory[categoryKey] || 0), 0) / totalPlayers
    ) : 0
    
    const averageSuccessRate = totalPlayers > 0 ? Number((
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      finalRanking.reduce((acc: number, p: any) => {
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