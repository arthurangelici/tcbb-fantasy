"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock } from "lucide-react"

// Mock data for demonstration
const mockPredictionHistory = [
  {
    id: 1,
    matchId: 1,
    player1: "Carlos Silva",
    player2: "João Santos",
    date: "2024-01-15",
    prediction: "Carlos Silva",
    result: "Carlos Silva",
    points: 5,
    correct: true,
    type: "Winner"
  },
  {
    id: 2,
    matchId: 1,
    player1: "Carlos Silva", 
    player2: "João Santos",
    date: "2024-01-15",
    prediction: "2-1",
    result: "2-1",
    points: 15,
    correct: true,
    type: "Exact Score"
  },
  {
    id: 3,
    matchId: 2,
    player1: "Pedro Oliveira",
    player2: "Lucas Costa", 
    date: "2024-01-15",
    prediction: "Pedro Oliveira",
    result: "Lucas Costa",
    points: 0,
    correct: false,
    type: "Winner"
  },
]

export default function PredictionHistoryPage() {
  const totalPoints = mockPredictionHistory.reduce((sum, pred) => sum + pred.points, 0)
  const correctPredictions = mockPredictionHistory.filter(pred => pred.correct).length
  const successRate = mockPredictionHistory.length > 0 ? (correctPredictions / mockPredictionHistory.length * 100).toFixed(1) : 0

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
            <Trophy className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{correctPredictions}</div>
              <p className="text-sm text-gray-600">Acertos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-sm text-gray-600">Taxa de Sucesso</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <div className="space-y-4">
        {mockPredictionHistory.length > 0 ? (
          mockPredictionHistory.map((prediction) => (
            <Card key={prediction.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {prediction.player1} vs {prediction.player2}
                    </CardTitle>
                    <CardDescription>
                      {new Date(prediction.date).toLocaleDateString('pt-BR')} • {prediction.type}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={prediction.correct ? "default" : "destructive"}>
                      {prediction.correct ? "Acertou" : "Errou"}
                    </Badge>
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
          ))
        ) : (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum palpite ainda
            </h3>
            <p className="text-gray-600">
              Seus palpites aparecerão aqui após serem feitos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}