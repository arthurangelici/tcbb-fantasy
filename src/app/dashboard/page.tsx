"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Target, TrendingUp, Calendar, Users, Award } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect("/auth/login")
  }

  // Mock data for demonstration
  const userStats = {
    totalPoints: 347,
    position: 12,
    correctPredictions: 23,
    totalPredictions: 45,
    successRate: 51.1,
    streak: 3,
  }

  const recentMatches = [
    {
      id: 1,
      player1: "Carlos Silva",
      player2: "João Santos",
      result: "2-1",
      userPrediction: "Carlos Silva",
      points: 8,
      correct: true,
    },
    {
      id: 2,
      player1: "Pedro Oliveira",
      player2: "Lucas Costa",
      result: "2-0",
      userPrediction: "Lucas Costa",
      points: 0,
      correct: false,
    },
    {
      id: 3,
      player1: "André Ferreira",
      player2: "Rafael Lima",
      result: "2-1",
      userPrediction: "André Ferreira",
      points: 15,
      correct: true,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bem-vindo, {session.user.name || session.user.email}!
        </h1>
        <p className="text-gray-600">
          Acompanhe suas estatísticas e faça novos palpites no torneio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <Trophy className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalPoints}</div>
            <p className="text-xs text-emerald-100">
              +12 pontos esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posição no Ranking</CardTitle>
            <Award className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{userStats.position}</div>
            <p className="text-xs text-blue-100">
              de 156 participantes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
            <Target className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.successRate}%</div>
            <p className="text-xs text-purple-100">
              {userStats.correctPredictions} de {userStats.totalPredictions} palpites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sequência Atual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{userStats.streak}</div>
            <p className="text-xs text-muted-foreground">
              acertos consecutivos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Partidas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              partidas para apostar hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jogadores Favoritados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              jogadores em sua lista
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button asChild>
              <Link href="/predictions">
                <Target className="h-4 w-4 mr-2" />
                Fazer Palpites
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/tournament">
                <Trophy className="h-4 w-4 mr-2" />
                Ver Chaveamento
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/players">
                <Users className="h-4 w-4 mr-2" />
                Jogadores
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/ranking">
                <Award className="h-4 w-4 mr-2" />
                Ranking
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos Resultados</CardTitle>
            <CardDescription>
              Seus palpites mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {match.player1} vs {match.player2}
                    </div>
                    <div className="text-xs text-gray-600">
                      Resultado: {match.result} • Palpite: {match.userPrediction}
                    </div>
                  </div>
                  <div className={`flex items-center space-x-2 ${
                    match.correct ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    <span className="text-sm font-medium">
                      {match.correct ? `+${match.points}` : '0'} pts
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      match.correct ? 'bg-emerald-600' : 'bg-red-600'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/predictions/history">
                  Ver Histórico Completo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}