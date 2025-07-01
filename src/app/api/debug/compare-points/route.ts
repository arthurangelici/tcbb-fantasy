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

    // Get user exactly like dashboard API does
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

    // Dashboard calculation
    const dashboardPoints = user.points

    // Ranking calculation
    const rankingPointsByCategory = {
      general: user.points || 0,
      A: 0,
      B: 0,
      C: 0
    }

    // Check types and values
    const debug = {
      user_id: user.id,
      user_email: user.email,
      user_name: user.name,
      raw_user_points: user.points,
      raw_user_points_type: typeof user.points,
      dashboard_points: dashboardPoints,
      dashboard_points_type: typeof dashboardPoints,
      ranking_general_points: rankingPointsByCategory.general,
      ranking_general_points_type: typeof rankingPointsByCategory.general,
      predictions_count: user.predictions?.length || 0,
      tournament_bets_count: user.tournamentBets?.length || 0,
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
    console.error('Error in debug endpoint:', error)
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 })
  }
}