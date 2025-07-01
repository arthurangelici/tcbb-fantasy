"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Users, Target } from "lucide-react"

interface Match {
  id: number
  player1: string
  player2: string
  winner: string | null
  score: string | null
  completed: boolean
  category: string
}

interface TournamentData {
  [category: string]: {
    rounds: Array<{
      name: string
      matches: Match[]
    }>
  }
}

interface TournamentStats {
  totalMatches: number
  completedMatches: number
  remainingMatches: number
  activePlayers: number
}

interface CategoryStats {
  [category: string]: {
    total: number
    completed: number
  }
}

function MatchCard({ match }: { match: Match }) {
  return (
    <Card className={`w-64 ${match.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50'}`}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className={`flex items-center justify-between p-2 rounded ${
            match.winner === match.player1 ? 'bg-emerald-100 font-semibold' : 'bg-white'
          }`}>
            <span className="text-sm">{match.player1}</span>
            {match.completed && match.winner === match.player1 && (
              <Trophy className="h-4 w-4 text-emerald-600" />
            )}
          </div>
          <div className="text-center text-xs text-gray-500 font-medium">
            {match.completed ? match.score : 'vs'}
          </div>
          <div className={`flex items-center justify-between p-2 rounded ${
            match.winner === match.player2 ? 'bg-emerald-100 font-semibold' : 'bg-white'
          }`}>
            <span className="text-sm">{match.player2}</span>
            {match.completed && match.winner === match.player2 && (
              <Trophy className="h-4 w-4 text-emerald-600" />
            )}
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
            match.completed 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {match.completed ? 'Finalizada' : 'Agendada'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TournamentPage() {
  const [selectedCategory, setSelectedCategory] = useState<'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB' | 'ALL'>('ALL')
  const [selectedRound, setSelectedRound] = useState<string | null>(null)
  const [tournamentData, setTournamentData] = useState<TournamentData>({})
  const [stats, setStats] = useState<TournamentStats | null>(null)
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({})
  const [loading, setLoading] = useState(true)

  const fetchTournamentData = useCallback(async () => {
    try {
      setLoading(true)
      const categoryParam = selectedCategory === 'ALL' ? '' : `?category=${selectedCategory}`
      const response = await fetch(`/api/tournament${categoryParam}`)
      if (response.ok) {
        const data = await response.json()
        setTournamentData(data.tournamentData)
        setStats(data.stats)
        setCategoryStats(data.categoryStats)
      }
    } catch (error) {
      console.error('Error fetching tournament data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchTournamentData()
  }, [selectedCategory, fetchTournamentData])

  // Get tournament data based on selected category
  const getTournamentData = () => {
    if (selectedCategory === 'ALL') {
      // Combine all categories
      const allRounds = []
      for (const [, data] of Object.entries(tournamentData)) {
        allRounds.push(...data.rounds)
      }
      return { rounds: allRounds }
    } else {
      return tournamentData[selectedCategory] || { rounds: [] }
    }
  }

  const currentTournamentData = getTournamentData()

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
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="flex gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="w-64 h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
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
          Chaveamento do Torneio
        </h1>
        <p className="text-gray-600">
          Acompanhe o progresso do torneio interno de tênis do TCBB por categoria
        </p>
      </div>

      {/* Tournament Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <Trophy className="h-8 w-8 text-emerald-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{stats.totalMatches}</div>
                <p className="text-sm text-gray-600">Total de Partidas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Target className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{stats.completedMatches}</div>
                <p className="text-sm text-gray-600">Finalizadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-orange-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{stats.remainingMatches}</div>
                <p className="text-sm text-gray-600">Restantes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{stats.activePlayers}</div>
                <p className="text-sm text-gray-600">Participantes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Filtrar por Categoria</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'ALL' ? "default" : "outline"}
            onClick={() => setSelectedCategory('ALL')}
          >
            Todas as Categorias
          </Button>
          {['A', 'B', 'C', 'ATP', 'RANKING_TCBB'].map((category) => {
            const catStats = categoryStats[category] || { total: 0, completed: 0 }
            const displayName = category === 'ATP' ? 'ATP' : category === 'RANKING_TCBB' ? 'Ranking TCBB' : `Categoria ${category}`
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category as 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB')}
                className="relative"
              >
                {displayName}
                <span className="ml-2 text-xs bg-white bg-opacity-20 px-1 rounded">
                  {catStats.completed}/{catStats.total}
                </span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Round Filter */}
      {currentTournamentData.rounds.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedRound === null ? "default" : "outline"}
              onClick={() => setSelectedRound(null)}
            >
              Todas as Fases
            </Button>
            {currentTournamentData.rounds.map((round) => (
              <Button
                key={round.name}
                variant={selectedRound === round.name ? "default" : "outline"}
                onClick={() => setSelectedRound(round.name)}
              >
                {round.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Tournament Bracket */}
      {currentTournamentData.rounds.length > 0 ? (
        <div className="space-y-12">
          {currentTournamentData.rounds
            .filter(round => selectedRound === null || round.name === selectedRound)
            .map((round) => (
              <div key={round.name}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  {round.name}
                </h2>
                <div className="flex flex-wrap justify-center gap-6">
                  {round.matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma partida encontrada
          </h3>
          <p className="text-gray-600">
            Selecione uma categoria para ver as partidas
          </p>
        </div>
      )}

      {/* Tournament Progress by Category */}
      {selectedCategory === 'ALL' && Object.keys(categoryStats).length > 0 && (
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Progresso por Categoria</CardTitle>
              <CardDescription>
                Acompanhe o andamento de cada categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['A', 'B', 'C', 'ATP', 'RANKING_TCBB'].map((category) => {
                  const catStats = categoryStats[category] || { total: 0, completed: 0 }
                  const progressPercentage = catStats.total > 0 ? (catStats.completed / catStats.total) * 100 : 0
                  const displayName = category === 'ATP' ? 'ATP' : category === 'RANKING_TCBB' ? 'Ranking TCBB' : `Categoria ${category}`

                  return (
                    <div key={category} className="flex items-center space-x-4">
                      <div className="w-32 text-sm font-medium">{displayName}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-600 w-20">
                        {catStats.completed}/{catStats.total}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}