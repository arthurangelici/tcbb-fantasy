"use client"

import { useState, useEffect } from "react"
import { Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TournamentStats {
  totalMatches: number
  completedMatches: number
  remainingMatches: number
  activePlayers: number
}

export function HomeStats() {
  const [stats, setStats] = useState<TournamentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/tournament')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card className="text-center">
        <CardHeader>
          <Users className="h-12 w-12 text-blue-600 mx-auto mb-2" />
          <CardTitle>
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Conheça todos os participantes do torneio e suas estatísticas
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="text-center">
      <CardHeader>
        <Users className="h-12 w-12 text-blue-600 mx-auto mb-2" />
        <CardTitle>{stats?.activePlayers || 0} Jogadores</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          Conheça todos os participantes do torneio e suas estatísticas
        </CardDescription>
      </CardContent>
    </Card>
  )
}
