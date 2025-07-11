import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    // Get user session for predictions
    const session = await getServerSession(authOptions) as SessionWithUser | null
    let user = null
    
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
    }
    
    // Get matches that can be predicted (scheduled matches)
    const matches = await prisma.match.findMany({
      where: {
        AND: [
          { status: 'SCHEDULED' },
          category && category !== 'ALL' ? { category: category as 'A' | 'B' | 'C' } : {}
        ]
      },
      include: {
        player1: true,
        player2: true,
        predictions: user ? {
          where: { userId: user.id }
        } : false
      },
      orderBy: [
        { category: 'asc' },
        { scheduledAt: 'asc' }
      ]
    })

    // Group matches by category
    const matchesByCategory: Record<string, Array<{
      id: string
      player1: { name: string; ranking: number }
      player2: { name: string; ranking: number }
      scheduledAt?: string
      status: string
      round: string
      canPredict: boolean
      category: string
      existingPrediction?: {
        winner?: string | null
        setScores?: { p1: number; p2: number }[] | null
      }
    }>> = {}
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    matches.forEach((match: any) => {
      const cat = match.category
      if (!matchesByCategory[cat]) {
        matchesByCategory[cat] = []
      }

      // Map database round enum to display names
      const roundNames: Record<string, string> = {
        'FIRST_ROUND': '1ª Rodada',
        'ROUND_OF_16': 'Oitavas de Final', 
        'QUARTERFINALS': 'Quartas de Final',
        'SEMIFINALS': 'Semifinais',
        'FINAL': 'Final'
      }

      const formattedMatch = {
        id: match.id,
        player1: { 
          name: match.player1.name, 
          ranking: match.player1.ranking 
        },
        player2: { 
          name: match.player2.name, 
          ranking: match.player2.ranking 
        },
        scheduledAt: match.scheduledAt?.toISOString(),
        status: match.status.toLowerCase(),
        round: roundNames[match.round] || match.round,
        canPredict: true,
        category: cat,
        // Include existing prediction if user is logged in and has made a prediction
        ...(match.predictions && match.predictions.length > 0 && {
          existingPrediction: {
            winner: match.predictions[0].winner,
            setScores: match.predictions[0].setScores
          }
        })
      }

      matchesByCategory[cat].push(formattedMatch)
    })

    // Get tournament bet types with points
    const tournamentBets = [
      { type: 'CHAMPION', label: 'Campeão', points: 25, description: 'Quem será o campeão da categoria?' },
      { type: 'RUNNER_UP', label: 'Vice-campeão', points: 15, description: 'Quem chegará à final mas não ganhará?' },
      { type: 'SEMIFINALIST', label: 'Semifinalista', points: 10, description: 'Escolha um jogador que chegará às semifinais' },
      { type: 'QUARTERFINALIST', label: 'Quartas de Final', points: 5, description: 'Escolha um jogador que chegará às quartas' }
    ]

    // Get categories with description
    const categories = [
      { id: 'A', name: 'Categoria A', description: 'Jogadores de alto nível' },
      { id: 'B', name: 'Categoria B', description: 'Jogadores intermediários' },
      { id: 'C', name: 'Categoria C', description: 'Jogadores iniciantes' }
    ]

    return NextResponse.json({
      matchesByCategory,
      tournamentBets,
      categories
    })
  } catch (error) {
    console.error('Error fetching predictions data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle prediction submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matchId, prediction, userId } = body

    // Create or update prediction
    const result = await prisma.prediction.upsert({
      where: {
        userId_matchId: {
          userId,
          matchId
        }
      },
      update: {
        winner: prediction.winner,
        setScores: prediction.setScores,
      },
      create: {
        userId,
        matchId,
        winner: prediction.winner,
        setScores: prediction.setScores,
      }
    })

    return NextResponse.json({ success: true, prediction: result })
  } catch (error) {
    console.error('Error saving prediction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}