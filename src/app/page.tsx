import Link from "next/link";
import { Trophy, Users, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          TCBB Fantasy Tennis
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Faça seus palpites no torneio interno de tênis e concorra com outros fãs pelo título de melhor analista!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/register">
              Começar Agora
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
            <Link href="/tournament">
              Ver Chaveamento
            </Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardHeader>
            <Trophy className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
            <CardTitle>Sistema de Palpites</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Faça palpites detalhados em cada partida e ganhe pontos pelos acertos
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-2" />
            <CardTitle>35 Jogadores</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Conheça todos os participantes do torneio e suas estatísticas
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Target className="h-12 w-12 text-purple-600 mx-auto mb-2" />
            <CardTitle>Ranking em Tempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Acompanhe sua posição no ranking e compete com outros participantes
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-2" />
            <CardTitle>Estatísticas Detalhadas</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Analise sua performance com gráficos e relatórios completos
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-3xl font-bold text-center mb-8">Como Funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-emerald-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Faça seus Palpites</h3>
            <p className="text-gray-600">
              Analise as partidas e faça palpites detalhados sobre vencedores, placares e muito mais
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Ganhe Pontos</h3>
            <p className="text-gray-600">
              Acerte os palpites e ganhe pontos. Palpites mais difíceis valem mais pontos!
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Suba no Ranking</h3>
            <p className="text-gray-600">
              Compete com outros participantes e prove que você é o melhor analista de tênis!
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-6">Tipos de Palpites</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">5pts</div>
            <div className="text-sm text-gray-600">Vencedor</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">15pts</div>
            <div className="text-sm text-gray-600">Placar Exato</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">8pts</div>
            <div className="text-sm text-gray-600">3º Set</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">25pts</div>
            <div className="text-sm text-gray-600">Campeão</div>
          </div>
        </div>
      </div>
    </div>
  );
}
