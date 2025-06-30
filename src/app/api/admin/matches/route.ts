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

// Define a type for the match with included players
type MatchWithPlayers = {
  id: string;
  player1Id: string;
  player2Id: string;
  player1: {
    id: string;
    name: string;
    ranking: number;
  };
  player2: {
    id: string;
    name: string;
    ranking: number;
  };
  round: string;
  category: string;
  status: string;
  winnerId?: string | null;
  scheduledAt?: Date | null;
  finishedAt?: Date | null;
  setScores?: unknown;
  hadTiebreak?: boolean | null;
  totalDuration?: number | null;
};

// Helper function to format a match object
function formatMatch(match: MatchWithPlayers) {
  const roundNames: Record<string, string> = {
    'FIRST_ROUND': '1ª Rodada',
    'ROUND_OF_16': 'Oitavas de Final', 
    'QUARTERFINALS': 'Quartas de Final',
    'SEMIFINALS': 'Semifinais',
    'FINAL': 'Final'
  }

  let player1Sets = 0;
  let player2Sets = 0;
  if (match.status === 'FINISHED' && Array.isArray(match.setScores)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const set of match.setScores as any[]) {
      if (set.p1 > set.p2) {
        player1Sets++;
      } else if (set.p2 > set.p1) {
        player2Sets++;
      }
    }
  }

  return {
    id: match.id,
    player1: match.player1.name,
    player2: match.player2.name,
    round: roundNames[match.round] || match.round,
    category: match.category,
    status: match.status, // Return status as is (e.g., 'FINISHED')
    scheduledAt: match.scheduledAt?.toISOString(),
    winner: match.winnerId === match.player1Id ? 'PLAYER1' : (match.winnerId === match.player2Id ? 'PLAYER2' : null),
    setScores: match.setScores || [],
    player1Sets: player1Sets,
    player2Sets: player2Sets,
    hadTiebreak: match.hadTiebreak,
    totalDuration: match.totalDuration
  }
}

// Get all matches for admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null
    
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

    const formattedMatches = matches.map(formatMatch)

    return NextResponse.json({ matches: formattedMatches })
  } catch (error) {
    console.error('Error fetching admin matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create new match
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null
    
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
        category: category as 'A' | 'B' | 'C'
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
          category: category as 'A' | 'B' | 'C',
          age: 25 // Default age
        }
      })
    }

    let player2 = await prisma.player.findFirst({
      where: { 
        name: player2Name,
        category: category as 'A' | 'B' | 'C'
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
          category: category as 'A' | 'B' | 'C',
          age: 25 // Default age
        }
      })
    }

    // Create the match
    const newMatch = await prisma.match.create({
      data: {
        player1Id: player1.id,
        player2Id: player2.id,
        category: category as 'A' | 'B' | 'C',
        round: round as 'FIRST_ROUND' | 'ROUND_OF_16' | 'QUARTERFINALS' | 'SEMIFINALS' | 'FINAL',
        status: 'SCHEDULED',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date()
      },
      include: {
        player1: true,
        player2: true
      }
    })

    const formattedMatch = formatMatch(newMatch);

    return NextResponse.json({ success: true, match: formattedMatch })
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update match result
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null
    
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
      winner, // winner is now 'PLAYER1' or 'PLAYER2'
      setScores, // Array of {p1: number, p2: number, tiebreak?: string}
      totalDuration 
    } = body

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }

    // Use a transaction to ensure atomicity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedMatch = await prisma?.$transaction(async (tx: any) => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: { player1: true, player2: true }
      });

      if (!match) {
        // This will cause the transaction to rollback
        throw new Error('Match not found');
      }

      // 1. Update player names if they have changed
      if (player1 && player1 !== match.player1.name) {
        await tx.player.update({
          where: { id: match.player1Id },
          data: { name: player1 }
        });
      }

      if (player2 && player2 !== match.player2.name) {
        await tx.player.update({
          where: { id: match.player2Id },
          data: { name: player2 }
        });
      }

      const updateData: {
        status?: 'SCHEDULED' | 'FINISHED' | 'CANCELLED';
        setScores?: { p1: number; p2: number; tiebreak?: string }[];
        hadTiebreak?: boolean;
        winnerId?: string | null;
        totalDuration?: number | null;
        finishedAt?: Date;
      } = {};

      let hasChanges = false;

      // 2. Update match result if setScores is provided
      if (setScores) {
        if (!Array.isArray(setScores) || setScores.length === 0) {
          throw new Error('setScores must be a non-empty array');
        }

        let hasTiebreak = false;
        for (const set of setScores) {
          if (typeof set.p1 !== 'number' || typeof set.p2 !== 'number') {
            throw new Error('Invalid set score format');
          }
          if (set.tiebreak && typeof set.tiebreak === 'string' && set.tiebreak.trim() !== '') {
            hasTiebreak = true;
          }
        }
        
        updateData.status = 'FINISHED';
        updateData.setScores = setScores;
        updateData.hadTiebreak = hasTiebreak;
        updateData.winnerId = winner === 'PLAYER1' ? match.player1Id : (winner === 'PLAYER2' ? match.player2Id : null);
        updateData.finishedAt = new Date();

        if (totalDuration !== undefined) {
          updateData.totalDuration = totalDuration ? parseInt(totalDuration) : null;
        }
        hasChanges = true;
      }

      // 3. If there are changes, update the match
      if (hasChanges) {
        await tx.match.update({
          where: { id: matchId },
          data: updateData
        });
      }

      // 4. Return the fully updated match data with players
      return tx.match.findUnique({
        where: { id: matchId },
        include: { player1: true, player2: true }
      });
    });

    if (!updatedMatch) {
      return NextResponse.json({ error: 'Failed to retrieve updated match' }, { status: 404 });
    }

    const formattedMatch = formatMatch(updatedMatch);

    return NextResponse.json({ success: true, match: formattedMatch });

  } catch (error) {
    console.error('Error updating match:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Delete a match
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('id')

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 })
    }

    // Transaction to ensure both operations succeed or fail together
    await prisma.$transaction([
      // First, delete all predictions for this match
      prisma.prediction.deleteMany({
        where: { matchId: matchId },
      }),
      // Then, delete the match itself
      prisma.match.delete({
        where: { id: matchId },
      })
    ])

    return NextResponse.json({ success: true, message: 'Match deleted successfully' })
  } catch (error) {
    console.error('Error deleting match:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}