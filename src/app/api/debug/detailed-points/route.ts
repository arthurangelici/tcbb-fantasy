import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    // Get user exactly like both APIs do
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        predictions: {
          include: {
            match: true
          }
        },
        tournamentBets: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Dashboard calculation (from users/stats/route.ts)
    const dashboardPoints = user.points

    // Ranking calculation (from ranking/route.ts)
    const rankingPointsByCategory = {
      general: user.points || 0, // Line 30 from ranking/route.ts
      A: 0,
      B: 0,
      C: 0
    }

    // Calculate category-specific points like ranking does
    let totalFromPredictions = 0
    let totalFromBets = 0
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user.predictions.forEach((prediction: any) => {
      const matchCategory = prediction.match.category
      const points = prediction.pointsEarned || 0
      totalFromPredictions += points
      
      if (matchCategory === 'A' || matchCategory === 'B' || matchCategory === 'C') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rankingPointsByCategory as any)[matchCategory] += points
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user.tournamentBets.forEach((bet: any) => {
      const points = bet.pointsEarned || 0
      totalFromBets += points
      
      if (bet.category && (bet.category === 'A' || bet.category === 'B' || bet.category === 'C')) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rankingPointsByCategory as any)[bet.category] += points
      }
    })

    const debug = {
      user_info: {
        id: user.id,
        email: user.email,
        name: user.name,
        category: user.category
      },
      raw_database_values: {
        user_points: user.points,
        user_points_type: typeof user.points,
        predictions_count: user.predictions?.length || 0,
        tournament_bets_count: user.tournamentBets?.length || 0
      },
      dashboard_calculation: {
        total_points: dashboardPoints,
        source: 'user.points field directly'
      },
      ranking_calculation: {
        points_by_category: rankingPointsByCategory,
        source: 'user.points for general, calculated for categories'
      },
      detailed_breakdown: {
        total_from_predictions: totalFromPredictions,
        total_from_bets: totalFromBets,
        sum_predictions_plus_bets: totalFromPredictions + totalFromBets,
        stored_user_points: user.points
      },
      predictions_detail: user.predictions.map((p: { match: { id: string; category: string; status: string }; pointsEarned: number }) => ({
        match_id: p.match.id,
        match_category: p.match.category,
        points_earned: p.pointsEarned,
        match_status: p.match.status
      })),
      tournament_bets_detail: user.tournamentBets.map((b: { category: string; pointsEarned: number }) => ({
        category: b.category,
        points_earned: b.pointsEarned
      })),
      timestamp: new Date().toISOString()
    }

    const response = NextResponse.json(debug)
    
    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    
    return response
  } catch (error) {
    console.error('Error in detailed debug endpoint:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}