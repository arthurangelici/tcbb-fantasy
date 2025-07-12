"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Target, Clock, TrendingUp, Star, Check, Edit } from "lucide-react"
import { toast } from "react-hot-toast"

interface Match {
  id: number
  player1: { name: string; ranking: number }
  player2: { name: string; ranking: number }
  scheduledAt: string
  status: string
  round: string
  canPredict: boolean
  category: string
  existingPrediction?: {
    winner?: string | null
    setScores?: { p1: number; p2: number }[] | null
  }
}

interface Category {
  id: string
  name: string
  description: string
}

interface TournamentBet {
  type: string
  label: string
  points: number
  description: string
}

interface Prediction {
  winner?: string
  setScores?: { p1: number; p2: number; tiebreak?: string }[]
}

function MatchPredictionCard({ match }: { match: Match }) {
  const { data: session } = useSession()
  const [prediction, setPrediction] = useState<Prediction>({
    setScores: [{ p1: 0, p2: 0, tiebreak: '' }]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)

  // Load existing prediction when component mounts or match changes
  useEffect(() => {
    if (match.existingPrediction) {
      setPrediction({
        winner: match.existingPrediction.winner || undefined,
        setScores: match.existingPrediction.setScores || [{ p1: 0, p2: 0, tiebreak: '' }]
      })
      setHasSaved(true) // Mark as saved if there's an existing prediction
    }
  }, [match])

  const handleSubmit = async () => {
    if (!session?.user || !prediction.winner) return
    
    // Validate set scores - at least 1 set must be provided
    if (!prediction.setScores || prediction.setScores.length < 1) return
    
    // Check that all sets have valid scores
    const hasValidScores = prediction.setScores.every(set => 
      set.p1 >= 0 && set.p2 >= 0 && (set.p1 > 0 || set.p2 > 0)
    )
    if (!hasValidScores) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: match.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userId: (session.user as any).id,
          prediction
        })
      })

      if (response.ok) {
        setHasSaved(true)
        setLastSaveTime(new Date())
        toast.success('Palpite salvo com sucesso!')
      } else {
        toast.error('Erro ao salvar palpite. Tente novamente.')
      }
    } catch (error) {
      console.error('Error saving prediction:', error)
      toast.error('Erro ao salvar palpite. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if prediction has been modified since last save
  const hasUnsavedChanges = () => {
    if (!match.existingPrediction) return true
    
    const existingPrediction = match.existingPrediction
    return (
      prediction.winner !== existingPrediction.winner ||
      JSON.stringify(prediction.setScores) !== JSON.stringify(existingPrediction.setScores)
    )
  }

  const isModified = hasUnsavedChanges()
  const canSave = prediction.winner && 
    prediction.setScores && 
    prediction.setScores.length >= 1 &&
    prediction.setScores.every(set => set.p1 >= 0 && set.p2 >= 0 && (set.p1 > 0 || set.p2 > 0))

  // Update hasSaved state when prediction changes
  useEffect(() => {
    if (hasSaved && isModified) {
      setHasSaved(false)
    }
  }, [prediction, hasSaved, isModified])

  return (
    <Card className="border-l-4 border-l-emerald-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {match.player1.name} vs {match.player2.name}
            </CardTitle>
            <CardDescription className="flex items-center space-x-2">
              <span>Categoria {match.category}</span>
              <span>•</span>
              <span>{match.round}</span>
              <span>•</span>
              <span>{new Date(match.scheduledAt).toLocaleDateString()}</span>
            </CardDescription>
          </div>
          <Badge variant="outline">
            Ranking: #{match.player1.ranking} vs #{match.player2.ranking}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {/* Winner */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Vencedor da partida (5 pontos)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={prediction.winner === 'player1' ? 'default' : 'outline'}
                onClick={() => setPrediction(prev => ({ ...prev, winner: 'player1' }))}
                className="h-auto p-3"
              >
                <div className="text-center">
                  <div className="font-medium">{match.player1.name}</div>
                  <div className="text-xs opacity-70">#{match.player1.ranking}</div>
                </div>
              </Button>
              <Button
                variant={prediction.winner === 'player2' ? 'default' : 'outline'}
                onClick={() => setPrediction(prev => ({ ...prev, winner: 'player2' }))}
                className="h-auto p-3"
              >
                <div className="text-center">
                  <div className="font-medium">{match.player2.name}</div>
                  <div className="text-xs opacity-70">#{match.player2.ranking}</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Detailed Set Scores */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {match.category === 'ATP' ? 'Placar (15 pontos)' : 'Placar detalhado dos sets (15 pontos)'}
            </label>
            {match.category === 'ATP' && (
              <p className="text-sm text-gray-600 mb-3">
                Placar em número de sets (ex: 2x1, 3x1)
              </p>
            )}
            <div className="space-y-4">
              {prediction.setScores?.map((set, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="font-medium">
                      {match.category === 'ATP' ? 'Placar final' : `${index + 1}º Set`}
                    </Label>
                    {index >= 1 && match.category !== 'ATP' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newSets = [...(prediction.setScores || [])];
                          newSets.splice(index, 1);
                          setPrediction(prev => ({ ...prev, setScores: newSets }));
                        }}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2 items-center">
                    <div className="text-sm font-medium text-center">{match.player1.name}</div>
                    <Input
                      type="number"
                      min="0"
                      max="15"
                      placeholder="0"
                      value={set.p1 || ''}
                      onChange={(e) => {
                        const newSets = [...(prediction.setScores || [])];
                        newSets[index].p1 = parseInt(e.target.value) || 0;
                        setPrediction(prev => ({ ...prev, setScores: newSets }));
                      }}
                    />
                    <div className="text-center font-bold">X</div>
                    <Input
                      type="number"
                      min="0"
                      max="15"
                      placeholder="0"
                      value={set.p2 || ''}
                      onChange={(e) => {
                        const newSets = [...(prediction.setScores || [])];
                        newSets[index].p2 = parseInt(e.target.value) || 0;
                        setPrediction(prev => ({ ...prev, setScores: newSets }));
                      }}
                    />
                    <div className="text-sm font-medium text-center">{match.player2.name}</div>
                  </div>
                  {/* Tiebreak score for current set - hidden for ATP */}
                  {match.category !== 'ATP' && (
                    <div className="mt-3">
                      <Label className="text-sm">Tiebreak (ex: 7-5)</Label>
                      <Input
                        type="text"
                        placeholder="Deixe vazio se não houver tiebreak"
                        value={set.tiebreak || ''}
                        onChange={(e) => {
                          const newSets = [...(prediction.setScores || [])];
                          newSets[index].tiebreak = e.target.value;
                          setPrediction(prev => ({ ...prev, setScores: newSets }));
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
              
              {prediction.setScores && prediction.setScores.length < 3 && match.category !== 'ATP' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newSets = [...(prediction.setScores || [])];
                    newSets.push({ p1: 0, p2: 0, tiebreak: '' });
                    setPrediction(prev => ({ ...prev, setScores: newSets }));
                  }}
                  className="w-full"
                >
                  {prediction.setScores.length === 1 ? 'Adicionar 2º Set' : 'Adicionar 3º Set'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="space-y-3">
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !canSave}
            className={`w-full transition-colors ${
              hasSaved && !isModified 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : isModified 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : hasSaved && !isModified ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Palpite Salvo
              </>
            ) : match.existingPrediction ? (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Editar Palpite
              </>
            ) : (
              'Salvar Palpite'
            )}
          </Button>
          
          {/* Save status indicator */}
          {hasSaved && lastSaveTime && (
            <div className="text-center text-sm text-emerald-600">
              <Check className="w-4 h-4 inline mr-1" />
              Salvo em {lastSaveTime.toLocaleTimeString()}
            </div>
          )}
          
          {/* Show unsaved changes indicator */}
          {match.existingPrediction && isModified && (
            <div className="text-center text-sm text-orange-600">
              <Edit className="w-4 h-4 inline mr-1" />
              Você tem alterações não salvas
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TournamentBetsTab({ 
  categories, 
  tournamentBets 
}: { 
  categories: Category[], 
  tournamentBets: TournamentBet[] 
}) {
  const [selectedBets, setSelectedBets] = useState<Record<string, string>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('A')
  const [players, setPlayers] = useState<string[]>([])
  const [loadingPlayers, setLoadingPlayers] = useState(false)

  // Ensure we have all categories including ATP
  const allCategories = [
    ...categories,
    // Add ATP if not already present
    ...(categories.find(cat => cat.id === 'ATP') ? [] : [{ id: 'ATP', name: 'ATP', description: 'Categoria ATP' }])
  ]

  useEffect(() => {
    // Fetch players for the selected category
    const fetchPlayers = async () => {
      try {
        setLoadingPlayers(true)
        const response = await fetch(`/api/players?category=${selectedCategory}`)
        if (response.ok) {
          const data = await response.json()
          setPlayers(data.players || [])
        } else {
          console.error('Failed to fetch players for category:', selectedCategory)
          setPlayers([])
        }
      } catch (error) {
        console.error('Error fetching players:', error)
        setPlayers([])
      } finally {
        setLoadingPlayers(false)
      }
    }

    fetchPlayers()
  }, [selectedCategory])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Palpites de Torneio</h2>
        <p className="text-gray-600">
          Faça seus palpites sobre o torneio para cada categoria!
        </p>
      </div>

      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione a Categoria para Palpites</CardTitle>
          <CardDescription>
            Você pode fazer palpites para todas as categorias. Cada categoria tem pontuações próprias, mas a pontuação final é geral.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="h-auto p-4"
              >
                <div className="text-lg font-semibold">{category.name}</div>
              </Button>
            ))}
          </div>
          {selectedCategory && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700">
                ✓ Fazendo palpites para Categoria {selectedCategory}. Suas pontuações contribuirão para o ranking geral.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tournamentBets.map((bet) => {
          const betKey = `${bet.type}_${selectedCategory}`
          
          return (
            <Card key={betKey}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{bet.label} - Cat. {selectedCategory}</CardTitle>
                  <Badge variant="secondary">{bet.points} pontos</Badge>
                </div>
                <CardDescription>{bet.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={selectedBets[betKey] || ''}
                  onChange={(e) => setSelectedBets(prev => ({ ...prev, [betKey]: e.target.value }))}
                  disabled={loadingPlayers || players.length === 0}
                >
                  <option value="">
                    {loadingPlayers 
                      ? 'Carregando jogadores...' 
                      : players.length === 0 
                        ? 'Nenhum jogador encontrado para esta categoria'
                        : 'Selecione um jogador...'}
                  </option>
                  {!loadingPlayers && players.map((player) => (
                    <option key={player} value={player}>{player}</option>
                  ))}
                </select>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center">
        <Button size="lg">
          Salvar Palpites de Categoria {selectedCategory}
        </Button>
      </div>
    </div>
  )
}

export default function PredictionsPage() {
  const { data: session } = useSession()
  const [selectedMatchCategory, setSelectedMatchCategory] = useState<'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB' | 'ALL'>('ALL')
  const [matchesByCategory, setMatchesByCategory] = useState<Record<string, Match[]>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [tournamentBets, setTournamentBets] = useState<TournamentBet[]>([])
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    totalPredictions: 0,
    correctPredictions: 0,
    correctWinnerPredictions: 0,
    pointsEarned: 0,
    successRate: 0,
    winnerSuccessRate: 0
  })

  const fetchPredictionsData = useCallback(async () => {
    try {
      setLoading(true)
      const categoryParam = selectedMatchCategory === 'ALL' ? '' : `?category=${selectedMatchCategory}`
      const response = await fetch(`/api/predictions${categoryParam}`)
      if (response.ok) {
        const data = await response.json()
        setMatchesByCategory(data.matchesByCategory)
        setCategories(data.categories)
        setTournamentBets(data.tournamentBets)
      }
    } catch (error) {
      console.error('Error fetching predictions data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedMatchCategory])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/users/stats')
      if (response.ok) {
        const data = await response.json()
        setUserStats({
          totalPredictions: data.totalPredictions,
          correctPredictions: data.correctPredictions,
          correctWinnerPredictions: data.correctWinnerPredictions,
          pointsEarned: data.totalPoints,
          successRate: data.successRate,
          winnerSuccessRate: data.winnerSuccessRate
        })
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  useEffect(() => {
    fetchPredictionsData()
    if (session?.user?.email) {
      fetchUserStats()
    }
  }, [session, selectedMatchCategory, fetchPredictionsData])

  const getMatchesForCategory = () => {
    if (selectedMatchCategory === 'ALL') {
      return Object.values(matchesByCategory).flat()
    } else {
      return matchesByCategory[selectedMatchCategory] || []
    }
  }

  const matchesToShow = getMatchesForCategory()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Fazer Palpites
        </h1>
        <p className="text-gray-600">
          Faça seus palpites nas partidas de todas as categorias e ganhe pontos pelos acertos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-emerald-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{userStats.totalPredictions}</div>
              <p className="text-sm text-gray-600">Palpites Feitos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Trophy className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{userStats.correctWinnerPredictions}</div>
              <p className="text-sm text-gray-600">Acertos de Vencedores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Star className="h-8 w-8 text-orange-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{userStats.pointsEarned}</div>
              <p className="text-sm text-gray-600">Pontos Ganhos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">{userStats.winnerSuccessRate}%</div>
              <p className="text-sm text-gray-600">Taxa de Acerto de Vencedores</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="matches" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="matches">Palpites por Partida</TabsTrigger>
          <TabsTrigger value="tournament">Palpites de Torneio</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Próximas Partidas</h2>
            <p className="text-gray-600">
              Faça palpites específicos sobre cada partida de todas as categorias
            </p>
          </div>

          {/* Category Filter for Matches */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Filtrar Partidas por Categoria</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedMatchCategory === 'ALL' ? "default" : "outline"}
                onClick={() => setSelectedMatchCategory('ALL')}
              >
                Todas as Categorias
              </Button>
              {['A', 'B', 'C'].map((category) => (
                <Button
                  key={category}
                  variant={selectedMatchCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedMatchCategory(category as 'A' | 'B' | 'C')}
                >
                  Categoria {category}
                </Button>
              ))}
              <Button
                variant={selectedMatchCategory === 'ATP' ? "default" : "outline"}
                onClick={() => setSelectedMatchCategory('ATP')}
              >
                ATP
              </Button>
              <Button
                variant={selectedMatchCategory === 'RANKING_TCBB' ? "default" : "outline"}
                onClick={() => setSelectedMatchCategory('RANKING_TCBB')}
              >
                Ranking TCBB
              </Button>
            </div>
          </div>

          {matchesToShow.map((match) => (
            <MatchPredictionCard key={match.id} match={match} />
          ))}

          {matchesToShow.length === 0 && (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma partida disponível
              </h3>
              <p className="text-gray-600">
                Aguarde novas partidas serem agendadas para esta categoria
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tournament">
          <TournamentBetsTab categories={categories} tournamentBets={tournamentBets} />
        </TabsContent>
      </Tabs>
    </div>
  )
}