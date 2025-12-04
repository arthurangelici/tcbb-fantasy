"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock, TrendingUp, Crown } from "lucide-react"

interface PredictionHistory {
  id: string
  matchId: string | null
  player1: string
  player2: string
  date: string
  prediction: string
  result: string
  points: number
  correct: boolean | null
  winnerCorrect: boolean | null
  exactScoreCorrect: boolean | null
  type: string
  category: string
  isFinished: boolean
  isTournamentBet?: boolean
  betType?: string
}

export default function PredictionHistoryPage() {
  const { data: session } = useSession()
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPredictionHistory = async () => {
      if (!session?.user?.email) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/predictions/history')
        if (response.ok) {
          const data = await response.json()
          setPredictionHistory(data)
        } else {
          console.error('Failed to fetch prediction history')
        }
      } catch (error) {
        console.error('Error fetching prediction history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPredictionHistory()
  }, [session])

  const totalPoints = predictionHistory.reduce((sum, pred) => sum + pred.points, 0)
  
  // Filter out tournament bets for match-specific statistics
  const matchPredictions = predictionHistory.filter(pred => !pred.isTournamentBet)
  const finishedMatchPredictions = matchPredictions.filter(pred => pred.isFinished)
  const correctWinnerPredictions = finishedMatchPredictions.filter(pred => pred.winnerCorrect).length
  const correctExactScorePredictions = finishedMatchPredictions.filter(pred => pred.exactScoreCorrect).length
  const winnerSuccessRate = finishedMatchPredictions.length > 0 ? (correctWinnerPredictions / finishedMatchPredictions.length * 100).toFixed(1) : 0
  const exactScoreSuccessRate = finishedMatchPredictions.length > 0 ? (correctExactScorePredictions / finishedMatchPredictions.length * 100).toFixed(1) : 0
  
  // Count tournament bet points
  const tournamentBets = predictionHistory.filter(pred => pred.isTournamentBet)
  const tournamentBetPoints = tournamentBets.reduce((sum, bet) => sum + bet.points, 0)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user?.email) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Login necessário
          </h3>
          <p className="text-gray-600">
            Faça login para ver seu histórico de palpites
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Histórico de Palpites
        </h1>
        <p className="text-gray-600">
          Veja o histórico completo dos seus palpites e pontuações
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-emerald-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{totalPoints}</div>
              <p className="text-sm text-gray-600">Pontos Totais</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Crown className="h-8 w-8 text-yellow-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{tournamentBetPoints}</div>
              <p className="text-sm text-gray-600">Pontos Campeão/Vice</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Trophy className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{correctWinnerPredictions}</div>
              <p className="text-sm text-gray-600">Acertos de Vencedores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{winnerSuccessRate}%</div>
              <p className="text-sm text-gray-600">Taxa de Acerto de Vencedores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-indigo-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{exactScoreSuccessRate}%</div>
              <p className="text-sm text-gray-600">Taxa de Acerto de Placares Exatos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <div className="space-y-4">
        {predictionHistory.length > 0 ? (
          predictionHistory.map((prediction) => (
            prediction.isTournamentBet ? (
              // Tournament bet card with special styling
              <Card key={prediction.id} className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-600" />
                      <div>
                        <CardTitle className="text-lg text-yellow-800">
                          {prediction.type} - Cat. {prediction.category}
                        </CardTitle>
                        <CardDescription className="text-yellow-700">
                          {new Date(prediction.date).toLocaleDateString('pt-BR')} • Aposta de Torneio
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {prediction.isFinished ? (
                        <Badge className="bg-emerald-600">
                          ✓ Acertou!
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                          Aguardando resultado
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-yellow-600 text-yellow-800">
                        {prediction.points} pts
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-yellow-700">Seu Palpite:</p>
                      <p className="font-medium text-yellow-900">{prediction.prediction}</p>
                    </div>
                    <div>
                      <p className="text-sm text-yellow-700">Resultado:</p>
                      <p className="font-medium text-yellow-900">{prediction.result}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Regular match prediction card
              <Card key={prediction.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {prediction.player1} vs {prediction.player2}
                      </CardTitle>
                      <CardDescription>
                        {new Date(prediction.date).toLocaleDateString('pt-BR')} • {prediction.type} • Cat. {prediction.category}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {prediction.isFinished ? (
                        <div className="flex items-center gap-1">
                          {prediction.winnerCorrect !== null && (
                            <Badge variant={prediction.winnerCorrect ? "default" : "destructive"}>
                              {prediction.winnerCorrect ? "✓ Vencedor" : "✗ Vencedor"}
                            </Badge>
                          )}
                          {prediction.exactScoreCorrect !== null && (
                            <Badge variant={prediction.exactScoreCorrect ? "default" : "destructive"}>
                              {prediction.exactScoreCorrect ? "✓ Placar" : "✗ Placar"}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary">
                          Aguardando jogo
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {prediction.points} pts
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Seu Palpite:</p>
                      <p className="font-medium">{prediction.prediction}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Resultado:</p>
                      <p className="font-medium">{prediction.result}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ))
        ) : (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum palpite ainda
            </h3>
            <p className="text-gray-600">
              Seus palpites aparecerão aqui assim que forem feitos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}