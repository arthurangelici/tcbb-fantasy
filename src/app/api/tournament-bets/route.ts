import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Type for the session with user data
type SessionWithUser = {
  user: {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: string
  }
  expires: string
}

export const dynamic = 'force-dynamic'

// GET - Fetch existing tournament bets for the user
export async function GET() {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's existing tournament bets
    const tournamentBets = await prisma.tournamentBet.findMany({
      where: { userId: user.id },
      include: {
        player: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Transform into a map for easy access: { "CHAMPION_A": { playerId, playerName }, "RUNNER_UP_B": { playerId, playerName } }
    const betsMap: Record<string, { playerId: string; playerName: string }> = {}
    tournamentBets.forEach((bet) => {
      const key = `${bet.type}_${bet.category}`
      if (bet.player) {
        betsMap[key] = {
          playerId: bet.player.id,
          playerName: bet.player.name
        }
      }
    })

    return NextResponse.json({ bets: betsMap })
  } catch (error) {
    console.error('Error fetching tournament bets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Save tournament bets
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as SessionWithUser | null

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { bets, category } = body

    // Validate category
    const validCategories = ['A', 'B', 'C', 'ATP', 'RANKING_TCBB']
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Validate bets structure
    if (!bets || typeof bets !== 'object') {
      return NextResponse.json({ error: 'Invalid bets data' }, { status: 400 })
    }

    // Process each bet type (CHAMPION and RUNNER_UP)
    const validBetTypes = ['CHAMPION', 'RUNNER_UP']
    const results = []

    for (const betType of validBetTypes) {
      const playerName = bets[betType]
      
      if (playerName) {
        // Find the player by name
        const player = await prisma.player.findFirst({
          where: { name: playerName }
        })

        if (player) {
          // Upsert the tournament bet
          const result = await prisma.tournamentBet.upsert({
            where: {
              userId_type_category: {
                userId: user.id,
                type: betType as 'CHAMPION' | 'RUNNER_UP',
                category: category as 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB'
              }
            },
            update: {
              playerId: player.id
            },
            create: {
              userId: user.id,
              type: betType as 'CHAMPION' | 'RUNNER_UP',
              category: category as 'A' | 'B' | 'C' | 'ATP' | 'RANKING_TCBB',
              playerId: player.id
            }
          })
          results.push(result)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Palpites salvos com sucesso!',
      savedBets: results.length 
    })
  } catch (error) {
    console.error('Error saving tournament bets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
