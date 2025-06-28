import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __globalPrisma__: PrismaClient | undefined
}

// Handle the case where Prisma client is not available during build
let prismaClient: PrismaClient | undefined

try {
  prismaClient = globalThis.__globalPrisma__ ?? new PrismaClient()
  
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__globalPrisma__ = prismaClient
  }
} catch (error) {
  console.warn('Prisma client could not be initialized. This may be expected during build time.', error)
  // Create a mock client for build time
  prismaClient = undefined
}

export const prisma = prismaClient as PrismaClient