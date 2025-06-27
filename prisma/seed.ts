import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Brazilian tennis player names
const playerNames = [
  'Carlos Silva',
  'João Santos',
  'Pedro Oliveira',
  'Lucas Costa',
  'André Ferreira',
  'Rafael Lima',
  'Bruno Martins',
  'Gabriel Rocha',
  'Felipe Alves',
  'Marcos Pereira',
  'Roberto Souza',
  'Diego Nascimento',
  'Thiago Carvalho',
  'Ricardo Gomes',
  'Mateus Barbosa',
  'Leonardo Dias',
  'Gustavo Melo',
  'Henrique Lopes',
  'Rodrigo Freitas',
  'Vinicius Torres',
  'Caio Ribeiro',
  'Danilo Castro',
  'Fábio Mendes',
  'Igor Ramos',
  'Julio Cardoso',
  'Kleber Pinto',
  'Leandro Faria',
  'Márcio Teixeira',
  'Nathan Correia',
  'Otávio Moura',
  'Paulo Vieira',
  'Renato Campos',
  'Sérgio Cunha',
  'Tiago Monteiro',
  'Wagner Araújo'
]

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador TCBB',
      email: 'admin@tcbb.com',
      password: adminPassword,
      role: 'ADMIN',
      points: 0,
    },
  })

  // Create test users
  const testUsers = []
  for (let i = 1; i <= 10; i++) {
    const password = await bcrypt.hash(`user${i}123`, 12)
    const user = await prisma.user.create({
      data: {
        name: `Usuário Teste ${i}`,
        email: `user${i}@tcbb.com`,
        password,
        role: 'USER',
        points: Math.floor(Math.random() * 500),
      },
    })
    testUsers.push(user)
  }

  // Create players
  const players = []
  for (let i = 0; i < playerNames.length; i++) {
    const player = await prisma.player.create({
      data: {
        name: playerNames[i],
        ranking: i + 1,
        age: Math.floor(Math.random() * 20) + 20, // Age between 20-40
        nationality: 'Brasil',
      },
    })
    players.push(player)
  }

  // Create some matches for first round (32 players = 16 first round matches)
  const matches = []
  for (let i = 0; i < 16; i++) {
    const player1 = players[i * 2]
    const player2 = players[i * 2 + 1]
    
    const match = await prisma.match.create({
      data: {
        player1Id: player1.id,
        player2Id: player2.id,
        round: 'FIRST_ROUND',
        status: i < 8 ? 'FINISHED' : 'SCHEDULED',
        scheduledAt: new Date(Date.now() + i * 24 * 60 * 60 * 1000), // Spread over days
        ...(i < 8 && {
          // Add results for first 8 matches
          finishedAt: new Date(Date.now() - (8 - i) * 24 * 60 * 60 * 1000),
          winner: Math.random() > 0.5 ? 'player1' : 'player2',
          player1Sets: Math.random() > 0.5 ? 2 : Math.random() > 0.5 ? 1 : 0,
          player2Sets: Math.random() > 0.5 ? 2 : Math.random() > 0.5 ? 1 : 0,
          hadTiebreak: Math.random() > 0.7,
          totalDuration: Math.floor(Math.random() * 120) + 60, // 60-180 minutes
        }),
      },
    })
    matches.push(match)
  }

  // Create some predictions for test users
  for (const user of testUsers.slice(0, 5)) {
    for (const match of matches.slice(0, 8)) {
      await prisma.prediction.create({
        data: {
          userId: user.id,
          matchId: match.id,
          winner: Math.random() > 0.5 ? 'player1' : 'player2',
          exactScore: Math.random() > 0.5 ? '2-0' : '2-1',
          goesToThirdSet: Math.random() > 0.5,
          firstSetWinner: Math.random() > 0.5 ? 'player1' : 'player2',
          willHaveTiebreak: Math.random() > 0.3,
          marginOfVictory: Math.random() > 0.5 ? 'COMFORTABLE' : 'CLOSE',
          pointsEarned: Math.floor(Math.random() * 25),
        },
      })
    }
  }

  // Create some tournament bets
  const tournamentBetTypes = [
    'CHAMPION',
    'RUNNER_UP',
    'SEMIFINALIST',
    'QUARTERFINALIST',
    'BIGGEST_UPSET',
    'LONGEST_MATCH',
    'MOST_ACES',
    'BEST_COMEBACK'
  ]

  for (const user of testUsers.slice(0, 5)) {
    for (const betType of tournamentBetTypes.slice(0, 4)) {
      await prisma.tournamentBet.create({
        data: {
          userId: user.id,
          type: betType as any,
          playerId: players[Math.floor(Math.random() * players.length)].id,
          pointsEarned: 0,
        },
      })
    }
  }

  // Create some favorites
  for (const user of testUsers.slice(0, 3)) {
    const randomPlayers = players.sort(() => 0.5 - Math.random()).slice(0, 3)
    for (const player of randomPlayers) {
      await prisma.userFavorite.create({
        data: {
          userId: user.id,
          playerId: player.id,
        },
      })
    }
  }

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created:`)
  console.log(`   - 1 admin user (admin@tcbb.com / admin123)`)
  console.log(`   - 10 test users (user1@tcbb.com / user1123, etc.)`)
  console.log(`   - 35 players`)
  console.log(`   - 16 first round matches (8 with results)`)
  console.log(`   - Sample predictions and tournament bets`)
  console.log(`   - User favorites`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })