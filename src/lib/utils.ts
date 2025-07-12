import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPoints(points: number): string {
  return points.toLocaleString('pt-BR')
}

export function formatPointsCompact(points: number): string {
  if (points >= 1000000) {
    return (points / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (points >= 1000) {
    return (points / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return points.toString()
}

export function calculatePredictionPoints(
  prediction: {
    winner?: string | null
    setScores?: { p1: number; p2: number; tiebreak?: string }[] | null
  },
  match: {
    winner?: string | null
    setScores?: { p1: number; p2: number; tiebreak?: string }[] | null
    player1Sets: number
    player2Sets: number
    hadTiebreak: boolean
  }
): number {
  let totalPoints = 0

  // Winner prediction (5 points)
  if (prediction.winner === match.winner) {
    totalPoints += 5
  }

  // Detailed set score prediction (15 points)
  if (prediction.setScores && match.setScores && Array.isArray(prediction.setScores) && Array.isArray(match.setScores)) {
    let perfectMatch = true
    const minLength = Math.min(prediction.setScores.length, match.setScores.length)
    
    for (let i = 0; i < minLength; i++) {
      const predSet = prediction.setScores[i]
      const actualSet = match.setScores[i]
      
      if (predSet.p1 !== actualSet.p1 || predSet.p2 !== actualSet.p2) {
        perfectMatch = false
        break
      }
      
      // Check tiebreak prediction
      if (predSet.tiebreak && actualSet.tiebreak) {
        if (predSet.tiebreak !== actualSet.tiebreak) {
          perfectMatch = false
          break
        }
      } else if (predSet.tiebreak || actualSet.tiebreak) {
        // One has tiebreak, other doesn't
        perfectMatch = false
        break
      }
    }
    
    // Only award points if lengths match too (predicted correct number of sets)
    if (perfectMatch && prediction.setScores.length === match.setScores.length) {
      totalPoints += 15
    }
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