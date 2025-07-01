"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPointsPage() {
  const [debugData, setDebugData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchPoints = async () => {
    setLoading(true)
    setError(null)
    setDebugData(null)

    try {
      const response = await fetch('/api/debug/points')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch debug data")
      }

      setDebugData(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Debug: Pontos Detalhados</h1>
      <p className="mb-6 text-gray-600">
        Clique no botão abaixo para chamar a API <code>/api/debug/points</code> e ver os dados de diagnóstico do sistema de pontos. (Requer acesso de Admin)
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Teste da API de Diagnóstico de Pontos</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleFetchPoints} disabled={loading}>
            {loading ? "Carregando..." : "Chamar API"}
          </Button>

          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
              <p><strong>Erro:</strong> {error}</p>
            </div>
          )}

          {debugData && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Resultado da API</h2>
              <pre className="p-4 bg-gray-100 rounded-md overflow-x-auto">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
