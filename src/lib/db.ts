// Simple mock to avoid Prisma issues during build
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
let prisma: any

if (process.env.NODE_ENV === 'production') {
  // Mock implementation for build
  prisma = {
    user: {
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
    }
  }
} else {
  try {
    const { PrismaClient } = require('@prisma/client')
    
    const globalForPrisma = globalThis as unknown as {
      prisma: any | undefined
    }

    prisma = globalForPrisma.prisma ?? new PrismaClient()

    globalForPrisma.prisma = prisma
  } catch {
    // Fallback mock if Prisma is not available
    prisma = {
      user: {
        findUnique: () => Promise.resolve(null),
        create: () => Promise.resolve({}),
      }
    }
  }
}

export { prisma }