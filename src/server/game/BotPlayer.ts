// Bot Player Implementation

import type {
  BotDifficulty,
  BotMoveResult,
  BotPlayer,
} from '../../shared/types/bot';
import { BOT_CONFIG } from '../../shared/types/bot';
import type {
  ClientGameState,
  Player,
  Position,
} from '../../shared/types/game';
import { getCellState, isValidPosition } from '../../shared/utils/gameLogic';

/**
 * RandomBot - Makes completely random valid moves
 * This bot receives the same filtered game state as human players (no cheating!)
 */
export class RandomBot implements BotPlayer {
  readonly difficulty: BotDifficulty = 'random';
  readonly name: string = 'Random Bot';

  async makeMove(
    gameState: ClientGameState,
    _player: Player
  ): Promise<BotMoveResult> {
    // RandomBot doesn't need to know which player it is - it just makes random moves
    // The player parameter is required by the BotPlayer interface but not used

    // Get all valid (empty) positions from the visible board
    const validPositions: Position[] = [];

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const position: Position = { row, col };
        if (isValidPosition(position)) {
          // Bot can only see what human players can see
          const cellState = getCellState(gameState.visibleBoard, position);
          if (cellState === null) {
            validPositions.push(position);
          }
        }
      }
    }

    if (validPositions.length === 0) {
      throw new Error('No valid moves available for bot');
    }

    // Pick a random valid position
    const randomIndex = Math.floor(Math.random() * validPositions.length);
    const selectedPosition = validPositions[randomIndex];

    // Add some random thinking time for realism
    const thinkingTime = this.calculateThinkingTime();

    console.log(
      `[BOT] ${this.name} thinking for ${thinkingTime}ms, choosing position (${selectedPosition.row},${selectedPosition.col})`
    );

    return {
      position: selectedPosition,
      thinkingTime,
    };
  }

  getDescription(): string {
    return 'Makes completely random moves. Great for beginners!';
  }

  private calculateThinkingTime(): number {
    // Random thinking time between min and max, with bias toward default
    const min = BOT_CONFIG.MIN_THINKING_TIME;
    const max = BOT_CONFIG.MAX_THINKING_TIME;
    const defaultTime = BOT_CONFIG.DEFAULT_THINKING_TIME;

    // 70% chance of using default time ± 200ms, 30% chance of random time
    if (Math.random() < 0.7) {
      const variance = 200;
      return defaultTime + (Math.random() - 0.5) * variance;
    } else {
      return min + Math.random() * (max - min);
    }
  }
}

/**
 * Future bot types can be added here:
 *
 * export class EasyBot implements BotPlayer {
 *   // Avoids obvious losing moves but still makes mistakes
 * }
 *
 * export class MediumBot implements BotPlayer {
 *   // Basic strategy: tries to win, blocks opponent wins
 * }
 *
 * export class HardBot implements BotPlayer {
 *   // Advanced strategy with minimax or similar algorithm
 * }
 */

/**
 * Factory function to create bot instances
 */
export function createBot(difficulty: BotDifficulty): BotPlayer {
  switch (difficulty) {
    case 'random':
      return new RandomBot();

    case 'easy':
    case 'medium':
    case 'hard':
      // For now, all difficulties use RandomBot
      // TODO: Implement other bot types
      console.warn(
        `[WARNING] Bot difficulty '${difficulty}' not implemented yet, using RandomBot`
      );
      return new RandomBot();

    default:
      throw new Error(`Unknown bot difficulty: ${difficulty}`);
  }
}

/**
 * Get list of available bot difficulties
 */
export function getAvailableBotDifficulties(): BotDifficulty[] {
  return ['random']; // Expand this as we add more bot types
}

/**
 * Helper function to simulate bot thinking delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
