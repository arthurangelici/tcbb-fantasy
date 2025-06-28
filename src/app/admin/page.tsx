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
import { Users, Trophy, Calendar, BarChart3, Lock } from "lucide-react"

interface Match {
  id: number
  player1: string
  player2: string
  round: string
  category: string
  status: string
  scheduledAt: string
  winner?: string
  score?: string
  player1Sets: number
  player2Sets: number
  hadTiebreak: boolean
  totalDuration?: number
}

interface User {
  id: number
  name: string
  email: string
  role: string
  points: number
  predictions: number
}

function MatchManagement() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null)
  const [editingMatch, setEditingMatch] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [matchResult, setMatchResult] = useState({
    winner: '',
    player1Sets: '',
    player2Sets: '',
    duration: '',
    hadTiebreak: false
  })
  const [matchEdit, setMatchEdit] = useState({
    player1: '',
    player2: ''
  })
  const [newMatch, setNewMatch] = useState({
    player1Name: '',
    player2Name: '',
    category: 'A',
    round: 'QUARTERFINALS',
    scheduledAt: ''
  })

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/matches')
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditMatch = (matchId: number, player1: string, player2: string) => {
    setEditingMatch(matchId)
    setMatchEdit({ player1, player2 })
  }

  const handleSaveMatchEdit = async (matchId: number) => {
    try {
      const response = await fetch('/api/admin/matches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          player1: matchEdit.player1,
          player2: matchEdit.player2
        })
      })

      if (response.ok) {
        await fetchMatches()
        setEditingMatch(null)
      }
    } catch (error) {
      console.error('Error saving match edit:', error)
    }
  }

  const handleCreateMatch = async () => {
    try {
      const response = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMatch)
      })

      if (response.ok) {
        await fetchMatches()
        setShowCreateForm(false)
        setNewMatch({
          player1Name: '',
          player2Name: '',
          category: 'A',
          round: 'QUARTERFINALS',
          scheduledAt: ''
        })
      } else {
        const errorData = await response.json()
        console.error('Error creating match:', errorData.error)
      }
    } catch (error) {
      console.error('Error creating match:', error)
    }
  }

  const handleSaveResult = async (matchId: number) => {
    try {
      const response = await fetch('/api/admin/matches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          winner: matchResult.winner,
          player1Sets: matchResult.player1Sets,
          player2Sets: matchResult.player2Sets,
          hadTiebreak: matchResult.hadTiebreak,
          totalDuration: matchResult.duration
        })
      })

      if (response.ok) {
        await fetchMatches()
        setSelectedMatch(null)
        setMatchResult({
          winner: '',
          player1Sets: '',
          player2Sets: '',
          duration: '',
          hadTiebreak: false
        })
      }
    } catch (error) {
      console.error('Error saving match result:', error)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciar Partidas</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{matches.length} partidas</Badge>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancelar' : 'Criar Nova Partida'}
          </Button>
        </div>
      </div>

      {/* Create Match Form */}
      {showCreateForm && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle>Criar Nova Partida</CardTitle>
            <CardDescription>
              Adicione uma nova partida ao torneio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="player1Name">Jogador 1</Label>
                <Input
                  id="player1Name"
                  placeholder="Nome do Jogador 1"
                  value={newMatch.player1Name}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, player1Name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="player2Name">Jogador 2</Label>
                <Input
                  id="player2Name"
                  placeholder="Nome do Jogador 2"
                  value={newMatch.player2Name}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, player2Name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  className="w-full p-2 border rounded-md"
                  value={newMatch.category}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="A">Categoria A</option>
                  <option value="B">Categoria B</option>
                  <option value="C">Categoria C</option>
                </select>
              </div>
              <div>
                <Label htmlFor="round">Rodada</Label>
                <select
                  id="round"
                  className="w-full p-2 border rounded-md"
                  value={newMatch.round}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, round: e.target.value }))}
                >
                  <option value="QUARTERFINALS">Quartas de Final</option>
                  <option value="SEMIFINALS">Semifinais</option>
                  <option value="FINAL">Final</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="scheduledAt">Data/Hora (Opcional)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={newMatch.scheduledAt}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, scheduledAt: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button onClick={handleCreateMatch}>
                Criar Partida
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {matches.map((match) => (
          <Card key={match.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {editingMatch === match.id ? (
                    <div className="flex space-x-2">
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
                          <Button onClick={() => handleSaveResult(match.id)}>
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
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ranking')
      if (response.ok) {
        const data = await response.json()
        const formattedUsers = data.ranking.map((user: { id: number; name: string; email: string; pointsByCategory: { general: number }; predictionsByCategory: { general: { total: number } } }) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'USER',
          points: user.pointsByCategory.general,
          predictions: user.predictionsByCategory.general.total
        }))
        setUsers(formattedUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
        <Badge variant="secondary">{users.length} usuários</Badge>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{user.points} pontos</div>
                <div className="text-sm text-gray-600">{user.predictions} palpites</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalMatches: 0,
    completedMatches: 0,
    totalUsers: 0,
    totalPredictions: 0
  })

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/admin/matches')
      if (!response.ok) {
        router.push('/dashboard')
      }
    } catch {
      router.push('/dashboard')
    }
  }

  const fetchStats = async () => {
    try {
      const [tournamentResponse, rankingResponse] = await Promise.all([
        fetch('/api/tournament'),
        fetch('/api/ranking')
      ])

      if (tournamentResponse.ok && rankingResponse.ok) {
        const tournamentData = await tournamentResponse.json()
        const rankingData = await rankingResponse.json()

        setStats({
          totalMatches: tournamentData.stats.totalMatches,
          completedMatches: tournamentData.stats.completedMatches,
          totalUsers: rankingData.stats.totalPlayers,
          totalPredictions: rankingData.ranking.reduce(
            (acc: number, user: { predictionsByCategory: { general: { total: number } } }) => acc + user.predictionsByCategory.general.total, 0
          )
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user?.email) {
      router.push('/login')
      return
    }

    const initializeAdmin = async () => {
      await checkAdminAccess()
      await fetchStats()
    }

    initializeAdmin()
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600">
            Gerencie partidas, usuários e configurações do torneio
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Lock className="h-5 w-5 text-red-600" />
          <Badge variant="destructive">Admin</Badge>
        </div>
      </div>

      {/* Stats */}
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
            <Calendar className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{stats.completedMatches}</div>
              <p className="text-sm text-gray-600">Partidas Finalizadas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
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
      </div>

      {/* Main Content */}
      <Tabs defaultValue="matches" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="matches">Gerenciar Partidas</TabsTrigger>
          <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="matches">
          <MatchManagement />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}