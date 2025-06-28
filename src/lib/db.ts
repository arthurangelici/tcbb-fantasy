import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __globalPrisma__: PrismaClient | undefined
}

export const prisma = globalThis.__globalPrisma__ ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__globalPrisma__ = prisma
}