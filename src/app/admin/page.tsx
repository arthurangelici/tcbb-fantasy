"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Button
} from "@/components/ui/button"
import {
  Input
} from "@/components/ui/input"
import {
  Label
} from "@/components/ui/label"
import {
  Badge
} from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Users,
  Trophy,
  Calendar,
  BarChart3,
  Lock,
  Trash2, // Adicionar ícone de lixeira
  Edit,   // Adicionar ícone de edição
  Save,   // Adicionar ícone de salvar
  XCircle // Adicionar ícone de cancelar
} from "lucide-react"
import { toast } from "react-hot-toast"

interface SetScore {
  p1: string;
  p2: string;
  tiebreak ? : string;
}

interface Match {
  id: number
  player1: string
  player2: string
  round: string
  category: string
  status: string
  scheduledAt: string
  winner ? : string
  setScores: SetScore[]
  player1Sets: number
  player2Sets: number
  hadTiebreak: boolean
  totalDuration ? : number
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
  const [matches, setMatches] = useState < Match[] > ([])
  const [selectedMatch, setSelectedMatch] = useState < number | null > (null)
  const [editingMatch, setEditingMatch] = useState < number | null > (null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [matchResult, setMatchResult] = useState({
    winner: '',
    sets: [{ p1: '', p2: '', tiebreak: '' }] as SetScore[],
    duration: '',
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

  useEffect(() => {
    // Reset round when category changes
    if (newMatch.category === 'RANKING_TCBB') {
      setNewMatch(prev => ({ ...prev, round: 'ROUND_1' }))
    } else {
      setNewMatch(prev => ({ ...prev, round: 'QUARTERFINALS' }))
    }
  }, [newMatch.category])

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

  const handleToggleResultForm = (match: Match) => {
    const isAlreadySelected = selectedMatch === match.id
    setSelectedMatch(isAlreadySelected ? null : match.id)

    if (!isAlreadySelected) {
      // Se a partida já terminou, preenche o formulário com os dados existentes
      if (match.status === 'FINISHED' && match.setScores) {
        setMatchResult({
          winner: match.winner || '',
          sets: match.setScores.map(s => ({ p1: String(s.p1), p2: String(s.p2), tiebreak: s.tiebreak ? String(s.tiebreak) : '' })),
          duration: match.totalDuration?.toString() ?? '',
        })
      } else {
        // Reseta para o estado inicial para um novo resultado
        setMatchResult({
          winner: '',
          sets: [{ p1: '', p2: '', tiebreak: '' }],
          duration: '',
        })
      }
    }
  }

  const handleEditMatch = (matchId: number, player1: string, player2: string) => {
    setEditingMatch(matchId)
    setMatchEdit({
      player1,
      player2
    })
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
        const { match: updatedMatch } = await response.json()
        setMatches(prevMatches => 
          prevMatches.map(m => m.id === matchId ? updatedMatch : m)
        );
        setEditingMatch(null)
        toast.success("Partida atualizada com sucesso!")
      } else {
        const { error } = await response.json()
        toast.error(`Erro ao salvar: ${error}`)
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
        const { match: newCreatedMatch } = await response.json();
        setMatches(prev => [newCreatedMatch, ...prev]);
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
    // Filtra sets vazios antes de enviar
    const validSets = matchResult.sets.filter(s => s.p1 !== '' || s.p2 !== '');
    if (validSets.length === 0) {
      alert("Por favor, preencha o placar de pelo menos um set.");
      return;
    }

    try {
      const response = await fetch('/api/admin/matches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId,
          winner: matchResult.winner,
          setScores: validSets.map(s => ({
            p1: parseInt(s.p1, 10),
            p2: parseInt(s.p2, 10),
            tiebreak: s.tiebreak,
          })),
          totalDuration: matchResult.duration ? parseInt(matchResult.duration, 10) : null,
        })
      })

      if (response.ok) {
        const { match: updatedMatch } = await response.json();
        setMatches(prevMatches => 
          prevMatches.map(m => m.id === matchId ? updatedMatch : m)
        );
        setSelectedMatch(null) // Fecha o formulário de resultado
        toast.success("Resultado da partida salvo com sucesso!")
      } else {
        const { error } = await response.json();
        toast.error(`Erro ao salvar resultado: ${error}`)
      }
    } catch (error) {
      console.error('Error saving match result:', error)
    }
  }

  const handleDeleteMatch = async (matchId: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta partida? Esta ação não pode ser desfeita.')) {
      try {
        const response = await fetch(`/api/admin/matches?id=${matchId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMatches(prev => prev.filter(match => match.id !== matchId));
        } else {
          const errorData = await response.json();
          console.error('Error deleting match:', errorData.error);
          alert(`Erro ao excluir partida: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error deleting match:', error);
        alert('Ocorreu um erro de rede ao tentar excluir a partida.');
      }
    }
  };

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
                  onChange={(e) => setNewMatch(prev => ({
                    ...prev,
                    player1Name: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="player2Name">Jogador 2</Label>
                <Input
                  id="player2Name"
                  placeholder="Nome do Jogador 2"
                  value={newMatch.player2Name}
                  onChange={(e) => setNewMatch(prev => ({
                    ...prev,
                    player2Name: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  className="w-full p-2 border rounded-md"
                  value={newMatch.category}
                  onChange={(e) => setNewMatch(prev => ({
                    ...prev,
                    category: e.target.value
                  }))}
                >
                  <option value="A">Categoria A</option>
                  <option value="B">Categoria B</option>
                  <option value="C">Categoria C</option>
                  <option value="ATP">ATP</option>
                  <option value="RANKING_TCBB">Ranking TCBB</option>
                </select>
              </div>
              <div>
                <Label htmlFor="round">Rodada</Label>
                <select
                  id="round"
                  className="w-full p-2 border rounded-md"
                  value={newMatch.round}
                  onChange={(e) => setNewMatch(prev => ({
                    ...prev,
                    round: e.target.value
                  }))}
                >
                  {newMatch.category === 'RANKING_TCBB' ? (
                    // Ranking TCBB rounds (1-9)
                    <>
                      <option value="ROUND_1">Rodada 1</option>
                      <option value="ROUND_2">Rodada 2</option>
                      <option value="ROUND_3">Rodada 3</option>
                      <option value="ROUND_4">Rodada 4</option>
                      <option value="ROUND_5">Rodada 5</option>
                      <option value="ROUND_6">Rodada 6</option>
                      <option value="ROUND_7">Rodada 7</option>
                      <option value="ROUND_8">Rodada 8</option>
                      <option value="ROUND_9">Rodada 9</option>
                    </>
                  ) : (
                    // Standard tournament format (A, B, C, ATP)
                    <>
                      <option value="FIRST_ROUND">1ª Rodada</option>
                      <option value="QUARTERFINALS">Quartas de Final</option>
                      <option value="SEMIFINALS">Semifinais</option>
                      <option value="FINAL">Final</option>
                    </>
                  )}
                </select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="scheduledAt">Data/Hora (Opcional)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={newMatch.scheduledAt}
                  onChange={(e) => setNewMatch(prev => ({
                    ...prev,
                    scheduledAt: e.target.value
                  }))}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <Card key={match.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {editingMatch === match.id ? (
                    <Input
                      value={matchEdit.player1}
                      onChange={(e) => setMatchEdit(prev => ({ ...prev, player1: e.target.value }))}
                    />
                  ) : (
                    match.player1
                  )} vs {editingMatch === match.id ? (
                    <Input
                      value={matchEdit.player2}
                      onChange={(e) => setMatchEdit(prev => ({ ...prev, player2: e.target.value }))}
                    />
                  ) : (
                    match.player2
                  )}
                </CardTitle>
                <Badge variant={match.status === 'FINISHED' ? 'default' : 'secondary'}>
                  {match.status}
                </Badge>
              </div>
              <CardDescription>
                {match.round} - Categoria {match.category}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-sm text-gray-600 space-y-2">
                <div>
                  <span className="font-semibold">Placar:</span>
                  {match.status === 'FINISHED' && match.setScores && match.setScores.length > 0 ? (
                     <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
                      {match.setScores.map(set => `${set.p1}-${set.p2}${set.tiebreak ? `(${set.tiebreak})` : ''}`).join(', ')}
                    </span>
                  ) : (
                    <span className="italic"> Aguardando resultado</span>
                  )}
                </div>
                {match.status === 'FINISHED' && match.winner && (
                  <div>
                    <span className="font-semibold">Vencedor:</span>
                    <span> {match.winner === 'PLAYER1' ? match.player1 : match.player2}</span>
                  </div>
                )}
              </div>

              {selectedMatch !== match.id && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => handleToggleResultForm(match)}
                >
                  {match.status === 'FINISHED' ? 'Editar Resultado' : 'Registrar Resultado'}
                </Button>
              )}

              {selectedMatch === match.id && (
                <Card className="mt-4 bg-gray-50 dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-base">Registrar / Editar Resultado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="winner">Vencedor</Label>
                      <select
                        id="winner"
                        className="w-full p-2 border rounded-md"
                        value={matchResult.winner}
                        onChange={(e) => setMatchResult(prev => ({ ...prev, winner: e.target.value }))}
                      >
                        <option value="">Selecione o vencedor</option>
                        <option value="PLAYER1">{match.player1}</option>
                        <option value="PLAYER2">{match.player2}</option>
                      </select>
                    </div>

                    {/* Dynamic Set Score Inputs */}
                    <div className="space-y-3">
                      <Label>Placar dos Sets</Label>
                      {matchResult.sets.map((set, index) => (
                        <div key={index} className="grid grid-cols-5 gap-2 items-center">
                          <Input
                            className="col-span-2"
                            type="number"
                            placeholder="P1"
                            value={set.p1}
                            onChange={(e) => {
                              const newSets = [...matchResult.sets];
                              newSets[index].p1 = e.target.value;
                              setMatchResult(prev => ({ ...prev, sets: newSets }));
                            }}
                          />
                          <Input
                            className="col-span-2"
                            type="number"
                            placeholder="P2"
                            value={set.p2}
                            onChange={(e) => {
                              const newSets = [...matchResult.sets];
                              newSets[index].p2 = e.target.value;
                              setMatchResult(prev => ({ ...prev, sets: newSets }));
                            }}
                          />
                           <Input
                            className="col-span-1"
                            type="text"
                            placeholder="TB"
                            value={set.tiebreak}
                            onChange={(e) => {
                              const newSets = [...matchResult.sets];
                              newSets[index].tiebreak = e.target.value;
                              setMatchResult(prev => ({ ...prev, sets: newSets }));
                            }}
                          />
                        </div>
                      ))}
                       <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => setMatchResult(prev => ({ ...prev, sets: [...prev.sets, { p1: '', p2: '', tiebreak: '' }] }))}
                      >
                        Adicionar Set
                      </Button>
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Duração Total (minutos)</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="Ex: 90"
                        value={matchResult.duration}
                        onChange={(e) => setMatchResult(prev => ({ ...prev, duration: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="ghost" onClick={() => setSelectedMatch(null)}>Cancelar</Button>
                      <Button onClick={() => handleSaveResult(match.id)}>Salvar Resultado</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
            <div className="p-4 border-t flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {new Date(match.scheduledAt).toLocaleString('pt-BR')}
              </p>
              <div className="flex items-center space-x-2">
                {editingMatch === match.id ? (
                  <>
                    <Button size="icon" variant="ghost" onClick={() => handleSaveMatchEdit(match.id)}><Save className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditingMatch(null)}><XCircle className="h-4 w-4" /></Button>
                  </>
                ) : (
                  <Button size="icon" variant="ghost" onClick={() => handleEditMatch(match.id, match.player1, match.player2)}><Edit className="h-4 w-4" /></Button>
                )}
                <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDeleteMatch(match.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        ))}

      </div>
    </div>
  )
}

function UserManagement() {
  const [users, setUsers] = useState < User[] > ([])
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
        const formattedUsers = data.ranking.map((user: {
            id: number;
            name: string;
            email: string;
            pointsByCategory: {
              general: number
            };
            predictionsByCategory: {
              general: {
                total: number
              }
            }
          }) => ({
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
  const {
    data: session,
    status
  } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalMatches: 0,
    completedMatches: 0,
    totalUsers: 0,
    totalPredictions: 0
  })

  const checkAdminAccess = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/matches')
      if (!response.ok) {
        router.push('/dashboard')
      }
    } catch {
      router.push('/dashboard')
    }
  }, [router])

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
            (acc: number, user: {
              predictionsByCategory: {
                general: {
                  total: number
                }
              }
            }) => acc + user.predictionsByCategory.general.total, 0
          )
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    if (status === 'loading') return

    // CORREÇÃO: Removidos espaços inválidos na verificação
    if (!session?.user?.email) {
      router.push('/login')
      return
    }

    const initializeAdmin = async () => {
      await checkAdminAccess()
      await fetchStats()
    }

    initializeAdmin()
    // CORREÇÃO: Corrigido o nome da função no array de dependências
  }, [session, status, router, checkAdminAccess])

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