"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Trophy, Calendar, BarChart3, Database } from "lucide-react"

// Mock data for admin
const mockMatches = [
  {
    id: 1,
    player1: 'Carlos Silva',
    player2: 'João Santos',
    round: '1ª Rodada',
    status: 'scheduled',
    scheduledAt: '2024-01-15T14:00:00Z'
  },
  {
    id: 2,
    player1: 'Pedro Oliveira',
    player2: 'Lucas Costa',
    round: '1ª Rodada',
    status: 'in_progress',
    scheduledAt: '2024-01-15T16:00:00Z'
  },
  {
    id: 3,
    player1: 'André Ferreira',
    player2: 'Rafael Lima',
    round: '1ª Rodada',
    status: 'finished',
    scheduledAt: '2024-01-14T14:00:00Z',
    winner: 'André Ferreira',
    score: '2-1'
  },
]

const mockUsers = [
  { id: 1, name: 'João Silva', email: 'joao@tcbb.com', role: 'USER', points: 347, predictions: 23 },
  { id: 2, name: 'Maria Santos', email: 'maria@tcbb.com', role: 'USER', points: 335, predictions: 21 },
  { id: 3, name: 'Admin TCBB', email: 'admin@tcbb.com', role: 'ADMIN', points: 0, predictions: 0 },
]

function MatchManagement() {
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null)
  const [matchResult, setMatchResult] = useState({
    winner: '',
    player1Sets: '',
    player2Sets: '',
    hadTiebreak: false,
    duration: ''
  })

  const handleSubmitResult = (matchId: number) => {
    // Submit match result logic
    console.log('Submitting result for match', matchId, matchResult)
    setSelectedMatch(null)
    setMatchResult({ winner: '', player1Sets: '', player2Sets: '', hadTiebreak: false, duration: '' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Gerenciar Partidas</h2>
        <p className="text-gray-600 mb-6">Registre os resultados das partidas</p>
      </div>

      <div className="grid gap-4">
        {mockMatches.map((match) => (
          <Card key={match.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {match.player1} vs {match.player2}
                </CardTitle>
                <Badge variant={
                  match.status === 'finished' ? 'default' : 
                  match.status === 'in_progress' ? 'secondary' : 'outline'
                }>
                  {match.status === 'finished' ? 'Finalizada' : 
                   match.status === 'in_progress' ? 'Em Andamento' : 'Agendada'}
                </Badge>
              </div>
              <CardDescription>
                {match.round} • {new Date(match.scheduledAt).toLocaleDateString('pt-BR')}
                {match.status === 'finished' && match.winner && (
                  <> • Vencedor: {match.winner} ({match.score})</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {match.status !== 'finished' && (
                <>
                  {selectedMatch === match.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`winner-${match.id}`}>Vencedor</Label>
                          <select 
                            id={`winner-${match.id}`}
                            className="w-full p-2 border rounded-md"
                            value={matchResult.winner}
                            onChange={(e) => setMatchResult(prev => ({ ...prev, winner: e.target.value }))}
                          >
                            <option value="">Selecione o vencedor</option>
                            <option value="player1">{match.player1}</option>
                            <option value="player2">{match.player2}</option>
                          </select>
                        </div>
                        <div>
                          <Label>Placar em Sets</Label>
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Sets P1"
                              value={matchResult.player1Sets}
                              onChange={(e) => setMatchResult(prev => ({ ...prev, player1Sets: e.target.value }))}
                            />
                            <Input
                              placeholder="Sets P2"
                              value={matchResult.player2Sets}
                              onChange={(e) => setMatchResult(prev => ({ ...prev, player2Sets: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Duração (minutos)</Label>
                          <Input
                            type="number"
                            placeholder="120"
                            value={matchResult.duration}
                            onChange={(e) => setMatchResult(prev => ({ ...prev, duration: e.target.value }))}
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <input
                            type="checkbox"
                            id={`tiebreak-${match.id}`}
                            checked={matchResult.hadTiebreak}
                            onChange={(e) => setMatchResult(prev => ({ ...prev, hadTiebreak: e.target.checked }))}
                          />
                          <Label htmlFor={`tiebreak-${match.id}`}>Teve tie-break</Label>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={() => handleSubmitResult(match.id)}>
                          Salvar Resultado
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedMatch(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => setSelectedMatch(match.id)}>
                      Registrar Resultado
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function UserManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Gerenciar Usuários</h2>
        <p className="text-gray-600 mb-6">Visualize e gerencie os participantes</p>
      </div>

      <div className="grid gap-4">
        {mockUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{user.name}</h3>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{user.points} pontos</div>
                  <div className="text-sm text-gray-600">{user.predictions} palpites</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function TournamentSettings() {
  const [tournamentName, setTournamentName] = useState("Torneio Interno TCBB 2024")
  const [startDate, setStartDate] = useState("2024-01-15")
  const [endDate, setEndDate] = useState("2024-02-15")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Configurações do Torneio</h2>
        <p className="text-gray-600 mb-6">Gerencie as configurações gerais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tournament-name">Nome do Torneio</Label>
            <Input
              id="tournament-name"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Data de Início</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Data de Término</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <Button>Salvar Configurações</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Statistics() {
  const stats = {
    totalUsers: 156,
    totalMatches: 32,
    completedMatches: 8,
    totalPredictions: 1247,
    averagePoints: 187
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Estatísticas</h2>
        <p className="text-gray-600 mb-6">Visão geral do torneio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-sm text-gray-600">Usuários Registrados</p>
            </div>
          </CardContent>
        </Card>
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
            <Calendar className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{stats.completedMatches}</div>
              <p className="text-sm text-gray-600">Partidas Concluídas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <BarChart3 className="h-8 w-8 text-orange-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{stats.totalPredictions}</div>
              <p className="text-sm text-gray-600">Total de Palpites</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Database className="h-8 w-8 text-red-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{stats.averagePoints}</div>
              <p className="text-sm text-gray-600">Pontos Médios</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Painel Administrativo
        </h1>
        <p className="text-gray-600">
          Gerencie o torneio, usuários e acompanhe estatísticas
        </p>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="matches" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="matches">Partidas</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="export">Exportar</TabsTrigger>
        </TabsList>

        <TabsContent value="matches">
          <MatchManagement />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="settings">
          <TournamentSettings />
        </TabsContent>

        <TabsContent value="stats">
          <Statistics />
        </TabsContent>

        <TabsContent value="export">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Exportar Dados</h2>
              <p className="text-gray-600 mb-6">Faça backup dos dados do torneio</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Opções de Exportação</CardTitle>
                <CardDescription>
                  Escolha os dados que deseja exportar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full">Exportar Ranking (CSV)</Button>
                <Button className="w-full" variant="outline">Exportar Palpites (CSV)</Button>
                <Button className="w-full" variant="outline">Exportar Partidas (CSV)</Button>
                <Button className="w-full" variant="outline">Backup Completo (JSON)</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}