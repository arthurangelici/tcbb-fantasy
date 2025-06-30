import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    // Get all matches with players
    const matches = await prisma.match.findMany({
      where: category && category !== 'ALL' ? { category: category as 'A' | 'B' | 'C' } : {},
      include: {
        player1: true,
        player2: true
      },
      orderBy: [
        { category: 'asc' },
        { round: 'asc' },
        { scheduledAt: 'asc' }
      ]
    })

    // Group matches by category and round
    const tournamentData: Record<string, {
      rounds: Array<{
        name: string
        matches: Array<{
          id: string
          player1: string
          player2: string
          winner: string | null
          score: string | null
          completed: boolean
          category: string
        }>
      }>
    }> = {}
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    matches.forEach((match: any) => {
      const cat = match.category
      if (!tournamentData[cat]) {
        tournamentData[cat] = { rounds: [] }
      }

      // Map database round enum to display names
      const roundNames = {
        'FIRST_ROUND': '1ª Rodada',
        'ROUND_OF_16': 'Oitavas de Final', 
        'QUARTERFINALS': 'Quartas de Final',
        'SEMIFINALS': 'Semifinais',
        'FINAL': 'Final'
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const roundName = `${(roundNames as any)[match.round]} - Categoria ${cat}`
      
      let round = tournamentData[cat].rounds.find(r => r.name === roundName)
      if (!round) {
        round = { name: roundName, matches: [] }
        tournamentData[cat].rounds.push(round)
      }

      const formattedMatch = {
        id: match.id,
        player1: match.player1.name,
        player2: match.player2.name,
        winner: match.winner === 'player1' ? match.player1.name : 
                match.winner === 'player2' ? match.player2.name : null,
        score: match.status === 'FINISHED' ? `${match.player1Sets}-${match.player2Sets}` : null,
        completed: match.status === 'FINISHED',
        category: cat
      }

      round.matches.push(formattedMatch)
    })

    // Calculate tournament statistics
    const allMatches = matches
    const stats = {
      totalMatches: allMatches.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      completedMatches: allMatches.filter((m: any) => m.status === 'FINISHED').length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      remainingMatches: allMatches.filter((m: any) => m.status !== 'FINISHED').length,
      activePlayers: await prisma.player.count()
    }

    // Category-specific stats
    const categoryStats: Record<string, { total: number; completed: number }> = {}
    for (const cat of ['A', 'B', 'C']) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const categoryMatches = matches.filter((m: any) => m.category === cat)
      categoryStats[cat] = {
        total: categoryMatches.length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        completed: categoryMatches.filter((m: any) => m.status === 'FINISHED').length
      }
    }

    return NextResponse.json({
      tournamentData,
      stats,
      categoryStats
    })
  } catch (error) {
    console.error('[TOURNAMENT_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}