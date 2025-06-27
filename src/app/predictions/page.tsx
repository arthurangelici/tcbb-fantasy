"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Target, Clock, TrendingUp, Star, Flame } from "lucide-react"

// Mock data for demonstration
const mockMatches = [
  {
    id: 1,
    player1: { name: 'Carlos Silva', ranking: 1 },
    player2: { name: 'João Santos', ranking: 12 },
    scheduledAt: '2024-01-15T14:00:00Z',
    status: 'scheduled',
    round: '1ª Rodada',
    canPredict: true,
  },
  {
    id: 2,
    player1: { name: 'Pedro Oliveira', ranking: 3 },
    player2: { name: 'Lucas Costa', ranking: 8 },
    scheduledAt: '2024-01-15T16:00:00Z',
    status: 'scheduled',
    round: '1ª Rodada',
    canPredict: true,
  },
  {
    id: 3,
    player1: { name: 'André Ferreira', ranking: 5 },
    player2: { name: 'Rafael Lima', ranking: 15 },
    scheduledAt: '2024-01-16T14:00:00Z',
    status: 'scheduled',
    round: '1ª Rodada',
    canPredict: true,
  },
]

const mockTournamentBets = [
  { type: 'CHAMPION', label: 'Campeão', points: 25, description: 'Quem será o campeão do torneio?' },
  { type: 'RUNNER_UP', label: 'Vice-campeão', points: 15, description: 'Quem chegará à final mas não ganhará?' },
  { type: 'SEMIFINALIST', label: 'Semifinalista', points: 10, description: 'Escolha um jogador que chegará às semifinais' },
  { type: 'QUARTERFINALIST', label: 'Quartas de Final', points: 5, description: 'Escolha um jogador que chegará às quartas' },
  { type: 'BIGGEST_UPSET', label: 'Maior Zebra', points: 12, description: 'Qual será a maior surpresa do torneio?' },
  { type: 'LONGEST_MATCH', label: 'Partida Mais Longa', points: 10, description: 'Qual partida durará mais tempo?' },
  { type: 'MOST_ACES', label: 'Mais Aces', points: 8, description: 'Quem fará mais aces no torneio?' },
  { type: 'BEST_COMEBACK', label: 'Melhor Comeback', points: 8, description: 'Quem fará a melhor virada?' },
]

interface Prediction {
  winner?: string
  exactScore?: string
  goesToThirdSet?: boolean
  firstSetWinner?: string
  willHaveTiebreak?: boolean
  marginOfVictory?: 'CLOSE' | 'COMFORTABLE'
}

function MatchPredictionCard({ match }: { match: typeof mockMatches[0] }) {
  const [prediction, setPrediction] = useState<Prediction>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    // Show success message
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isUnderdog = match.player1.ranking > match.player2.ranking ? 'player1' : 'player2'

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {match.player1.name} vs {match.player2.name}
            </CardTitle>
            <CardDescription>
              {match.round} • {formatDate(match.scheduledAt)}
            </CardDescription>
          </div>
          <Badge variant="secondary">{match.status === 'scheduled' ? 'Agendada' : 'Em Andamento'}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Players */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="font-semibold">{match.player1.name}</div>
            <div className="text-sm text-gray-600">#{match.player1.ranking}</div>
            {isUnderdog === 'player1' && (
              <Badge variant="outline" className="mt-2 text-xs">
                <Flame className="h-3 w-3 mr-1" />
                Azarão
              </Badge>
            )}
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="font-semibold">{match.player2.name}</div>
            <div className="text-sm text-gray-600">#{match.player2.ranking}</div>
            {isUnderdog === 'player2' && (
              <Badge variant="outline" className="mt-2 text-xs">
                <Flame className="h-3 w-3 mr-1" />
                Azarão
              </Badge>
            )}
          </div>
        </div>

        {/* Prediction Options */}
        <div className="space-y-4">
          {/* Winner */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Vencedor da partida (5 pontos)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={prediction.winner === 'player1' ? 'default' : 'outline'}
                onClick={() => setPrediction(prev => ({ ...prev, winner: 'player1' }))}
                className="justify-start"
              >
                {match.player1.name}
              </Button>
              <Button
                variant={prediction.winner === 'player2' ? 'default' : 'outline'}
                onClick={() => setPrediction(prev => ({ ...prev, winner: 'player2' }))}
                className="justify-start"
              >
                {match.player2.name}
              </Button>
            </div>
          </div>

          {/* Exact Score */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Placar exato em sets (15 pontos)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={prediction.exactScore === '2-0' ? 'default' : 'outline'}
                onClick={() => setPrediction(prev => ({ ...prev, exactScore: '2-0' }))}
              >
                2-0
              </Button>
              <Button
                variant={prediction.exactScore === '2-1' ? 'default' : 'outline'}
                onClick={() => setPrediction(prev => ({ ...prev, exactScore: '2-1' }))}
              >
                2-1
              </Button>
            </div>
          </div>

          {/* Third Set */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Vai para 3º set? (8 pontos)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={prediction.goesToThirdSet === true ? 'default' : 'outline'}
                onClick={() => setPrediction(prev => ({ ...prev, goesToThirdSet: true }))}
              >
                Sim
              </Button>
              <Button
                variant={prediction.goesToThirdSet === false ? 'default' : 'outline'}
                onClick={() => setPrediction(prev => ({ ...prev, goesToThirdSet: false }))}
              >
                Não
              </Button>
            </div>
          </div>

          {/* First Set Winner */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Vencedor do 1º set (3 pontos)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={prediction.firstSetWinner === 'player1' ? 'default' : 'outline'}
                onClick={() => setPrediction(prev => ({ ...prev, firstSetWinner: 'player1' }))}
                className="justify-start"
              >
                {match.player1.name}
              </Button>
              <Button
                variant={prediction.firstSetWinner === 'player2' ? 'default' : 'outline'}
                onClick={() => setPrediction(prev => ({ ...prev, firstSetWinner: 'player2' }))}
                className="justify-start"
              >
                {match.player2.name}
              </Button>
            </div>
          </div>

          {/* Tiebreak */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Terá tie-break? (5 pontos)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={prediction.willHaveTiebreak === true ? 'default' : 'outline'}
                onClick={() => setPrediction(prev => ({ ...prev, willHaveTiebreak: true }))}
              >
                Sim
              </Button>
              <Button
                variant={prediction.willHaveTiebreak === false ? 'default' : 'outline'}
                onClick={() => setPrediction(prev => ({ ...prev, willHaveTiebreak: false }))}
              >
                Não
              </Button>
            </div>
          </div>

          {/* Margin of Victory */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Margem de vitória (7 pontos)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={prediction.marginOfVictory === 'CLOSE' ? 'default' : 'outline'}
                onClick={() => setPrediction(prev => ({ ...prev, marginOfVictory: 'CLOSE' }))}
              >
                Apertado
              </Button>
              <Button
                variant={prediction.marginOfVictory === 'COMFORTABLE' ? 'default' : 'outline'}
                onClick={() => setPrediction(prev => ({ ...prev, marginOfVictory: 'COMFORTABLE' }))}
              >
                Tranquilo
              </Button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !prediction.winner}
          className="w-full"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Palpites'}
        </Button>
      </CardContent>
    </Card>
  )
}

function TournamentBetsTab() {
  const [selectedBets, setSelectedBets] = useState<Record<string, string>>({})

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Palpites de Torneio</h2>
        <p className="text-gray-600">
          Faça seus palpites sobre o torneio antes que ele comece!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockTournamentBets.map((bet) => (
          <Card key={bet.type}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{bet.label}</CardTitle>
                <Badge variant="secondary">{bet.points} pontos</Badge>
              </div>
              <CardDescription>{bet.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedBets[bet.type] || ''}
                onChange={(e) => setSelectedBets(prev => ({ ...prev, [bet.type]: e.target.value }))}
              >
                <option value="">Selecione um jogador...</option>
                <option value="carlos">Carlos Silva</option>
                <option value="joao">João Santos</option>
                <option value="pedro">Pedro Oliveira</option>
                {/* Add more players */}
              </select>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button size="lg">
          Salvar Palpites de Torneio
        </Button>
      </div>
    </div>
  )
}

export default function PredictionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Fazer Palpites
        </h1>
        <p className="text-gray-600">
          Faça seus palpites nas partidas e ganhe pontos pelos acertos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-emerald-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">12</div>
              <p className="text-sm text-gray-600">Palpites Feitos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Trophy className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">7</div>
              <p className="text-sm text-gray-600">Acertos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Star className="h-8 w-8 text-orange-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">89</div>
              <p className="text-sm text-gray-600">Pontos Ganhos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">58%</div>
              <p className="text-sm text-gray-600">Taxa de Acerto</p>
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
              Faça palpites específicos sobre cada partida
            </p>
          </div>

          {mockMatches.map((match) => (
            <MatchPredictionCard key={match.id} match={match} />
          ))}

          {mockMatches.length === 0 && (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma partida disponível
              </h3>
              <p className="text-gray-600">
                Aguarde novas partidas serem agendadas
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tournament">
          <TournamentBetsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}