import { createClient, RedisClientType } from 'redis';
import { logger } from '@/utils/logger';
import { config } from './index';

let redisClient: RedisClientType;

export async function connectRedis(): Promise<void> {
  try {
    redisClient = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('❌ Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 50, 1000);
        },
      },
    });

    redisClient.on('error', (error) => {
      logger.error('❌ Redis client error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('🔄 Redis client connecting...');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('🔌 Redis client disconnected');
    });

    redisClient.on('reconnecting', () => {
      logger.info('🔄 Redis client reconnecting...');
    });

    await redisClient.connect();
    
    // Test the connection
    await redisClient.ping();
    logger.info('✅ Redis connection test successful');
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('✅ Disconnected from Redis');
    }
  } catch (error) {
    logger.error('❌ Error disconnecting from Redis:', error);
    throw error;
  }
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

// Cache utilities
export class Cache {
  private client: RedisClientType;

  constructor() {
    this.client = getRedisClient();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flushAll();
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  }

  // Generate cache keys
  static keys = {
    user: (id: string) => `user:${id}`,
    session: (token: string) => `session:${token}`,
    capsule: (id: string) => `capsule:${id}`,
    userCapsules: (userId: string, page: number) => `user:${userId}:capsules:${page}`,
    emailVerification: (token: string) => `email_verification:${token}`,
    passwordReset: (token: string) => `password_reset:${token}`,
    rateLimitUser: (userId: string) => `rate_limit:user:${userId}`,
    rateLimitIP: (ip: string) => `rate_limit:ip:${ip}`,
  };
}

export const cache = new Cache();