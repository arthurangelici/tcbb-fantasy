import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

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
    
    matches.forEach((match) => {
      const cat = match.category
      if (!tournamentData[cat]) {
        tournamentData[cat] = { rounds: [] }
      }

      // Map database round enum to display names
      const roundNames: Record<string, string> = {
        'FIRST_ROUND': '1ª Rodada',
        'ROUND_OF_16': 'Oitavas de Final', 
        'QUARTERFINALS': 'Quartas de Final',
        'SEMIFINALS': 'Semifinais',
        'FINAL': 'Final'
      }

      const roundName = `${roundNames[match.round] || match.round} - Categoria ${cat}`
      
      let round = tournamentData[cat].rounds.find(r => r.name === roundName)
      if (!round) {
        round = { name: roundName, matches: [] }
        tournamentData[cat].rounds.push(round)
      }

      // Calculate sets from setScores
      let player1Sets = 0;
      let player2Sets = 0;
      if (match.status === 'FINISHED' && Array.isArray(match.setScores)) {
        for (const set of match.setScores as { p1: number, p2: number }[]) {
          if (set.p1 > set.p2) {
            player1Sets++;
          } else if (set.p2 > set.p1) {
            player2Sets++;
          }
        }
      }

      // Format the detailed score string
      let scoreString = null;
      if (match.status === 'FINISHED' && Array.isArray(match.setScores)) {
        scoreString = (match.setScores as { p1: number, p2: number, tiebreak?: string }[])
          .map(set => {
            let setScore = `${set.p1}x${set.p2}`;
            if (set.tiebreak && set.tiebreak.trim() !== '') {
              setScore += `(${set.tiebreak})`;
            }
            return setScore;
          })
          .join(' ');
      }

      const formattedMatch = {
        id: match.id,
        player1: match.player1.name,
        player2: match.player2.name,
        winner: match.winnerId ? (player1Sets > player2Sets ? match.player1.name : match.player2.name) : null,
        score: scoreString,
        completed: match.status === 'FINISHED',
        category: cat
      }

      round.matches.push(formattedMatch)
    })

    // Calculate tournament statistics
    const allMatches = matches
    const stats = {
      totalMatches: allMatches.length,
      completedMatches: allMatches.filter((m) => m.status === 'FINISHED').length,
      remainingMatches: allMatches.filter((m) => m.status !== 'FINISHED').length,
      activePlayers: await prisma.player.count()
    }

    // Category-specific stats
    const categoryStats: Record<string, { total: number; completed: number }> = {}
    for (const cat of ['A', 'B', 'C']) {
      const categoryMatches = matches.filter((m) => m.category === cat)
      categoryStats[cat] = {
        total: categoryMatches.length,
        completed: categoryMatches.filter((m) => m.status === 'FINISHED').length
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