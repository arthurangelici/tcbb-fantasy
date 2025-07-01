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
  await prisma.user.create({
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
        category: categoryOptions[Math.floor(Math.random() * categoryOptions.length)] as 'A' | 'B' | 'C',
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
          category: category as 'A' | 'B' | 'C',
        },
      })
      players.push(player)
    }
  }

  // Create tournament structure: Quarterfinals, Semifinals, Finals for each category
  const matches = []
  const tournamentCategories = ['A', 'B', 'C']
  
  for (const category of tournamentCategories) {
    const categoryPlayers = players.filter(p => p.category === category)
    
    // Quarterfinals - 4 matches per category (8 players)
    const quarterfinalsPlayers = categoryPlayers.slice(0, 8)
    for (let i = 0; i < 4; i++) {
      const player1 = quarterfinalsPlayers[i * 2]
      const player2 = quarterfinalsPlayers[i * 2 + 1]
      
      if (player1 && player2) {
        const isFinished = i < 2 // First 2 quarterfinals per category are finished
        
        // Base match data
        const matchData: any = {
          player1Id: player1.id,
          player2Id: player2.id,
          category: category as 'A' | 'B' | 'C',
          round: 'QUARTERFINALS',
          status: isFinished ? 'FINISHED' : 'SCHEDULED',
          scheduledAt: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        }

        // Add result for finished matches
        if (isFinished) {
          const p1Wins = Math.random() > 0.5
          const winnerId = p1Wins ? player1.id : player2.id
          const twoSets = Math.random() > 0.5
          const setScores = []

          if (twoSets) { // 2-0 result
            setScores.push({ p1: p1Wins ? 6 : 4, p2: p1Wins ? 4 : 6 })
            setScores.push({ p1: p1Wins ? 7 : 5, p2: p1Wins ? 5 : 7, tiebreak: "7-5" })
          } else { // 2-1 result
            setScores.push({ p1: p1Wins ? 6 : 3, p2: p1Wins ? 3 : 6 })
            setScores.push({ p1: !p1Wins ? 6 : 2, p2: !p1Wins ? 2 : 6 })
            setScores.push({ p1: p1Wins ? 10 : 8, p2: p1Wins ? 8 : 10, tiebreak: "10-8" })
          }
          
          matchData.winnerId = winnerId
          matchData.setScores = setScores
          matchData.hadTiebreak = setScores.some(s => s.tiebreak)
          matchData.totalDuration = Math.floor(Math.random() * 120) + 60
        }

        const match = await prisma.match.create({
          data: matchData,
        })
        matches.push(match)
      }
    }

    // Semifinals - 2 matches per category
    const semifinalistsPlayers = categoryPlayers.slice(0, 4)
    for (let i = 0; i < 2; i++) {
      const player1 = semifinalistsPlayers[i * 2]
      const player2 = semifinalistsPlayers[i * 2 + 1]
      
      if (player1 && player2) {
        const match = await prisma.match.create({
          data: {
            player1Id: player1.id,
            player2Id: player2.id,
            category: category as 'A' | 'B' | 'C',
            round: 'SEMIFINALS',
            status: 'SCHEDULED',
            scheduledAt: new Date(Date.now() + (4 + i) * 24 * 60 * 60 * 1000),
          },
        })
        matches.push(match)
      }
    }

    // Final - 1 match per category
    const finalistsPlayers = categoryPlayers.slice(0, 2)
    if (finalistsPlayers.length >= 2) {
      const match = await prisma.match.create({
        data: {
          player1Id: finalistsPlayers[0].id,
          player2Id: finalistsPlayers[1].id,
          category: category as 'A' | 'B' | 'C',
          round: 'FINAL',
          status: 'SCHEDULED',
          scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })
      matches.push(match)
    }
  }

  // Create some predictions for test users
  for (const user of testUsers.slice(0, 5)) {
    const finishedMatches = matches.filter(match => match.status === 'FINISHED')
    for (const match of finishedMatches) {
      // Generate sample set scores
      const numSets = Math.random() > 0.5 ? 2 : 3
      const setScores = []
      
      for (let i = 0; i < numSets; i++) {
        const p1Score = Math.floor(Math.random() * 7) + 1  // 1-7
        const p2Score = Math.floor(Math.random() * 7) + 1  // 1-7
        const set: any = { p1: p1Score, p2: p2Score }
        
        // Add tiebreak for some sets
        if (Math.random() > 0.7) {
          set.tiebreak = Math.random() > 0.5 ? '7-5' : '10-8'
        }
        
        setScores.push(set)
      }

      await prisma.prediction.create({
        data: {
          userId: user.id,
          matchId: match.id,
          winner: Math.random() > 0.5 ? 'player1' : 'player2',
          setScores: setScores,
          firstSetWinner: Math.random() > 0.5 ? 'player1' : 'player2',
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
            type: betType as 'CHAMPION' | 'RUNNER_UP' | 'SEMIFINALIST' | 'QUARTERFINALIST',
            category: category as 'A' | 'B' | 'C',
            playerId: categoryPlayers[Math.floor(Math.random() * categoryPlayers.length)].id,
            pointsEarned: 0,
          },
        })
      }
    }
  }

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created:`)
  console.log(`   - 1 admin user (admin@tcbb.com / admin123)`)
  console.log(`   - 10 test users with categories (user1@tcbb.com / user1123, etc.)`)
  console.log(`   - ${Object.values(playersByCategory).flat().length} players across 3 categories`)
  console.log(`   - ${matches.length} tournament matches (quarterfinals, semifinals, finals)`)
  console.log(`   - Sample predictions and tournament bets for each category`)
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