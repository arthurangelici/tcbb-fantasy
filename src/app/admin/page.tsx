"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Trophy, Calendar, BarChart3, Database, Lock } from "lucide-react"

// Mock data for admin - Enhanced with bracket structure (quarterfinals, semifinals, finals only)
const mockMatches = [
  // Category A - Quarterfinals
  {
    id: 10,
    player1: 'Carlos Silva',
    player2: 'André Ferreira',
    round: 'Quartas de Final',
    category: 'A',
    status: 'finished',
    scheduledAt: '2024-01-20T14:00:00Z',
    winner: 'Carlos Silva',
    score: '2-1'
  },
  {
    id: 11,
    player1: 'Felipe Alves',
    player2: 'Roberto Souza',
    round: 'Quartas de Final',
    category: 'A',
    status: 'finished',
    scheduledAt: '2024-01-20T16:00:00Z',
    winner: 'Felipe Alves',
    score: '2-0'
  },
  {
    id: 12,
    player1: 'Bruno Martins',
    player2: 'João Santos',
    round: 'Quartas de Final',
    category: 'A',
    status: 'scheduled',
    scheduledAt: '2024-01-21T14:00:00Z'
  },
  {
    id: 13,
    player1: 'Pedro Oliveira',
    player2: 'Lucas Costa',
    round: 'Quartas de Final',
    category: 'A',
    status: 'scheduled',
    scheduledAt: '2024-01-21T16:00:00Z'
  },
  // Category A - Semifinals
  {
    id: 14,
    player1: 'Carlos Silva',
    player2: 'Felipe Alves',
    round: 'Semifinais',
    category: 'A',
    status: 'scheduled',
    scheduledAt: '2024-01-22T14:00:00Z'
  },
  {
    id: 15,
    player1: 'TBD',
    player2: 'TBD',
    round: 'Semifinais',
    category: 'A',
    status: 'scheduled',
    scheduledAt: '2024-01-22T16:00:00Z'
  },
  // Category A - Final
  {
    id: 16,
    player1: 'TBD',
    player2: 'TBD',
    round: 'Final',
    category: 'A',
    status: 'scheduled',
    scheduledAt: '2024-01-23T14:00:00Z'
  }
]

const mockUsers = [
  { id: 1, name: 'João Silva', email: 'joao@tcbb.com', role: 'USER', points: 347, predictions: 23 },
  { id: 2, name: 'Maria Santos', email: 'maria@tcbb.com', role: 'USER', points: 335, predictions: 21 },
  { id: 3, name: 'Admin TCBB', email: 'admin@tcbb.com', role: 'ADMIN', points: 0, predictions: 0 },
]

function MatchManagement() {
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null)
  const [editingMatch, setEditingMatch] = useState<number | null>(null)
  const [matchResult, setMatchResult] = useState({
    winner: '',
    player1Sets: '',
    player2Sets: '',
    hadTiebreak: false,
    duration: ''
  })
  const [matchEdit, setMatchEdit] = useState({
    player1: '',
    player2: ''
  })

  const handleSubmitResult = (matchId: number) => {
    // Submit match result logic
    console.log('Submitting result for match', matchId, matchResult)
    setSelectedMatch(null)
    setMatchResult({ winner: '', player1Sets: '', player2Sets: '', hadTiebreak: false, duration: '' })
  }

  const handleEditMatch = (matchId: number, player1: string, player2: string) => {
    setEditingMatch(matchId)
    setMatchEdit({ player1, player2 })
  }

  const handleSaveMatchEdit = (matchId: number) => {
    // Save match edit logic
    console.log('Saving match edit for match', matchId, matchEdit)
    setEditingMatch(null)
    setMatchEdit({ player1: '', player2: '' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Gerenciar Partidas</h2>
        <p className="text-gray-600 mb-6">Registre os resultados das partidas e edite informações do chaveamento</p>
      </div>

      <div className="grid gap-4">
        {mockMatches.map((match) => (
          <Card key={match.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {editingMatch === match.id ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={matchEdit.player1}
                        onChange={(e) => setMatchEdit(prev => ({ ...prev, player1: e.target.value }))}
                        placeholder="Jogador 1"
                        className="w-40"
                      />
                      <span>vs</span>
                      <Input
                        value={matchEdit.player2}
                        onChange={(e) => setMatchEdit(prev => ({ ...prev, player2: e.target.value }))}
                        placeholder="Jogador 2"
                        className="w-40"
                      />
                    </div>
                  ) : (
                    <span>{match.player1} vs {match.player2}</span>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    match.status === 'finished' ? 'default' : 
                    match.status === 'in_progress' ? 'secondary' : 'outline'
                  }>
                    {match.status === 'finished' ? 'Finalizada' : 
                     match.status === 'in_progress' ? 'Em Andamento' : 'Agendada'}
                  </Badge>
                  <Badge variant="outline">Categoria {match.category}</Badge>
                </div>
              </div>
              <CardDescription>
                {match.round} • {new Date(match.scheduledAt).toLocaleDateString('pt-BR')}
                {match.status === 'finished' && match.winner && (
                  <> • Vencedor: {match.winner} ({match.score})</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {editingMatch === match.id ? (
                  <>
                    <Button onClick={() => handleSaveMatchEdit(match.id)}>
                      Salvar Edição
                    </Button>
                    <Button variant="outline" onClick={() => setEditingMatch(null)}>
                      Cancelar Edição
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => handleEditMatch(match.id, match.player1, match.player2)}
                  >
                    Editar Jogadores
                  </Button>
                )}

                {match.status !== 'finished' && (
                  <>
                    {selectedMatch === match.id ? (
                      <div className="w-full mt-4 space-y-4">
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
              </div>
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
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push("/login")
      return
    }

    if (session.user.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }
  }, [session, status, router])

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando permissões...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show access denied if not admin
  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center p-8">
              <Lock className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
              <p className="text-gray-600 text-center mb-4">
                Você precisa ser administrador para acessar esta página.
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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