import type { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  InterServerEvents,
  MatchmakingQueue,
  QueuedPlayer,
  ServerToClientEvents,
  SocketData,
} from '../../shared';
import { MATCHMAKING_CONFIG } from '../../shared';
import type { GameManager } from './GameManager';

export class MatchmakingManager {
  private queue: MatchmakingQueue = {
    players: [],
    lastMatchedAt: 0,
  };

  private cleanupInterval: ReturnType<typeof setInterval>;
  private statusInterval: ReturnType<typeof setInterval>;

  constructor(
    private gameManager: GameManager,
    private io: Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >
  ) {
    // Start periodic cleanup of expired queue entries
    this.cleanupInterval = setInterval(
      () => this.cleanupExpiredPlayers(),
      MATCHMAKING_CONFIG.QUEUE_CLEANUP_INTERVAL
    );

    // Start periodic queue status updates
    this.statusInterval = setInterval(
      () => this.sendQueueStatusUpdates(),
      MATCHMAKING_CONFIG.QUEUE_STATUS_INTERVAL
    );

    console.log('🎯 MatchmakingManager initialized');
  }

  // Join the matchmaking queue
  async joinQueue(socketId: string): Promise<{
    success: boolean;
    position?: number;
    estimatedWait?: number;
    error?: string;
  }> {
    // Check if player is already in queue
    const existingIndex = this.queue.players.findIndex(
      p => p.socketId === socketId
    );
    if (existingIndex !== -1) {
      const player = this.queue.players[existingIndex];
      return {
        success: true,
        position: existingIndex + 1,
        estimatedWait: player.estimatedWait,
      };
    }

    // Check if player is already in a game
    const currentGameId =
      await this.gameManager.gameStorage.getSocketGame(socketId);
    if (currentGameId) {
      return {
        success: false,
        error:
          'You are already in a game. Leave the game first to join the queue.',
      };
    }

    // Add player to queue
    const now = Date.now();
    const estimatedWait = this.calculateEstimatedWait();

    const queuedPlayer: QueuedPlayer = {
      socketId,
      joinedAt: now,
      estimatedWait,
    };

    this.queue.players.push(queuedPlayer);

    console.log(
      `🎯 Player ${socketId} joined queue (position: ${this.queue.players.length})`
    );

    // Try to find a match immediately
    await this.tryMatchPlayers();

    return {
      success: true,
      position: this.queue.players.length,
      estimatedWait,
    };
  }

  // Leave the matchmaking queue
  leaveQueue(socketId: string): boolean {
    const initialLength = this.queue.players.length;
    this.queue.players = this.queue.players.filter(
      p => p.socketId !== socketId
    );

    const wasRemoved = this.queue.players.length < initialLength;

    if (wasRemoved) {
      console.log(`🎯 Player ${socketId} left queue`);
    }

    return wasRemoved;
  }

  // Try to match two players from the queue
  private async tryMatchPlayers(): Promise<boolean> {
    if (this.queue.players.length < 2) {
      return false;
    }

    // Prevent rapid-fire matching
    const now = Date.now();
    if (
      now - this.queue.lastMatchedAt <
      MATCHMAKING_CONFIG.MIN_MATCH_INTERVAL
    ) {
      return false;
    }

    // Take first two players (FIFO)
    const playerX = this.queue.players.shift()!;
    const playerO = this.queue.players.shift()!;

    console.log(
      `🎯 Matching players: ${playerX.socketId} (X) vs ${playerO.socketId} (O)`
    );

    try {
      // Create a new game via the GameManager
      const { gameId } = await this.gameManager.createGameViaAPI();

      // Join both players to the game
      const joinResultX = await this.gameManager.joinGame(
        playerX.socketId,
        gameId,
        'X'
      );
      const joinResultO = await this.gameManager.joinGame(
        playerO.socketId,
        gameId,
        'O'
      );

      if (!joinResultX.success || !joinResultO.success) {
        console.error('🎯 Failed to join players to matched game:', {
          gameId,
          playerXResult: joinResultX,
          playerOResult: joinResultO,
        });

        // Re-add players to queue if game join failed
        this.queue.players.unshift(playerO, playerX);
        return false;
      }

      // Notify both players of the match
      this.io.to(playerX.socketId).emit('match-found', {
        gameId,
        yourPlayer: 'X',
      });

      this.io.to(playerO.socketId).emit('match-found', {
        gameId,
        yourPlayer: 'O',
      });

      this.queue.lastMatchedAt = now;

      console.log(`🎯 Successfully matched players in game ${gameId}`);
      return true;
    } catch (error) {
      console.error('🎯 Error creating matched game:', error);

      // Re-add players to queue on error
      this.queue.players.unshift(playerO, playerX);
      return false;
    }
  }

  // Clean up players who have been waiting too long
  private cleanupExpiredPlayers(): void {
    const now = Date.now();
    const initialLength = this.queue.players.length;

    this.queue.players = this.queue.players.filter(player => {
      const waitTime = now - player.joinedAt;
      if (waitTime > MATCHMAKING_CONFIG.MAX_QUEUE_TIME) {
        console.log(
          `🎯 Removing expired player ${player.socketId} from queue (waited ${Math.round(waitTime / 1000)}s)`
        );

        // Notify player that they've been removed from queue
        this.io.to(player.socketId).emit('queue-error', {
          message:
            'Queue timeout - you have been removed from the matchmaking queue.',
        });

        return false; // Remove from queue
      }
      return true; // Keep in queue
    });

    if (this.queue.players.length < initialLength) {
      console.log(
        `🎯 Cleaned up ${initialLength - this.queue.players.length} expired players from queue`
      );
    }
  }

  // Send queue status updates to all players
  private sendQueueStatusUpdates(): void {
    if (this.queue.players.length === 0) {
      return;
    }

    this.queue.players.forEach((player, index) => {
      const position = index + 1;
      const queueSize = this.queue.players.length;
      const waitTime = Date.now() - player.joinedAt;
      const estimatedWait = Math.max(0, player.estimatedWait - waitTime);

      this.io.to(player.socketId).emit('queue-status', {
        position,
        queueSize,
        estimatedWait,
      });
    });
  }

  // Calculate estimated wait time for new players
  private calculateEstimatedWait(): number {
    const queueLength = this.queue.players.length;

    if (queueLength === 0) {
      return 10000; // 10 seconds if queue is empty
    }

    // Base wait time increases with queue length
    // Assume average match time of 30 seconds per pair
    const matchesAhead = Math.floor(queueLength / 2);
    const baseWait = matchesAhead * 30000; // 30 seconds per match

    // Add some buffer time
    return baseWait + 15000; // + 15 seconds buffer
  }

  // Get queue stats for debugging
  getQueueStats() {
    return {
      playersInQueue: this.queue.players.length,
      oldestPlayerWaitTime:
        this.queue.players.length > 0
          ? Date.now() - this.queue.players[0].joinedAt
          : 0,
      lastMatchedAt: this.queue.lastMatchedAt,
    };
  }

  // Handle player disconnect - remove from queue
  handlePlayerDisconnect(socketId: string): void {
    const wasInQueue = this.leaveQueue(socketId);
    if (wasInQueue) {
      console.log(`🎯 Removed disconnected player ${socketId} from queue`);
    }
  }

  // Cleanup on shutdown
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
    console.log('🎯 MatchmakingManager destroyed');
  }
}
