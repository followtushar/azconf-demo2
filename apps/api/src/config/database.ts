import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';
import { config } from './index';

// Global Prisma client instance
let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client with logging configuration
export function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: config.isDevelopment 
      ? ['query', 'info', 'warn', 'error']
      : ['info', 'warn', 'error'],
    datasources: {
      db: {
        url: config.database.url,
      },
    },
  });

  // Add query logging in development
  if (config.isDevelopment) {
    client.$on('query', (e) => {
      logger.debug(`Query: ${e.query}`);
      logger.debug(`Params: ${e.params}`);
      logger.debug(`Duration: ${e.duration}ms`);
    });
  }

  return client;
}

// Get or create Prisma client instance
export function getPrismaClient(): PrismaClient {
  if (config.isProduction) {
    if (!prisma) {
      prisma = createPrismaClient();
    }
    return prisma;
  } else {
    // In development, use global variable to prevent multiple instances
    if (!global.__prisma) {
      global.__prisma = createPrismaClient();
    }
    return global.__prisma;
  }
}

// Connect to database
export async function connectDatabase(): Promise<void> {
  try {
    const client = getPrismaClient();
    await client.$connect();
    logger.info('✅ Connected to PostgreSQL database');
    
    // Test the connection
    await client.$queryRaw`SELECT 1`;
    logger.info('✅ Database connection test successful');
  } catch (error) {
    logger.error('❌ Failed to connect to database:', error);
    throw error;
  }
}

// Disconnect from database
export async function disconnectDatabase(): Promise<void> {
  try {
    const client = getPrismaClient();
    await client.$disconnect();
    logger.info('✅ Disconnected from database');
  } catch (error) {
    logger.error('❌ Error disconnecting from database:', error);
    throw error;
  }
}

// Export the client instance
export const db = getPrismaClient();