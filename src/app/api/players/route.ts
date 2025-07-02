import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json({ error: 'Category parameter is required' }, { status: 400 })
    }

    // Validar se a categoria é válida
    const validCategories = ['A', 'B', 'C', 'ATP', 'RANKING_TCBB']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Buscar jogadores que possuem confrontos agendados na categoria especificada
    const matches = await prisma.match.findMany({
      where: {
        category: category as 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB',
        // Opcionalmente, filtrar apenas partidas não finalizadas
        // finishedAt: null
      },
      include: {
        player1: {
          select: {
            name: true
          }
        },
        player2: {
          select: {
            name: true
          }
        }
      }
    })

    // Extrair nomes únicos dos jogadores
    const playerNames = new Set<string>()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    matches.forEach((match: any) => {
      if (match.player1?.name) playerNames.add(match.player1.name)
      if (match.player2?.name) playerNames.add(match.player2.name)
    })

    // Converter para array e ordenar alfabeticamente
    const sortedPlayers = Array.from(playerNames).sort()

    return NextResponse.json({
      players: sortedPlayers,
      category: category,
      total: sortedPlayers.length
    })

  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
