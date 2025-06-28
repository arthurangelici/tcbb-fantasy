import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TournamentCategory, TournamentRound } from '@prisma/client'

// Get all matches for admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const matches = await prisma.match.findMany({
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

    // Format matches for admin interface
    const formattedMatches = matches.map(match => {
      // Map database round enum to display names
      const roundNames: Record<TournamentRound, string> = {
        'FIRST_ROUND': '1ª Rodada',
        'ROUND_OF_16': 'Oitavas de Final', 
        'QUARTERFINALS': 'Quartas de Final',
        'SEMIFINALS': 'Semifinais',
        'FINAL': 'Final'
      }

      return {
        id: match.id,
        player1: match.player1.name,
        player2: match.player2.name,
        round: roundNames[match.round] || match.round,
        category: match.category,
        status: match.status.toLowerCase(),
        scheduledAt: match.scheduledAt?.toISOString(),
        winner: match.winner,
        score: match.status === 'FINISHED' ? `${match.player1Sets}-${match.player2Sets}` : null,
        player1Sets: match.player1Sets,
        player2Sets: match.player2Sets,
        hadTiebreak: match.hadTiebreak,
        totalDuration: match.totalDuration
      }
    })

    return NextResponse.json({ matches: formattedMatches })
  } catch (error) {
    console.error('Error fetching admin matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new match
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      player1Name, 
      player2Name, 
      category, 
      round, 
      scheduledAt 
    } = body

    // Validate required fields
    if (!player1Name || !player2Name || !category || !round) {
      return NextResponse.json({ 
        error: 'Missing required fields: player1Name, player2Name, category, round' 
      }, { status: 400 })
    }

    // Find or create players
    let player1 = await prisma.player.findFirst({
      where: { 
        name: player1Name,
        category: category as TournamentCategory
      }
    })

    if (!player1) {
      // Get the highest ranking number to assign to new player
      const lastPlayer = await prisma.player.findFirst({
        orderBy: { ranking: 'desc' }
      })
      const nextRanking = (lastPlayer?.ranking || 0) + 1

      player1 = await prisma.player.create({
        data: {
          name: player1Name,
          ranking: nextRanking,
          nationality: 'Brasil',
          category: category as TournamentCategory,
          age: 25 // Default age
        }
      })
    }

    let player2 = await prisma.player.findFirst({
      where: { 
        name: player2Name,
        category: category as TournamentCategory
      }
    })

    if (!player2) {
      const lastPlayer = await prisma.player.findFirst({
        orderBy: { ranking: 'desc' }
      })
      const nextRanking = (lastPlayer?.ranking || 0) + 1

      player2 = await prisma.player.create({
        data: {
          name: player2Name,
          ranking: nextRanking,
          nationality: 'Brasil',
          category: category as TournamentCategory,
          age: 25 // Default age
        }
      })
    }

    // Create the match
    const newMatch = await prisma.match.create({
      data: {
        player1Id: player1.id,
        player2Id: player2.id,
        category: category as TournamentCategory,
        round: round as TournamentRound,
        status: 'SCHEDULED',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date()
      },
      include: {
        player1: true,
        player2: true
      }
    })

    // Format match for response
    const roundNames: Record<TournamentRound, string> = {
      'FIRST_ROUND': '1ª Rodada',
      'ROUND_OF_16': 'Oitavas de Final', 
      'QUARTERFINALS': 'Quartas de Final',
      'SEMIFINALS': 'Semifinais',
      'FINAL': 'Final'
    }

    const formattedMatch = {
      id: newMatch.id,
      player1: newMatch.player1.name,
      player2: newMatch.player2.name,
      round: roundNames[newMatch.round] || newMatch.round,
      category: newMatch.category,
      status: newMatch.status.toLowerCase(),
      scheduledAt: newMatch.scheduledAt?.toISOString(),
      winner: newMatch.winner,
      score: null,
      player1Sets: newMatch.player1Sets,
      player2Sets: newMatch.player2Sets,
      hadTiebreak: newMatch.hadTiebreak,
      totalDuration: newMatch.totalDuration
    }

    return NextResponse.json({ success: true, match: formattedMatch })
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update match result
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      matchId, 
      player1, 
      player2, 
      winner, 
      player1Sets, 
      player2Sets, 
      hadTiebreak, 
      totalDuration 
    } = body

    // If player names are provided, update them
    if (player1 || player2) {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: { player1: true, player2: true }
      })

      if (!match) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 })
      }

      // Update player names if different
      if (player1 && player1 !== match.player1.name) {
        await prisma.player.update({
          where: { id: match.player1Id },
          data: { name: player1 }
        })
      }

      if (player2 && player2 !== match.player2.name) {
        await prisma.player.update({
          where: { id: match.player2Id },
          data: { name: player2 }
        })
      }
    }

    // Update match result
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'FINISHED',
        winner: winner,
        player1Sets: parseInt(player1Sets) || 0,
        player2Sets: parseInt(player2Sets) || 0,
        hadTiebreak: hadTiebreak || false,
        totalDuration: totalDuration ? parseInt(totalDuration) : null,
        finishedAt: new Date()
      },
      include: {
        player1: true,
        player2: true
      }
    })

    // TODO: Calculate and update prediction points for this match
    // This would involve checking all predictions for this match and awarding points

    return NextResponse.json({ success: true, match: updatedMatch })
  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}