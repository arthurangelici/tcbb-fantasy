"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock } from "lucide-react"

interface PredictionHistory {
  id: string
  matchId: string
  player1: string
  player2: string
  date: string
  prediction: string
  result: string
  points: number
  correct: boolean
  type: string
  category: string
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
  const correctPredictions = predictionHistory.filter(pred => pred.correct).length
  const successRate = predictionHistory.length > 0 ? (correctPredictions / predictionHistory.length * 100).toFixed(1) : 0

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
        {predictionHistory.length > 0 ? (
          predictionHistory.map((prediction) => (
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
              Seus palpites aparecerão aqui após serem feitos e as partidas finalizadas
            </p>
          </div>
        )}
      </div>
    </div>
  )
}