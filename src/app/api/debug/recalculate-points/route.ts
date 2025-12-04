import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculatePredictionPoints, getTournamentBetPoints } from '@/lib/utils'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

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

export async function POST() {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    console.log('Starting points recalculation for all finished matches...');

    // Get all finished matches
    const finishedMatches = await prisma.match.findMany({
      where: { 
        status: 'FINISHED',
        winnerId: { not: null }  // Only matches with a winner
      },
      include: {
        player1: true,
        player2: true,
        predictions: true
      }
    });

    console.log(`Found ${finishedMatches.length} finished matches with winners`);

    let totalUpdated = 0;
    let totalPointsAwarded = 0;
    let tournamentBetsUpdated = 0;

    // Use transaction to ensure consistency
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const match of finishedMatches) {
        console.log(`Processing match: ${match.player1.name} vs ${match.player2.name}`);

        // Determine winner in the format expected by calculatePredictionPoints
        const matchWinner = match.winnerId === match.player1Id ? 'player1' : 
                           match.winnerId === match.player2Id ? 'player2' : null;

        if (!matchWinner) {
          console.log(`Skipping match ${match.id} - no valid winner`);
          continue;
        }

        // Calculate player sets from setScores
        let player1Sets = 0;
        let player2Sets = 0;
        if (match.setScores && Array.isArray(match.setScores)) {
          for (const set of match.setScores as { p1: number; p2: number; tiebreak?: string }[]) {
            if (set.p1 > set.p2) {
              player1Sets++;
            } else if (set.p2 > set.p1) {
              player2Sets++;
            }
          }
        }

        const matchForScoring = {
          winner: matchWinner,
          setScores: match.setScores as { p1: number; p2: number; tiebreak?: string }[] | null,
          player1Sets,
          player2Sets,
          hadTiebreak: match.hadTiebreak || false
        };

        // Update points for each prediction on this match
        for (const prediction of match.predictions) {
          const predictionData = {
            winner: prediction.winner,
            setScores: prediction.setScores as { p1: number; p2: number; tiebreak?: string }[] | null
          };

          const points = calculatePredictionPoints(predictionData, matchForScoring);

          await tx.prediction.update({
            where: { id: prediction.id },
            data: { pointsEarned: points }
          });

          totalPointsAwarded += points;
          totalUpdated++;
        }

        // If this is a FINAL match, recalculate tournament bet points (CHAMPION and RUNNER_UP)
        if (match.round === 'FINAL') {
          const championId = match.winnerId; // Winner of the final is the champion
          const runnerUpId = match.winnerId === match.player1Id ? match.player2Id : match.player1Id; // Loser of the final is the runner-up
          const matchCategory = match.category;

          console.log(`Processing FINAL match for category ${matchCategory}: Champion=${championId}, Runner-up=${runnerUpId}`);

          // Find all tournament bets for this category (CHAMPION and RUNNER_UP)
          const tournamentBets = await tx.tournamentBet.findMany({
            where: {
              category: matchCategory,
              type: { in: ['CHAMPION', 'RUNNER_UP'] }
            }
          });

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
              tournamentBetsUpdated++;
              totalPointsAwarded += pointsToAward;
            }
          }

          console.log(`Tournament bet points calculation for ${matchCategory}: ${tournamentBets.length} bets processed`);
        }
      }

      // Recalculate total points for all users
      const allUsers = await tx.user.findMany({
        where: { role: 'USER' }
      });

      for (const userRecord of allUsers) {
        const userPredictions = await tx.prediction.findMany({
          where: { userId: userRecord.id }
        });

        const predictionPoints = userPredictions.reduce((sum: number, pred: { pointsEarned: number }) => sum + pred.pointsEarned, 0);

        // Also include tournament bet points
        const userTournamentBets = await tx.tournamentBet.findMany({
          where: { userId: userRecord.id }
        });

        const tournamentBetPoints = userTournamentBets.reduce((sum: number, bet: { pointsEarned: number }) => sum + bet.pointsEarned, 0);

        await tx.user.update({
          where: { id: userRecord.id },
          data: { points: predictionPoints + tournamentBetPoints }
        });
      }
    });

    console.log('Points recalculation completed');

    return NextResponse.json({
      success: true,
      message: 'Points recalculated successfully',
      stats: {
        finishedMatches: finishedMatches.length,
        predictionsUpdated: totalUpdated,
        tournamentBetsUpdated,
        totalPointsAwarded
      }
    });

  } catch (error) {
    console.error('Error recalculating points:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}