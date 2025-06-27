"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Users, Target } from "lucide-react"

// Mock tournament data
const mockTournament = {
  rounds: [
    {
      name: '1ª Rodada',
      matches: [
        { id: 1, player1: 'Carlos Silva', player2: 'João Santos', winner: 'Carlos Silva', score: '2-1', completed: true },
        { id: 2, player1: 'Pedro Oliveira', player2: 'Lucas Costa', winner: 'Pedro Oliveira', score: '2-0', completed: true },
        { id: 3, player1: 'André Ferreira', player2: 'Rafael Lima', winner: null, score: null, completed: false },
        { id: 4, player1: 'Bruno Martins', player2: 'Gabriel Rocha', winner: null, score: null, completed: false },
        { id: 5, player1: 'Felipe Alves', player2: 'Marcos Pereira', winner: null, score: null, completed: false },
        { id: 6, player1: 'Roberto Souza', player2: 'Diego Nascimento', winner: null, score: null, completed: false },
        { id: 7, player1: 'Thiago Carvalho', player2: 'Ricardo Gomes', winner: null, score: null, completed: false },
        { id: 8, player1: 'Mateus Barbosa', player2: 'Leonardo Dias', winner: null, score: null, completed: false },
      ]
    },
    {
      name: 'Oitavas de Final',
      matches: [
        { id: 9, player1: 'Carlos Silva', player2: 'Pedro Oliveira', winner: null, score: null, completed: false },
        { id: 10, player1: 'TBD', player2: 'TBD', winner: null, score: null, completed: false },
        { id: 11, player1: 'TBD', player2: 'TBD', winner: null, score: null, completed: false },
        { id: 12, player1: 'TBD', player2: 'TBD', winner: null, score: null, completed: false },
      ]
    },
    {
      name: 'Quartas de Final',
      matches: [
        { id: 13, player1: 'TBD', player2: 'TBD', winner: null, score: null, completed: false },
        { id: 14, player1: 'TBD', player2: 'TBD', winner: null, score: null, completed: false },
      ]
    },
    {
      name: 'Semifinais',
      matches: [
        { id: 15, player1: 'TBD', player2: 'TBD', winner: null, score: null, completed: false },
      ]
    },
    {
      name: 'Final',
      matches: [
        { id: 16, player1: 'TBD', player2: 'TBD', winner: null, score: null, completed: false },
      ]
    }
  ]
}

interface Match {
  id: number
  player1: string
  player2: string
  winner: string | null
  score: string | null
  completed: boolean
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
  const [selectedRound, setSelectedRound] = useState<string | null>(null)

  const stats = {
    totalMatches: mockTournament.rounds.reduce((acc, round) => acc + round.matches.length, 0),
    completedMatches: mockTournament.rounds.reduce((acc, round) => 
      acc + round.matches.filter(match => match.completed).length, 0
    ),
    remainingMatches: mockTournament.rounds.reduce((acc, round) => 
      acc + round.matches.filter(match => !match.completed).length, 0
    ),
    activePlayers: 35
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Chaveamento do Torneio
        </h1>
        <p className="text-gray-600">
          Acompanhe o progresso do torneio interno de tênis do TCBB
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

      {/* Round Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedRound === null ? "default" : "outline"}
            onClick={() => setSelectedRound(null)}
          >
            Todas as Fases
          </Button>
          {mockTournament.rounds.map((round) => (
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

      {/* Tournament Bracket */}
      <div className="space-y-12">
        {mockTournament.rounds
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

      {/* Tournament Progress */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Progresso do Torneio</CardTitle>
            <CardDescription>
              Acompanhe o andamento de cada fase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTournament.rounds.map((round) => {
                const completedInRound = round.matches.filter(match => match.completed).length
                const totalInRound = round.matches.length
                const progressPercentage = (completedInRound / totalInRound) * 100

                return (
                  <div key={round.name} className="flex items-center space-x-4">
                    <div className="w-32 text-sm font-medium">{round.name}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 w-20">
                      {completedInRound}/{totalInRound}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}