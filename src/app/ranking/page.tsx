"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Target, Star, Medal, Crown, Award } from "lucide-react"

// Mock ranking data - all players with their points by category
const mockRankingData: PlayerData[] = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@tcbb.com',
    category: 'A',
    pointsByCategory: {
      general: 347,
      A: 167,
      B: 89,
      C: 91
    },
    predictionsByCategory: {
      general: { correct: 23, total: 45 },
      A: { correct: 12, total: 18 },
      B: { correct: 6, total: 14 },
      C: { correct: 5, total: 13 }
    },
    streak: 3
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@tcbb.com',
    category: 'B',
    pointsByCategory: {
      general: 335,
      A: 145,
      B: 120,
      C: 70
    },
    predictionsByCategory: {
      general: { correct: 21, total: 42 },
      A: { correct: 8, total: 16 },
      B: { correct: 9, total: 15 },
      C: { correct: 4, total: 11 }
    },
    streak: 1
  },
  {
    id: 3,
    name: 'Pedro Costa',
    email: 'pedro@tcbb.com',
    category: 'A',
    pointsByCategory: {
      general: 298,
      A: 156,
      B: 78,
      C: 64
    },
    predictionsByCategory: {
      general: { correct: 19, total: 39 },
      A: { correct: 11, total: 17 },
      B: { correct: 5, total: 12 },
      C: { correct: 3, total: 10 }
    },
    streak: 2
  },
  {
    id: 4,
    name: 'Ana Oliveira',
    email: 'ana@tcbb.com',
    category: 'C',
    pointsByCategory: {
      general: 267,
      A: 89,
      B: 67,
      C: 111
    },
    predictionsByCategory: {
      general: { correct: 18, total: 41 },
      A: { correct: 6, total: 15 },
      B: { correct: 4, total: 13 },
      C: { correct: 8, total: 13 }
    },
    streak: 0
  },
  {
    id: 5,
    name: 'Carlos Ferreira',
    email: 'carlos@tcbb.com',
    category: 'B',
    pointsByCategory: {
      general: 245,
      A: 78,
      B: 134,
      C: 33
    },
    predictionsByCategory: {
      general: { correct: 16, total: 38 },
      A: { correct: 5, total: 14 },
      B: { correct: 8, total: 14 },
      C: { correct: 3, total: 10 }
    },
    streak: 1
  },
  {
    id: 6,
    name: 'Luisa Lima',
    email: 'luisa@tcbb.com',
    category: 'A',
    pointsByCategory: {
      general: 223,
      A: 123,
      B: 56,
      C: 44
    },
    predictionsByCategory: {
      general: { correct: 15, total: 36 },
      A: { correct: 9, total: 16 },
      B: { correct: 4, total: 11 },
      C: { correct: 2, total: 9 }
    },
    streak: 2
  },
  {
    id: 7,
    name: 'Bruno Martins',
    email: 'bruno@tcbb.com',
    category: 'C',
    pointsByCategory: {
      general: 201,
      A: 56,
      B: 45,
      C: 100
    },
    predictionsByCategory: {
      general: { correct: 14, total: 35 },
      A: { correct: 4, total: 13 },
      B: { correct: 3, total: 11 },
      C: { correct: 7, total: 11 }
    },
    streak: 0
  },
  {
    id: 8,
    name: 'Gabriela Rocha',
    email: 'gabi@tcbb.com',
    category: 'B',
    pointsByCategory: {
      general: 189,
      A: 67,
      B: 89,
      C: 33
    },
    predictionsByCategory: {
      general: { correct: 13, total: 33 },
      A: { correct: 4, total: 12 },
      B: { correct: 6, total: 12 },
      C: { correct: 3, total: 9 }
    },
    streak: 1
  },
  {
    id: 9,
    name: 'Felipe Alves',
    email: 'felipe@tcbb.com',
    category: 'A',
    pointsByCategory: {
      general: 167,
      A: 98,
      B: 34,
      C: 35
    },
    predictionsByCategory: {
      general: { correct: 12, total: 32 },
      A: { correct: 7, total: 14 },
      B: { correct: 3, total: 10 },
      C: { correct: 2, total: 8 }
    },
    streak: 3
  },
  {
    id: 10,
    name: 'Marcos Pereira',
    email: 'marcos@tcbb.com',
    category: 'C',
    pointsByCategory: {
      general: 145,
      A: 34,
      B: 23,
      C: 88
    },
    predictionsByCategory: {
      general: { correct: 11, total: 31 },
      A: { correct: 3, total: 11 },
      B: { correct: 2, total: 9 },
      C: { correct: 6, total: 11 }
    },
    streak: 0
  },
]

const getRankingIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-500" />
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />
    case 3:
      return <Award className="h-6 w-6 text-amber-600" />
    default:
      return <Trophy className="h-5 w-5 text-gray-400" />
  }
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-emerald-600" />
    case 'down':
      return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
    default:
      return <div className="h-4 w-4" />
  }
}

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'text-emerald-600'
    case 'down':
      return 'text-red-600'
    default:
      return 'text-gray-400'
  }
}

interface PlayerData {
  id: number;
  name: string;
  email: string;
  category: 'A' | 'B' | 'C';
  pointsByCategory: {
    general: number;
    A: number;
    B: number;
    C: number;
  };
  predictionsByCategory: {
    general: { correct: number; total: number };
    A: { correct: number; total: number };
    B: { correct: number; total: number };
    C: { correct: number; total: number };
  };
  streak: number;
  position?: number;
  previousPosition?: number;
  trend?: 'up' | 'down' | 'stable';
}

function PlayerRankingCard({ 
  player, 
  currentUser = false, 
  categoryFilter = 'general' 
}: { 
  player: PlayerData, 
  currentUser?: boolean, 
  categoryFilter?: 'general' | 'A' | 'B' | 'C'
}) {
  const points = player.pointsByCategory[categoryFilter] || 0
  const predictions = player.predictionsByCategory[categoryFilter] || { correct: 0, total: 0 }
  const successRate = predictions.total > 0 ? (predictions.correct / predictions.total) * 100 : 0

  return (
    <Card className={`${currentUser ? 'border-emerald-200 bg-emerald-50' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getRankingIcon(player.position || 0)}
              <span className="text-2xl font-bold">{player.position || 0}</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{player.name}</h3>
                {currentUser && (
                  <Badge variant="default" className="text-xs">
                    Você
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  Cat. {player.category}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{player.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {predictions.correct}/{predictions.total} ({successRate.toFixed(1)}%)
                  </span>
                </div>
                {player.streak > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-600">
                      {player.streak} seguidos
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">
              {points}
            </div>
            <div className="text-sm text-gray-600">pontos</div>
            <div className={`flex items-center justify-end space-x-1 mt-1 ${getTrendColor(player.trend || 'stable')}`}>
              {getTrendIcon(player.trend || 'stable')}
              <span className="text-xs">
                {categoryFilter !== 'general' && (
                  <span className="text-xs text-blue-600">
                    Cat. {categoryFilter}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RankingPage() {
  const [filter, setFilter] = useState<'all' | 'top10'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'general' | 'A' | 'B' | 'C'>('general')
  
  // Mock current user
  const currentUserId = 3 // Pedro Costa
  
  // Get ranking data based on category filter
  const getRankingData = () => {
    // Sort players by points in the selected category
    const sortedPlayers = [...mockRankingData].sort((a, b) => {
      const pointsA = a.pointsByCategory[categoryFilter] || 0
      const pointsB = b.pointsByCategory[categoryFilter] || 0
      return pointsB - pointsA
    })
    
    // Add position and trend information
    return sortedPlayers.map((player, index) => ({
      ...player,
      position: index + 1,
      previousPosition: index + 1, // Simplified for demo
      trend: 'stable' as const
    }))
  }
  
  const rankingData = getRankingData()
  
  const filteredRanking = rankingData.filter(player => {
    if (filter === 'top10') return player.position <= 10
    return true
  })

  const topStats = {
    totalPlayers: rankingData.length,
    averagePoints: Math.round(rankingData.reduce((acc, p) => acc + (p.pointsByCategory[categoryFilter] || 0), 0) / rankingData.length),
    averageSuccessRate: Number((rankingData.reduce((acc, p) => {
      const predictions = p.predictionsByCategory[categoryFilter] || { correct: 0, total: 0 }
      const rate = predictions.total > 0 ? (predictions.correct / predictions.total) * 100 : 0
      return acc + rate
    }, 0) / rankingData.length).toFixed(1)),
    topPlayer: rankingData[0]
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ranking {categoryFilter === 'general' ? 'Geral' : `Categoria ${categoryFilter}`}
        </h1>
        <p className="text-gray-600">
          {categoryFilter === 'general' 
            ? 'Veja como você se compara com outros participantes considerando todas as categorias'
            : `Ranking baseado apenas em pontos obtidos na categoria ${categoryFilter}`
          }
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Filtrar por Categoria</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={categoryFilter === 'general' ? "default" : "outline"}
            onClick={() => setCategoryFilter('general')}
          >
            Ranking Geral
          </Button>
          {['A', 'B', 'C'].map((category) => (
            <Button
              key={category}
              variant={categoryFilter === category ? "default" : "outline"}
              onClick={() => setCategoryFilter(category as 'A' | 'B' | 'C')}
            >
              Categoria {category}
            </Button>
          ))}
        </div>
        {categoryFilter !== 'general' && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              ℹ️ Este ranking considera apenas pontos obtidos em palpites da Categoria {categoryFilter}. Todos os participantes aparecem, ordenados por sua pontuação nesta categoria específica.
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <Trophy className="h-8 w-8 text-emerald-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{topStats.totalPlayers}</div>
              <p className="text-sm text-gray-600">Participantes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Star className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{topStats.averagePoints}</div>
              <p className="text-sm text-gray-600">Pontos Médios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{topStats.averageSuccessRate}%</div>
              <p className="text-sm text-gray-600">Taxa Média</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Crown className="h-8 w-8 text-yellow-500 mr-4" />
            <div>
              <div className="text-2xl font-bold">{topStats.topPlayer?.pointsByCategory[categoryFilter] || 0}</div>
              <p className="text-sm text-gray-600">Líder</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Todos
        </Button>
        <Button
          variant={filter === 'top10' ? 'default' : 'outline'}
          onClick={() => setFilter('top10')}
        >
          Top 10
        </Button>
      </div>

      {/* Podium */}
      {filter === 'all' && filteredRanking.length >= 3 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Pódio {categoryFilter === 'general' ? 'Geral' : `Categoria ${categoryFilter}`}</h2>
          <div className="flex justify-center items-end space-x-4 mb-8">
            {/* Second Place */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
                {filteredRanking[1].name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-lg font-semibold">{filteredRanking[1].name}</div>
                <div className="text-2xl font-bold text-gray-600">{filteredRanking[1].pointsByCategory[categoryFilter]}</div>
                <div className="text-sm text-gray-500">2º lugar</div>
              </div>
            </div>

            {/* First Place */}
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
                {filteredRanking[0].name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                <div className="text-lg font-semibold">{filteredRanking[0].name}</div>
                <div className="text-2xl font-bold text-yellow-600">{filteredRanking[0].pointsByCategory[categoryFilter]}</div>
                <div className="text-sm text-yellow-600">1º lugar</div>
              </div>
            </div>

            {/* Third Place */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
                {filteredRanking[2].name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-lg font-semibold">{filteredRanking[2].name}</div>
                <div className="text-2xl font-bold text-amber-600">{filteredRanking[2].pointsByCategory[categoryFilter]}</div>
                <div className="text-sm text-amber-600">3º lugar</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ranking List */}
      <div className="space-y-4">
        {filteredRanking.map((player) => (
          <PlayerRankingCard 
            key={player.id} 
            player={player} 
            currentUser={player.id === currentUserId}
            categoryFilter={categoryFilter}
          />
        ))}
      </div>

      {filteredRanking.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum participante encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros
          </p>
        </div>
      )}
    </div>
  )
}