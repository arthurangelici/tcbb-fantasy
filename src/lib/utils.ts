import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPoints(points: number): string {
  return points.toLocaleString('pt-BR')
}

export function calculatePredictionPoints(
  prediction: {
    winner?: string | null
    exactScore?: string | null
    goesToThirdSet?: boolean | null
    firstSetWinner?: string | null
    willHaveTiebreak?: boolean | null
    marginOfVictory?: string | null
  },
  match: {
    winner?: string | null
    player1Sets: number
    player2Sets: number
    hadTiebreak: boolean
    player1Games?: string | null
    player2Games?: string | null
  }
): number {
  let totalPoints = 0

  // Winner prediction (5 points)
  if (prediction.winner === match.winner) {
    totalPoints += 5
  }

  // Exact score prediction (15 points)
  const actualScore = `${Math.max(match.player1Sets, match.player2Sets)}-${Math.min(match.player1Sets, match.player2Sets)}`
  if (prediction.exactScore === actualScore) {
    totalPoints += 15
  }

  // Third set prediction (8 points)
  const wentToThirdSet = match.player1Sets === 2 || match.player2Sets === 2
  if (prediction.goesToThirdSet === wentToThirdSet) {
    totalPoints += 8
  }

  // First set winner (3 points) - would need to parse games data
  // For now, simplified logic
  if (prediction.firstSetWinner === match.winner) {
    totalPoints += 3
  }

  // Tiebreak prediction (5 points)
  if (prediction.willHaveTiebreak === match.hadTiebreak) {
    totalPoints += 5
  }

  // Margin of victory (7 points)
  // This would need more complex logic based on game scores
  // For now, assume close if 2-1, comfortable if 2-0
  const isClose = Math.abs(match.player1Sets - match.player2Sets) === 1
  const expectedMargin = isClose ? 'CLOSE' : 'COMFORTABLE'
  if (prediction.marginOfVictory === expectedMargin) {
    totalPoints += 7
  }

  return totalPoints
}

export function getTournamentBetPoints(betType: string): number {
  const pointsMap: Record<string, number> = {
    CHAMPION: 25,
    RUNNER_UP: 15,
    SEMIFINALIST: 10,
    QUARTERFINALIST: 5,
    BIGGEST_UPSET: 12,
    LONGEST_MATCH: 10,
    MOST_ACES: 8,
    BEST_COMEBACK: 8
  }
  
  return pointsMap[betType] || 0
}

export function formatMatchTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}min`
  }
  return `${mins}min`
}

export function getPlayerRankingSuffix(ranking: number): string {
  if (ranking >= 11 && ranking <= 13) {
    return 'º'
  }
  
  const lastDigit = ranking % 10
  switch (lastDigit) {
    case 1: return 'º'
    case 2: return 'º'
    case 3: return 'º'
    default: return 'º'
  }
}