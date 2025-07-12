"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, TrendingUp, Target, Star, Medal, Crown, Award, RefreshCw } from "lucide-react"

interface PlayerData {
  id: string;
  name: string;
  email: string;
  category: 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB';
  pointsByCategory: {
    general: number;
    A: number;
    B: number;
    C: number;
    ATP: number;
    RANKING_TCBB: number;
  };
  predictionsByCategory: {
    general: { correct: number; total: number; winnerCorrect: number };
    A: { correct: number; total: number; winnerCorrect: number };
    B: { correct: number; total: number; winnerCorrect: number };
    C: { correct: number; total: number; winnerCorrect: number };
    ATP: { correct: number; total: number; winnerCorrect: number };
    RANKING_TCBB: { correct: number; total: number; winnerCorrect: number };
  };
  streak: number;
  position?: number;
  previousPosition?: number;
  trend?: 'up' | 'down' | 'stable';
}

interface RankingStats {
  totalPlayers: number;
  averagePoints: number;
  averageSuccessRate: number;
  averageWinnerSuccessRate: number;
  topPlayer: PlayerData | null;
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

function PlayerRankingCard({ 
  player, 
  currentUser = false, 
  categoryFilter = 'general' 
}: { 
  player: PlayerData, 
  currentUser?: boolean, 
  categoryFilter?: 'general' | 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB'
}) {
  const points = player.pointsByCategory[categoryFilter] || 0
  const predictions = player.predictionsByCategory[categoryFilter] || { correct: 0, total: 0, winnerCorrect: 0 }
  const winnerSuccessRate = predictions.total > 0 ? (predictions.winnerCorrect / predictions.total) * 100 : 0

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
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {predictions.winnerCorrect}/{predictions.total} ({winnerSuccessRate.toFixed(1)}%)
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
                    {categoryFilter === 'ATP' ? 'ATP' : categoryFilter === 'RANKING_TCBB' ? 'Ranking TCBB' : `Cat. ${categoryFilter}`}
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
  const { data: session } = useSession()
  const [filter, setFilter] = useState<'all' | 'top10'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'general' | 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB'>('general')
  const [ranking, setRanking] = useState<PlayerData[]>([])
  const [stats, setStats] = useState<RankingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const fetchRanking = useCallback(async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/ranking?category=${categoryFilter}&t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setRanking(data.ranking)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching ranking:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [categoryFilter])

  const handleRefresh = useCallback(() => {
    fetchRanking(true)
  }, [fetchRanking])

  useEffect(() => {
    fetchRanking()
  }, [categoryFilter, fetchRanking])

  // Auto-refresh when page becomes visible (useful when matches are updated)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRanking(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchRanking])
  
  const filteredRanking = ranking.filter(player => {
    if (filter === 'top10') return player.position && player.position <= 10
    return true
  })

  // Get current user ID for highlighting
  const currentUserId = session?.user?.email ? 
    ranking.find(p => p.email === session.user?.email)?.id : null

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ranking {categoryFilter === 'general' ? 'Geral' : (categoryFilter === 'ATP' ? 'ATP' : categoryFilter === 'RANKING_TCBB' ? 'Ranking TCBB' : `Categoria ${categoryFilter}`)}
        </h1>
        <p className="text-gray-600">
          {categoryFilter === 'general' 
            ? 'Veja como você se compara com outros participantes considerando todas as categorias'
            : `Ranking baseado apenas em pontos obtidos na categoria ${categoryFilter === 'ATP' ? 'ATP' : categoryFilter === 'RANKING_TCBB' ? 'Ranking TCBB' : categoryFilter}`
          }
        </p>
      </div>

      {/* Category Filter and Refresh */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-semibold mb-2 sm:mb-0">Filtrar por Categoria</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar Ranking'}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={categoryFilter === 'general' ? "default" : "outline"}
            onClick={() => setCategoryFilter('general')}
          >
            Ranking Geral
          </Button>
          {['A', 'B', 'C', 'ATP', 'RANKING_TCBB'].map((category) => {
            const displayName = category === 'ATP' ? 'ATP' : category === 'RANKING_TCBB' ? 'Ranking TCBB' : `Categoria ${category}`
            return (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                onClick={() => setCategoryFilter(category as 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB')}
              >
                {displayName}
              </Button>
            )
          })}
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
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <Trophy className="h-8 w-8 text-emerald-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{stats.totalPlayers}</div>
                <p className="text-sm text-gray-600">Participantes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Star className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{stats.averagePoints}</div>
                <p className="text-sm text-gray-600">Pontos Médios</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Target className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{stats.averageWinnerSuccessRate}%</div>
                <p className="text-sm text-gray-600">Taxa Média de Vencedores</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Crown className="h-8 w-8 text-yellow-500 mr-4" />
              <div>
                <div className="text-2xl font-bold">
                  {stats.topPlayer?.pointsByCategory[categoryFilter] || 0}
                </div>
                <p className="text-sm text-gray-600">Líder</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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