// Bot Player System Types

import type { ClientGameState, Player, Position } from './game';

// Bot difficulty levels (expandable)
export type BotDifficulty = 'random' | 'easy' | 'medium' | 'hard';

// Bot move decision result
export interface BotMoveResult {
  position: Position;
  thinkingTime: number; // How long the bot "thought" (for realistic timing)
}

// Bot player interface - all bots must implement this
export interface BotPlayer {
  readonly difficulty: BotDifficulty;
  readonly name: string;

  // Make a move given the current game state (filtered view like human players)
  makeMove(gameState: ClientGameState, player: Player): Promise<BotMoveResult>;

  // Optional: Get bot's "personality" description
  getDescription?(): string;
}

// Bot game configuration
export interface BotGameConfig {
  botDifficulty: BotDifficulty;
  humanPlayer: Player; // Which player is human ('X' or 'O')
  botPlayer: Player; // Which player is bot ('X' or 'O')
}

// Bot game metadata (for tracking and UI)
export interface BotGameInfo {
  isBot: true;
  botDifficulty: BotDifficulty;
  botPlayer: Player;
  humanPlayer: Player;
}

// Configuration constants
export const BOT_CONFIG = {
  // Minimum thinking time for bot moves (milliseconds)
  MIN_THINKING_TIME: 300,

  // Maximum thinking time for bot moves (milliseconds)
  MAX_THINKING_TIME: 1200,

  // Default thinking time for random bot (milliseconds)
  DEFAULT_THINKING_TIME: 500,

  // Bot game TTL (shorter than human games)
  BOT_GAME_TTL: 30 * 60 * 1000, // 30 minutes

  // Human game TTL (for comparison)
  HUMAN_GAME_TTL: 4 * 60 * 60 * 1000, // 4 hours
} as const;
