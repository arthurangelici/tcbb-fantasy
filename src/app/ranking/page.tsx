"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Target, Star, Medal, Crown, Award } from "lucide-react"

// Mock ranking data with categories
const mockRankingByCategory = {
  general: [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@tcbb.com',
      points: 347,
      correctPredictions: 23,
      totalPredictions: 45,
      successRate: 51.1,
      streak: 3,
      position: 1,
      previousPosition: 2,
      trend: 'up',
      category: 'A'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@tcbb.com',
      points: 335,
      correctPredictions: 21,
      totalPredictions: 42,
      successRate: 50.0,
      streak: 1,
      position: 2,
      previousPosition: 1,
      trend: 'down',
      category: 'B'
    },
    {
      id: 3,
      name: 'Pedro Costa',
      email: 'pedro@tcbb.com',
      points: 298,
      correctPredictions: 19,
      totalPredictions: 39,
      successRate: 48.7,
      streak: 2,
      position: 3,
      previousPosition: 4,
      trend: 'up',
      category: 'A'
    },
    {
      id: 4,
      name: 'Ana Oliveira',
      email: 'ana@tcbb.com',
      points: 267,
      correctPredictions: 18,
      totalPredictions: 41,
      successRate: 43.9,
      streak: 0,
      position: 4,
      previousPosition: 3,
      trend: 'down',
      category: 'C'
    },
    {
      id: 5,
      name: 'Carlos Ferreira',
      email: 'carlos@tcbb.com',
      points: 245,
      correctPredictions: 16,
      totalPredictions: 38,
      successRate: 42.1,
      streak: 1,
      position: 5,
      previousPosition: 5,
      trend: 'stable',
      category: 'B'
    },
    {
      id: 6,
      name: 'Luisa Lima',
      email: 'luisa@tcbb.com',
      points: 223,
      correctPredictions: 15,
      totalPredictions: 36,
      successRate: 41.7,
      streak: 2,
      position: 6,
      previousPosition: 7,
      trend: 'up',
      category: 'A'
    },
    {
      id: 7,
      name: 'Bruno Martins',
      email: 'bruno@tcbb.com',
      points: 201,
      correctPredictions: 14,
      totalPredictions: 35,
      successRate: 40.0,
      streak: 0,
      position: 7,
      previousPosition: 6,
      trend: 'down',
      category: 'C'
    },
    {
      id: 8,
      name: 'Gabriela Rocha',
      email: 'gabi@tcbb.com',
      points: 189,
      correctPredictions: 13,
      totalPredictions: 33,
      successRate: 39.4,
      streak: 1,
      position: 8,
      previousPosition: 8,
      trend: 'stable',
      category: 'B'
    },
    {
      id: 9,
      name: 'Felipe Alves',
      email: 'felipe@tcbb.com',
      points: 167,
      correctPredictions: 12,
      totalPredictions: 32,
      successRate: 37.5,
      streak: 3,
      position: 9,
      previousPosition: 10,
      trend: 'up',
      category: 'A'
    },
    {
      id: 10,
      name: 'Marcos Pereira',
      email: 'marcos@tcbb.com',
      points: 145,
      correctPredictions: 11,
      totalPredictions: 31,
      successRate: 35.5,
      streak: 0,
      position: 10,
      previousPosition: 9,
      trend: 'down',
      category: 'C'
    },
  ]
}

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

function PlayerRankingCard({ player, currentUser = false }: { player: typeof mockRankingByCategory.general[0], currentUser?: boolean }) {
  return (
    <Card className={`${currentUser ? 'border-emerald-200 bg-emerald-50' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getRankingIcon(player.position)}
              <span className="text-2xl font-bold">{player.position}</span>
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
                    {player.correctPredictions}/{player.totalPredictions} ({player.successRate.toFixed(1)}%)
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
              {player.points}
            </div>
            <div className="text-sm text-gray-600">pontos</div>
            <div className={`flex items-center justify-end space-x-1 mt-1 ${getTrendColor(player.trend)}`}>
              {getTrendIcon(player.trend)}
              <span className="text-xs">
                {player.trend === 'up' ? '+' : player.trend === 'down' ? '-' : ''}
                {Math.abs(player.position - player.previousPosition) || ''}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RankingPage() {
  const [filter, setFilter] = useState<'all' | 'top10' | 'friends'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'general' | 'A' | 'B' | 'C'>('general')
  
  // Mock current user
  const currentUserId = 3 // Pedro Costa
  
  // Get ranking data based on category filter
  const getRankingData = () => {
    const baseRanking = mockRankingByCategory.general
    
    if (categoryFilter === 'general') {
      return baseRanking
    } else {
      // Filter by category and rerank
      const categoryPlayers = baseRanking.filter(p => p.category === categoryFilter)
      return categoryPlayers.map((player, index) => ({
        ...player,
        position: index + 1,
        previousPosition: index + 1 // Simplified for demo
      }))
    }
  }
  
  const rankingData = getRankingData()
  
  const filteredRanking = rankingData.filter(player => {
    if (filter === 'top10') return player.position <= 10
    if (filter === 'friends') return [1, 3, 5, 7].includes(player.id) // Mock friends
    return true
  })

  const topStats = {
    totalPlayers: rankingData.length,
    averagePoints: Math.round(rankingData.reduce((acc, p) => acc + p.points, 0) / rankingData.length),
    averageSuccessRate: Number((rankingData.reduce((acc, p) => acc + p.successRate, 0) / rankingData.length).toFixed(1)),
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
          Veja como você se compara com outros participantes {categoryFilter === 'general' ? 'em geral' : `na categoria ${categoryFilter}`}
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
              ℹ️ Este ranking mostra apenas os participantes da Categoria {categoryFilter}, mas as pontuações vêm de todas as categorias.
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
              <div className="text-2xl font-bold">{topStats.topPlayer?.points || 0}</div>
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
        <Button
          variant={filter === 'friends' ? 'default' : 'outline'}
          onClick={() => setFilter('friends')}
        >
          Amigos
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
                <div className="text-2xl font-bold text-gray-600">{filteredRanking[1].points}</div>
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
                <div className="text-2xl font-bold text-yellow-600">{filteredRanking[0].points}</div>
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
                <div className="text-2xl font-bold text-amber-600">{filteredRanking[2].points}</div>
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