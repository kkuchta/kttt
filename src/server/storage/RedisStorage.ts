import { createClient, RedisClientType } from 'redis';
import type { GameState } from '../../shared';
import type { GameStorage } from './StorageInterface';

export class RedisStorage implements GameStorage {
  private client: RedisClientType;
  private connected: boolean = false;

  constructor(
    private redisUrl: string = 'redis://localhost:6379',
    private gamesTtlSeconds: number = 4 * 60 * 60, // 4 hours
    private connectionTimeoutMs: number = 5000 // 5 seconds
  ) {
    this.client = createClient({
      url: this.redisUrl,
      socket: {
        connectTimeout: this.connectionTimeoutMs,
      },
    });

    // Handle connection events
    this.client.on('error', err => {
      console.error('Redis connection error:', err);
      this.connected = false;
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
      this.connected = true;
    });

    this.client.on('ready', () => {
      console.log('Redis client ready');
    });

    this.client.on('end', () => {
      console.log('Redis connection ended');
      this.connected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      // Wrap the connection attempt with a timeout
      await this.connectWithTimeout();
    }
  }

  private async connectWithTimeout(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(
          new Error(
            `Redis connection timeout after ${this.connectionTimeoutMs}ms`
          )
        );
      }, this.connectionTimeoutMs);

      this.client
        .connect()
        .then(() => {
          clearTimeout(timeoutId);
          resolve();
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  async disconnect(): Promise<void> {
    try {
      if (this.connected || this.client.isOpen) {
        await this.client.disconnect();
      }
    } catch (error) {
      // Ignore disconnect errors - client might already be closed
      console.warn(
        'Redis disconnect warning:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      this.connected = false;
    }
  }

  // Game operations
  async createGame(gameId: string, gameState: GameState): Promise<void> {
    await this.ensureConnected();
    const key = this.gameKey(gameId);
    const serializedState = this.serializeGameState(gameState);
    await this.client.setEx(key, this.gamesTtlSeconds, serializedState);
  }

  async getGame(gameId: string): Promise<GameState | null> {
    await this.ensureConnected();
    const key = this.gameKey(gameId);
    const data = await this.client.get(key);

    if (!data) {
      return null;
    }

    try {
      return this.deserializeGameState(data);
    } catch (error) {
      console.error('Error parsing game data from Redis:', error);
      return null;
    }
  }

  async updateGame(gameId: string, gameState: GameState): Promise<void> {
    await this.ensureConnected();
    const key = this.gameKey(gameId);
    const serializedState = this.serializeGameState(gameState);
    // Update with TTL to refresh expiration
    await this.client.setEx(key, this.gamesTtlSeconds, serializedState);
  }

  async deleteGame(gameId: string): Promise<void> {
    await this.ensureConnected();
    const key = this.gameKey(gameId);
    await this.client.del(key);
  }

  // Socket-to-game mapping
  async setSocketGame(socketId: string, gameId: string): Promise<void> {
    await this.ensureConnected();
    const key = this.socketKey(socketId);
    // Socket mappings have shorter TTL since they're more transient
    await this.client.setEx(key, 60 * 60, gameId); // 1 hour
  }

  async getSocketGame(socketId: string): Promise<string | null> {
    await this.ensureConnected();
    const key = this.socketKey(socketId);
    return await this.client.get(key);
  }

  async removeSocketGame(socketId: string): Promise<void> {
    await this.ensureConnected();
    const key = this.socketKey(socketId);
    await this.client.del(key);
  }

  // Utility operations
  async getAllGames(): Promise<GameState[]> {
    await this.ensureConnected();
    const pattern = this.gameKey('*');
    const keys = await this.client.keys(pattern);

    if (keys.length === 0) {
      return [];
    }

    const gameData = await this.client.mGet(keys);
    const games: GameState[] = [];

    for (const data of gameData) {
      if (data) {
        try {
          games.push(this.deserializeGameState(data));
        } catch (error) {
          console.error('Error parsing game data in getAllGames:', error);
        }
      }
    }

    return games;
  }

  async cleanup(): Promise<number> {
    // Redis handles TTL automatically, but we can check for expired keys
    // This is mainly for compatibility with the interface
    await this.ensureConnected();

    const gamePattern = this.gameKey('*');
    const socketPattern = this.socketKey('*');

    const gameKeys = await this.client.keys(gamePattern);
    const socketKeys = await this.client.keys(socketPattern);

    let cleanedCount = 0;

    // Check each key's TTL and count those that are expired or about to expire
    for (const key of [...gameKeys, ...socketKeys]) {
      const ttl = await this.client.ttl(key);
      if (ttl === -2) {
        // Key doesn't exist (expired)
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  // Health check
  async isConnected(): Promise<boolean> {
    try {
      await this.ensureConnected();
      await this.client.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  // Helper methods
  private gameKey(gameId: string): string {
    return `kttt:game:${gameId}`;
  }

  private socketKey(socketId: string): string {
    return `kttt:socket:${socketId}`;
  }

  private async ensureConnected(): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }
  }

  // Additional helper methods for development/debugging
  async getGameCount(): Promise<number> {
    await this.ensureConnected();
    const keys = await this.client.keys(this.gameKey('*'));
    return keys.length;
  }

  async getSocketCount(): Promise<number> {
    await this.ensureConnected();
    const keys = await this.client.keys(this.socketKey('*'));
    return keys.length;
  }

  private serializeGameState(gameState: GameState): string {
    // Convert Set to Array for JSON serialization
    const serializable = {
      ...gameState,
      revealedCells: Array.from(gameState.revealedCells),
    };
    return JSON.stringify(serializable);
  }

  private deserializeGameState(data: string): GameState {
    // Parse JSON and convert Array back to Set
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      revealedCells: new Set(parsed.revealedCells || []),
    };
  }
}
