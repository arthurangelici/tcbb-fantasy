import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculatePredictionPoints, getTournamentBetPoints } from '@/lib/utils'

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
    'FINAL': 'Final',
    // Ranking TCBB rounds
    'ROUND_1': 'Rodada 1',
    'ROUND_2': 'Rodada 2',
    'ROUND_3': 'Rodada 3',
    'ROUND_4': 'Rodada 4',
    'ROUND_5': 'Rodada 5',
    'ROUND_6': 'Rodada 6',
    'ROUND_7': 'Rodada 7',
    'ROUND_8': 'Rodada 8',
    'ROUND_9': 'Rodada 9'
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
        category: category as 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB'
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
          category: category as 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB',
          age: 25 // Default age
        }
      })
    }

    let player2 = await prisma.player.findFirst({
      where: { 
        name: player2Name,
        category: category as 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB'
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
          category: category as 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB',
          age: 25 // Default age
        }
      })
    }

    // Create the match
    const newMatch = await prisma.match.create({
      data: {
        player1Id: player1.id,
        player2Id: player2.id,
        category: category as 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB',
        round: round as 'FIRST_ROUND' | 'ROUND_OF_16' | 'QUARTERFINALS' | 'SEMIFINALS' | 'FINAL' | 'ROUND_1' | 'ROUND_2' | 'ROUND_3' | 'ROUND_4' | 'ROUND_5' | 'ROUND_6' | 'ROUND_7' | 'ROUND_8' | 'ROUND_9',
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

        // Validate winner is provided and correct
        if (!winner || (winner !== 'PLAYER1' && winner !== 'PLAYER2')) {
          throw new Error('Winner must be either PLAYER1 or PLAYER2');
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
        updateData.winnerId = winner === 'PLAYER1' ? match.player1Id : match.player2Id;
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

        // 4. Calculate and update prediction points for all users who made predictions on this match
        if (setScores) {
          const predictions = await tx.prediction.findMany({
            where: { matchId: matchId }
          });

          // Calculate sets won by each player
          let player1Sets = 0;
          let player2Sets = 0;
          for (const set of setScores) {
            if (set.p1 > set.p2) {
              player1Sets++;
            } else if (set.p2 > set.p1) {
              player2Sets++;
            }
          }

          // Create match object for scoring calculation
          const matchForScoring = {
            winner: winner === 'PLAYER1' ? 'player1' : 'player2',  // Now guaranteed to be valid
            setScores: setScores,
            player1Sets,
            player2Sets,
            hadTiebreak: updateData.hadTiebreak || false
          };

          // Update points for each prediction
          for (const prediction of predictions) {
            const predictionData = {
              winner: prediction.winner,
              setScores: prediction.setScores as { p1: number; p2: number; tiebreak?: string }[] | null
            };

            const points = calculatePredictionPoints(
              predictionData,
              matchForScoring
            );

            // Log for debugging points calculation
            console.log('Points calculation:', {
              matchId: matchId,
              userId: prediction.userId,
              predictionWinner: predictionData.winner,
              matchWinner: matchForScoring.winner,
              calculatedPoints: points,
              predictionSetScores: predictionData.setScores,
              matchSetScores: matchForScoring.setScores
            });

            await tx.prediction.update({
              where: { id: prediction.id },
              data: { pointsEarned: points }
            });
          }

          // After updating all predictions, recalculate total points for all affected users
          const affectedUserIds = Array.from(new Set(predictions.map((p: { userId: string }) => p.userId)));
          
          for (const userId of affectedUserIds) {
            // Calculate total points from all predictions
            const userPredictions = await tx.prediction.findMany({
              where: { userId }
            });
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const predictionPoints = userPredictions.reduce((sum: number, pred: any) => sum + pred.pointsEarned, 0);
            
            // Calculate total points from tournament bets
            const userTournamentBets = await tx.tournamentBet.findMany({
              where: { userId }
            });
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tournamentBetPoints = userTournamentBets.reduce((sum: number, bet: any) => sum + bet.pointsEarned, 0);
            
            // Update user's total points (predictions + tournament bets)
            await tx.user.update({
              where: { id: userId },
              data: { points: predictionPoints + tournamentBetPoints }
            });
          }

          // 5. If this is a FINAL match, calculate and award tournament bet points (CHAMPION and RUNNER_UP)
          if (match.round === 'FINAL') {
            const championId = updateData.winnerId; // Winner of the final is the champion
            const runnerUpId = winner === 'PLAYER1' ? match.player2Id : match.player1Id; // Loser of the final is the runner-up
            const matchCategory = match.category;

            // Find all tournament bets for this category
            const tournamentBets = await tx.tournamentBet.findMany({
              where: {
                category: matchCategory,
                type: { in: ['CHAMPION', 'RUNNER_UP'] }
              }
            });

            const affectedTournamentBetUserIds = new Set<string>();

            for (const bet of tournamentBets) {
              let pointsToAward = 0;

              if (bet.type === 'CHAMPION' && bet.playerId === championId) {
                pointsToAward = getTournamentBetPoints('CHAMPION');
              } else if (bet.type === 'RUNNER_UP' && bet.playerId === runnerUpId) {
                pointsToAward = getTournamentBetPoints('RUNNER_UP');
              }

              // Update the tournament bet with earned points
              await tx.tournamentBet.update({
                where: { id: bet.id },
                data: { pointsEarned: pointsToAward }
              });

              if (pointsToAward > 0) {
                affectedTournamentBetUserIds.add(bet.userId);
              }
            }

            // Recalculate total points for users affected by tournament bet updates
            const affectedUserIdsArray = Array.from(affectedTournamentBetUserIds);
            for (const userId of affectedUserIdsArray) {
              // Calculate total points from all predictions
              const userPredictions = await tx.prediction.findMany({
                where: { userId }
              });
              
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const predictionPoints = userPredictions.reduce((sum: number, pred: any) => sum + pred.pointsEarned, 0);
              
              // Calculate total points from tournament bets
              const userTournamentBets = await tx.tournamentBet.findMany({
                where: { userId }
              });
              
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const tournamentBetPoints = userTournamentBets.reduce((sum: number, bet: any) => sum + bet.pointsEarned, 0);
              
              // Update user's total points (predictions + tournament bets)
              await tx.user.update({
                where: { id: userId },
                data: { points: predictionPoints + tournamentBetPoints }
              });
            }

            console.log('Tournament bet points calculation:', {
              matchId: matchId,
              matchCategory: matchCategory,
              championId: championId,
              runnerUpId: runnerUpId,
              totalBetsProcessed: tournamentBets.length,
              usersAffected: affectedTournamentBetUserIds.size
            });
          }
        }
      }

      // 6. Return the fully updated match data with players
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

    // Use transaction to ensure atomicity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      // 1. Get all predictions for this match to know which users to update
      const predictions = await tx.prediction.findMany({
        where: { matchId: matchId },
        select: { userId: true }
      });

      const affectedUserIds = Array.from(new Set(predictions.map((p: { userId: string }) => p.userId)));

      // 2. Delete all predictions for this match
      await tx.prediction.deleteMany({
        where: { matchId: matchId },
      });

      // 3. Delete the match itself
      await tx.match.delete({
        where: { id: matchId },
      });

      // 4. Recalculate total points for all affected users
      for (const userId of affectedUserIds) {
        // Calculate total points from remaining predictions
        const userPredictions = await tx.prediction.findMany({
          where: { userId }
        });
        
        const predictionPoints = userPredictions.reduce((sum: number, pred: { pointsEarned: number }) => sum + (pred.pointsEarned || 0), 0);
        
        // Also include tournament bet points
        const userTournamentBets = await tx.tournamentBet.findMany({
          where: { userId }
        });
        
        const tournamentBetPoints = userTournamentBets.reduce((sum: number, bet: { pointsEarned: number }) => sum + (bet.pointsEarned || 0), 0);
        
        // Update user's total points (predictions + tournament bets)
        await tx.user.update({
          where: { id: userId },
          data: { points: predictionPoints + tournamentBetPoints }
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Match deleted successfully and user points recalculated' })
  } catch (error) {
    console.error('Error deleting match:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}