import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    // Get all matches with players
    const matches = await prisma.match.findMany({
      where: category && category !== 'ALL' ? { category: category as any } : {},
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
    const tournamentData: Record<string, any> = {}
    
    matches.forEach(match => {
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

      const roundName = `${roundNames[match.round]} - Categoria ${cat}`
      
      let round = tournamentData[cat].rounds.find((r: any) => r.name === roundName)
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
      completedMatches: allMatches.filter(m => m.status === 'FINISHED').length,
      remainingMatches: allMatches.filter(m => m.status !== 'FINISHED').length,
      activePlayers: await prisma.player.count()
    }

    // Category-specific stats
    const categoryStats: Record<string, any> = {}
    for (const cat of ['A', 'B', 'C']) {
      const categoryMatches = matches.filter(m => m.category === cat)
      categoryStats[cat] = {
        total: categoryMatches.length,
        completed: categoryMatches.filter(m => m.status === 'FINISHED').length
      }
    }

    return NextResponse.json({
      tournamentData,
      stats,
      categoryStats
    })
  } catch (error) {
    console.error('Error fetching tournament data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}