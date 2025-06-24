// Matchmaking System Types

export interface QueuedPlayer {
  socketId: string;
  joinedAt: number;
  estimatedWait: number;
}

export interface MatchmakingQueue {
  players: QueuedPlayer[];
  lastMatchedAt: number;
}

export interface MatchResult {
  gameId: string;
  playerX: string; // socket ID
  playerO: string; // socket ID
}

// Configuration
export const MATCHMAKING_CONFIG = {
  // Maximum time a player can wait in queue (milliseconds)
  MAX_QUEUE_TIME: 3 * 60 * 1000, // 3 minutes

  // How often to check for queue timeouts (milliseconds)
  QUEUE_CLEANUP_INTERVAL: 30 * 1000, // 30 seconds

  // How often to send queue status updates (milliseconds)
  QUEUE_STATUS_INTERVAL: 5 * 1000, // 5 seconds

  // Minimum time between matches (to prevent rapid-fire matching)
  MIN_MATCH_INTERVAL: 1000, // 1 second
} as const;
