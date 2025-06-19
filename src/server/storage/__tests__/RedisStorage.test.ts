import type { GameState } from '../../../shared';
import { RedisStorage } from '../RedisStorage';

describe('RedisStorage', () => {
  let storage: RedisStorage;
  let redisAvailable: boolean = false;
  const shouldSkipRedisTests = process.env.SKIP_REDIS_TESTS === 'true';

  const mockGameState: GameState = {
    id: 'TEST',
    board: [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ],
    currentTurn: 'X',
    status: 'waiting-for-players',
    players: { X: 'player1', O: null },
    revealedCells: new Set<string>(),
    moveHistory: [],
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };

  beforeAll(async () => {
    // Use a test Redis URL with very short timeout for tests
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    storage = new RedisStorage(redisUrl, 60, 500); // 1 minute TTL, 500ms timeout

    // Test connection availability upfront with timeout
    try {
      await Promise.race([
        storage.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection test timeout')), 1000)
        ),
      ]);
      redisAvailable = await storage.isConnected();
      if (!redisAvailable) {
        throw new Error(
          'Redis connection successful but isConnected() returned false'
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (shouldSkipRedisTests) {
        console.warn(
          '🔄 Redis connection failed - Redis tests will be skipped:',
          errorMessage
        );
        console.warn(
          '💡 To make Redis tests required, unset SKIP_REDIS_TESTS environment variable'
        );
        redisAvailable = false;
      } else {
        throw new Error(
          `Redis is required but unavailable: ${errorMessage}\n` +
            '💡 Solutions:\n' +
            '  - Start Redis: make redis-up\n' +
            '  - Skip Redis tests: SKIP_REDIS_TESTS=true npm test\n' +
            '  - Run only other tests: npm test -- --testPathIgnorePatterns=RedisStorage'
        );
      }
    }
  }, 2000); // 2 second timeout for beforeAll

  afterAll(async () => {
    // Clean up and disconnect - force cleanup even if Redis was unavailable
    try {
      if (redisAvailable) {
        await storage.disconnect();
      } else {
        // Force disconnect even if connection failed - this cleans up any pending connections
        await storage.disconnect();
      }
    } catch {
      // Ignore errors during cleanup
      console.warn(
        'Warning: Error during test cleanup (this is expected if Redis was unavailable)'
      );
    }
  });

  beforeEach(async () => {
    // Skip setup if Redis is not available AND skipping is enabled
    if (!redisAvailable && shouldSkipRedisTests) {
      return;
    }
  });

  it('should connect to Redis successfully', async () => {
    if (!redisAvailable && shouldSkipRedisTests) {
      console.warn('Redis not available, skipping Redis connection test');
      return;
    }

    expect(redisAvailable).toBe(true);
  });

  it('should create and retrieve a game', async () => {
    if (!redisAvailable && shouldSkipRedisTests) {
      console.warn('Redis not available, skipping game creation test');
      return;
    }

    await storage.createGame('TEST_GAME', mockGameState);
    const retrievedGame = await storage.getGame('TEST_GAME');

    expect(retrievedGame).toEqual(mockGameState);

    // Clean up
    await storage.deleteGame('TEST_GAME');
  });

  it('should return null for non-existent game', async () => {
    if (!redisAvailable && shouldSkipRedisTests) {
      console.warn('Redis not available, skipping non-existent game test');
      return;
    }

    const game = await storage.getGame('NON_EXISTENT');
    expect(game).toBeNull();
  });

  it('should update game state', async () => {
    if (!redisAvailable && shouldSkipRedisTests) {
      console.warn('Redis not available, skipping game update test');
      return;
    }

    await storage.createGame('UPDATE_TEST', mockGameState);

    const updatedGame = { ...mockGameState, currentTurn: 'O' as const };
    await storage.updateGame('UPDATE_TEST', updatedGame);

    const retrievedGame = await storage.getGame('UPDATE_TEST');
    expect(retrievedGame?.currentTurn).toBe('O');

    // Clean up
    await storage.deleteGame('UPDATE_TEST');
  });

  it('should handle socket-to-game mapping', async () => {
    if (!redisAvailable && shouldSkipRedisTests) {
      console.warn('Redis not available, skipping socket mapping test');
      return;
    }

    await storage.setSocketGame('socket123', 'game456');
    const gameId = await storage.getSocketGame('socket123');

    expect(gameId).toBe('game456');

    await storage.removeSocketGame('socket123');
    const removedGameId = await storage.getSocketGame('socket123');

    expect(removedGameId).toBeNull();
  });
});
