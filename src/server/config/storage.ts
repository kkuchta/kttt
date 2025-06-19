import { RedisStorage } from '../storage/RedisStorage';
import type { GameStorage } from '../storage/StorageInterface';

export interface StorageConfig {
  redis: {
    url: string;
    ttlSeconds: number;
    connectionTimeoutMs?: number;
  };
}

export function createStorage(config: StorageConfig): GameStorage {
  return new RedisStorage(
    config.redis.url,
    config.redis.ttlSeconds,
    config.redis.connectionTimeoutMs || 5000 // 5 seconds
  );
}

export function getStorageConfig(): StorageConfig {
  return {
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      ttlSeconds: parseInt(process.env.REDIS_TTL_SECONDS || '14400', 10), // 4 hours default
      connectionTimeoutMs: parseInt(
        process.env.REDIS_CONNECTION_TIMEOUT_MS || '5000',
        10
      ), // 5 seconds default
    },
  };
}
