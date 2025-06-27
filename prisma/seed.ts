import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Brazilian tennis player names by category
const playersByCategory = {
  A: [
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
    'Diego Nascimento'
  ],
  B: [
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
    'Igor Ramos'
  ],
  C: [
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
}

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

  // Create test users with random categories
  const testUsers = []
  const categoryOptions = ['A', 'B', 'C']
  for (let i = 1; i <= 10; i++) {
    const password = await bcrypt.hash(`user${i}123`, 12)
    const user = await prisma.user.create({
      data: {
        name: `Usuário Teste ${i}`,
        email: `user${i}@tcbb.com`,
        password,
        role: 'USER',
        points: Math.floor(Math.random() * 500),
        category: categoryOptions[Math.floor(Math.random() * categoryOptions.length)] as any,
      },
    })
    testUsers.push(user)
  }

  // Create players by category
  const players = []
  let rankingCounter = 1
  
  for (const [category, names] of Object.entries(playersByCategory)) {
    for (let i = 0; i < names.length; i++) {
      const player = await prisma.player.create({
        data: {
          name: names[i],
          ranking: rankingCounter++,
          age: Math.floor(Math.random() * 20) + 20, // Age between 20-40
          nationality: 'Brasil',
          category: category as any,
        },
      })
      players.push(player)
    }
  }

  // Create matches for each category (first round)
  const matches = []
  const tournamentCategories = ['A', 'B', 'C']
  
  for (const category of tournamentCategories) {
    const categoryPlayers = players.filter(p => p.category === category)
    const matchCount = Math.floor(categoryPlayers.length / 2)
    
    for (let i = 0; i < matchCount; i++) {
      const player1 = categoryPlayers[i * 2]
      const player2 = categoryPlayers[i * 2 + 1]
      
      if (player1 && player2) {
        const match = await prisma.match.create({
          data: {
            player1Id: player1.id,
            player2Id: player2.id,
            category: category as any,
            round: 'FIRST_ROUND',
            status: i < 3 ? 'FINISHED' : 'SCHEDULED', // First 3 matches per category are finished
            scheduledAt: new Date(Date.now() + i * 24 * 60 * 60 * 1000), // Spread over days
            ...(i < 3 && {
              // Add results for first 3 matches per category
              finishedAt: new Date(Date.now() - (3 - i) * 24 * 60 * 60 * 1000),
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
    }
  }

  // Create some predictions for test users
  for (const user of testUsers.slice(0, 5)) {
    const finishedMatches = matches.filter(match => match.status === 'FINISHED')
    for (const match of finishedMatches) {
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

  // Create tournament bets for each category
  const tournamentBetTypes = [
    'CHAMPION',
    'RUNNER_UP', 
    'SEMIFINALIST',
    'QUARTERFINALIST'
  ]

  for (const user of testUsers.slice(0, 5)) {
    for (const category of tournamentCategories) {
      const categoryPlayers = players.filter(p => p.category === category)
      for (const betType of tournamentBetTypes) {
        await prisma.tournamentBet.create({
          data: {
            userId: user.id,
            type: betType as any,
            category: category as any,
            playerId: categoryPlayers[Math.floor(Math.random() * categoryPlayers.length)].id,
            pointsEarned: 0,
          },
        })
      }
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
  console.log(`   - 10 test users with categories (user1@tcbb.com / user1123, etc.)`)
  console.log(`   - ${Object.values(playersByCategory).flat().length} players across 3 categories`)
  console.log(`   - ${matches.length} first round matches across all categories`)
  console.log(`   - Sample predictions and tournament bets for each category`)
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