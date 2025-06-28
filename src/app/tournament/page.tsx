"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Users, Target } from "lucide-react"

// Mock tournament data with simplified bracket structure (only quarterfinals, semifinals, finals)
const mockTournamentData = {
  A: {
    rounds: [
      {
        name: 'Quartas de Final - Categoria A',
        matches: [
          { id: 10, player1: 'Carlos Silva', player2: 'André Ferreira', winner: 'Carlos Silva', score: '2-1', completed: true, category: 'A' },
          { id: 11, player1: 'Felipe Alves', player2: 'Roberto Souza', winner: 'Felipe Alves', score: '2-0', completed: true, category: 'A' },
          { id: 12, player1: 'Bruno Martins', player2: 'João Santos', winner: null, score: null, completed: false, category: 'A' },
          { id: 13, player1: 'Pedro Oliveira', player2: 'Lucas Costa', winner: null, score: null, completed: false, category: 'A' },
        ]
      },
      {
        name: 'Semifinais - Categoria A',
        matches: [
          { id: 14, player1: 'Carlos Silva', player2: 'Felipe Alves', winner: null, score: null, completed: false, category: 'A' },
          { id: 15, player1: 'TBD', player2: 'TBD', winner: null, score: null, completed: false, category: 'A' },
        ]
      },
      {
        name: 'Final - Categoria A',
        matches: [
          { id: 16, player1: 'TBD', player2: 'TBD', winner: null, score: null, completed: false, category: 'A' },
        ]
      }
    ]
  },
  B: {
    rounds: [
      {
        name: 'Quartas de Final - Categoria B',
        matches: [
          { id: 20, player1: 'Thiago Carvalho', player2: 'Mateus Barbosa', winner: 'Thiago Carvalho', score: '2-0', completed: true, category: 'B' },
          { id: 21, player1: 'Gustavo Melo', player2: 'Rodrigo Freitas', winner: 'Gustavo Melo', score: '2-1', completed: true, category: 'B' },
          { id: 22, player1: 'Caio Ribeiro', player2: 'Fábio Mendes', winner: null, score: null, completed: false, category: 'B' },
          { id: 23, player1: 'Leonardo Dias', player2: 'Ricardo Gomes', winner: null, score: null, completed: false, category: 'B' },
        ]
      },
      {
        name: 'Semifinais - Categoria B',
        matches: [
          { id: 24, player1: 'Thiago Carvalho', player2: 'Gustavo Melo', winner: null, score: null, completed: false, category: 'B' },
          { id: 25, player1: 'TBD', player2: 'TBD', winner: null, score: null, completed: false, category: 'B' },
        ]
      },
      {
        name: 'Final - Categoria B',
        matches: [
          { id: 26, player1: 'TBD', player2: 'TBD', winner: null, score: null, completed: false, category: 'B' },
        ]
      }
    ]
  },
  C: {
    rounds: [
      {
        name: 'Quartas de Final - Categoria C',
        matches: [
          { id: 30, player1: 'Kleber Pinto', player2: 'Leandro Faria', winner: 'Kleber Pinto', score: '2-0', completed: true, category: 'C' },
          { id: 31, player1: 'Nathan Correia', player2: 'Paulo Vieira', winner: 'Nathan Correia', score: '2-1', completed: true, category: 'C' },
          { id: 32, player1: 'Sérgio Cunha', player2: 'Wagner Araújo', winner: null, score: null, completed: false, category: 'C' },
          { id: 33, player1: 'Julio Cardoso', player2: 'Márcio Teixeira', winner: null, score: null, completed: false, category: 'C' },
        ]
      },
      {
        name: 'Semifinais - Categoria C',
        matches: [
          { id: 34, player1: 'Kleber Pinto', player2: 'Nathan Correia', winner: null, score: null, completed: false, category: 'C' },
          { id: 35, player1: 'TBD', player2: 'TBD', winner: null, score: null, completed: false, category: 'C' },
        ]
      },
      {
        name: 'Final - Categoria C',
        matches: [
          { id: 36, player1: 'TBD', player2: 'TBD', winner: null, score: null, completed: false, category: 'C' },
        ]
      }
    ]
  }
}

interface Match {
  id: number
  player1: string
  player2: string
  winner: string | null
  score: string | null
  completed: boolean
  category: string
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
  const [selectedCategory, setSelectedCategory] = useState<'A' | 'B' | 'C' | 'ALL'>('ALL')
  const [selectedRound, setSelectedRound] = useState<string | null>(null)

  // Get tournament data based on selected category
  const getTournamentData = () => {
    if (selectedCategory === 'ALL') {
      // Combine all categories
      const allRounds = []
      for (const [, data] of Object.entries(mockTournamentData)) {
        allRounds.push(...data.rounds)
      }
      return { rounds: allRounds }
    } else {
      return mockTournamentData[selectedCategory] || { rounds: [] }
    }
  }

  const tournamentData = getTournamentData()

  const stats = {
    totalMatches: Object.values(mockTournamentData).reduce((acc, cat) => 
      acc + cat.rounds.reduce((roundAcc, round) => roundAcc + round.matches.length, 0), 0
    ),
    completedMatches: Object.values(mockTournamentData).reduce((acc, cat) => 
      acc + cat.rounds.reduce((roundAcc, round) => 
        roundAcc + round.matches.filter(match => match.completed).length, 0
      ), 0
    ),
    remainingMatches: Object.values(mockTournamentData).reduce((acc, cat) => 
      acc + cat.rounds.reduce((roundAcc, round) => 
        roundAcc + round.matches.filter(match => !match.completed).length, 0
      ), 0
    ),
    activePlayers: 35
  }

  // Category-specific stats
  const getCategoryStats = (category: 'A' | 'B' | 'C') => {
    const catData = mockTournamentData[category]
    return {
      total: catData.rounds.reduce((acc, round) => acc + round.matches.length, 0),
      completed: catData.rounds.reduce((acc, round) => 
        acc + round.matches.filter(match => match.completed).length, 0
      )
    }
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
          {['A', 'B', 'C'].map((category) => {
            const catStats = getCategoryStats(category as 'A' | 'B' | 'C')
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category as 'A' | 'B' | 'C')}
                className="relative"
              >
                Categoria {category}
                <span className="ml-2 text-xs bg-white bg-opacity-20 px-1 rounded">
                  {catStats.completed}/{catStats.total}
                </span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Round Filter */}
      {tournamentData.rounds.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedRound === null ? "default" : "outline"}
              onClick={() => setSelectedRound(null)}
            >
              Todas as Fases
            </Button>
            {tournamentData.rounds.map((round) => (
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
      {tournamentData.rounds.length > 0 ? (
        <div className="space-y-12">
          {tournamentData.rounds
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
      {selectedCategory === 'ALL' && (
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
                {['A', 'B', 'C'].map((category) => {
                  const catStats = getCategoryStats(category as 'A' | 'B' | 'C')
                  const progressPercentage = catStats.total > 0 ? (catStats.completed / catStats.total) * 100 : 0

                  return (
                    <div key={category} className="flex items-center space-x-4">
                      <div className="w-32 text-sm font-medium">Categoria {category}</div>
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