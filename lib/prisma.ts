import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy initialization function - only initializes when prisma is first accessed
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // Handle Prisma Postgres URLs (prisma+postgres://) vs standard PostgreSQL URLs
  let pool: Pool
  if (connectionString.startsWith('prisma+postgres://')) {
    // For Prisma managed Postgres, extract the actual postgres URL from the API key
    try {
      const urlMatch = connectionString.match(/api_key=([^"&]+)/)
      if (urlMatch) {
        const apiKey = decodeURIComponent(urlMatch[1])
        const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString())
        if (decoded.databaseUrl) {
          pool = new Pool({ connectionString: decoded.databaseUrl })
        } else if (decoded.shadowDatabaseUrl) {
          pool = new Pool({ connectionString: decoded.shadowDatabaseUrl })
        } else {
          throw new Error('Could not extract database URL from Prisma Postgres connection string')
        }
      } else {
        throw new Error('Invalid Prisma Postgres connection string format')
      }
    } catch (error) {
      console.error('Error parsing Prisma Postgres URL:', error)
      throw new Error('Failed to parse Prisma Postgres connection string. Consider using a standard PostgreSQL connection string.')
    }
  } else {
    // Standard PostgreSQL connection
    pool = new Pool({ connectionString })
  }

  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }

  return prisma
}

// Export a proxy that lazily initializes Prisma on first access
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = client[prop as keyof PrismaClient]
    return typeof value === 'function' ? value.bind(client) : value
  }
})
