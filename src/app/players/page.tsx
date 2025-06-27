"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Search, Trophy, User } from "lucide-react"

// Mock data for demonstration
const mockPlayers = [
  { id: '1', name: 'Carlos Silva', ranking: 1, age: 28, nationality: 'Brasil', isFavorite: false },
  { id: '2', name: 'João Santos', ranking: 2, age: 32, nationality: 'Brasil', isFavorite: true },
  { id: '3', name: 'Pedro Oliveira', ranking: 3, age: 25, nationality: 'Brasil', isFavorite: false },
  { id: '4', name: 'Lucas Costa', ranking: 4, age: 29, nationality: 'Brasil', isFavorite: true },
  { id: '5', name: 'André Ferreira', ranking: 5, age: 31, nationality: 'Brasil', isFavorite: false },
  { id: '6', name: 'Rafael Lima', ranking: 6, age: 27, nationality: 'Brasil', isFavorite: false },
  { id: '7', name: 'Bruno Martins', ranking: 7, age: 30, nationality: 'Brasil', isFavorite: false },
  { id: '8', name: 'Gabriel Rocha', ranking: 8, age: 26, nationality: 'Brasil', isFavorite: true },
  { id: '9', name: 'Felipe Alves', ranking: 9, age: 33, nationality: 'Brasil', isFavorite: false },
  { id: '10', name: 'Marcos Pereira', ranking: 10, age: 24, nationality: 'Brasil', isFavorite: false },
  { id: '11', name: 'Roberto Souza', ranking: 11, age: 35, nationality: 'Brasil', isFavorite: false },
  { id: '12', name: 'Diego Nascimento', ranking: 12, age: 28, nationality: 'Brasil', isFavorite: false },
  { id: '13', name: 'Thiago Carvalho', ranking: 13, age: 27, nationality: 'Brasil', isFavorite: false },
  { id: '14', name: 'Ricardo Gomes', ranking: 14, age: 29, nationality: 'Brasil', isFavorite: false },
  { id: '15', name: 'Mateus Barbosa', ranking: 15, age: 26, nationality: 'Brasil', isFavorite: false },
  { id: '16', name: 'Leonardo Dias', ranking: 16, age: 31, nationality: 'Brasil', isFavorite: false },
  { id: '17', name: 'Gustavo Melo', ranking: 17, age: 25, nationality: 'Brasil', isFavorite: false },
  { id: '18', name: 'Henrique Lopes', ranking: 18, age: 28, nationality: 'Brasil', isFavorite: false },
  { id: '19', name: 'Rodrigo Freitas', ranking: 19, age: 30, nationality: 'Brasil', isFavorite: false },
  { id: '20', name: 'Vinicius Torres', ranking: 20, age: 24, nationality: 'Brasil', isFavorite: false },
]

export default function PlayersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [players, setPlayers] = useState(mockPlayers)

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFavoriteFilter = !showFavoritesOnly || player.isFavorite
    return matchesSearch && matchesFavoriteFilter
  })

  const toggleFavorite = (playerId: string) => {
    setPlayers(players.map(player => 
      player.id === playerId 
        ? { ...player, isFavorite: !player.isFavorite }
        : player
    ))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Jogadores do Torneio
        </h1>
        <p className="text-gray-600">
          Conheça todos os 35 participantes do torneio interno de tênis
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar jogadores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="flex items-center space-x-2"
        >
          <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          <span>Apenas Favoritos</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <User className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">35</div>
              <p className="text-sm text-gray-600">Total de Jogadores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Heart className="h-8 w-8 text-red-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">
                {players.filter(p => p.isFavorite).length}
              </div>
              <p className="text-sm text-gray-600">Seus Favoritos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Trophy className="h-8 w-8 text-emerald-600 mr-4" />
            <div>
              <div className="text-2xl font-bold">28</div>
              <p className="text-sm text-gray-600">Idade Média</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlayers.map((player) => (
          <Card key={player.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-2">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {player.name.split(' ').map(n => n[0]).join('')}
              </div>
              <CardTitle className="text-lg">{player.name}</CardTitle>
              <CardDescription>
                #{player.ranking} • {player.age} anos
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  <div className="font-medium">Ranking</div>
                  <div className="text-lg font-bold text-emerald-600">#{player.ranking}</div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium">Idade</div>
                  <div className="text-lg font-bold">{player.age}</div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium">País</div>
                  <div className="text-lg">🇧🇷</div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleFavorite(player.id)}
                className={`w-full ${
                  player.isFavorite 
                    ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <Heart className={`h-4 w-4 mr-2 ${player.isFavorite ? 'fill-current' : ''}`} />
                {player.isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum jogador encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar os filtros ou o termo de pesquisa
          </p>
        </div>
      )}
    </div>
  )
}