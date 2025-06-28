import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
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
        player2: true
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
        category: cat
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
        exactScore: prediction.exactScore,
        goesToThirdSet: prediction.goesToThirdSet,
        firstSetWinner: prediction.firstSetWinner,
        willHaveTiebreak: prediction.willHaveTiebreak,
        marginOfVictory: prediction.marginOfVictory
      },
      create: {
        userId,
        matchId,
        winner: prediction.winner,
        exactScore: prediction.exactScore,
        goesToThirdSet: prediction.goesToThirdSet,
        firstSetWinner: prediction.firstSetWinner,
        willHaveTiebreak: prediction.willHaveTiebreak,
        marginOfVictory: prediction.marginOfVictory
      }
    })

    return NextResponse.json({ success: true, prediction: result })
  } catch (error) {
    console.error('Error saving prediction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}