import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  if ((url.startsWith('postgresql://') || url.startsWith('postgres://')) && !url.includes('connect_timeout=')) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}connect_timeout=4&pool_timeout=4`
  }
  return url
}

const datasourceUrl = getDatabaseUrl()

export const db = globalForPrisma.prisma || new PrismaClient({
  ...(datasourceUrl ? { datasources: { db: { url: datasourceUrl } } } : {}),
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
