import type { GameState } from '../../shared';

export interface GameStorage {
  // Game operations
  createGame(gameId: string, gameState: GameState): Promise<void>;
  getGame(gameId: string): Promise<GameState | null>;
  updateGame(gameId: string, gameState: GameState): Promise<void>;
  deleteGame(gameId: string): Promise<void>;

  // Socket-to-game mapping
  setSocketGame(socketId: string, gameId: string): Promise<void>;
  getSocketGame(socketId: string): Promise<string | null>;
  removeSocketGame(socketId: string): Promise<void>;

  // Utility operations
  getAllGames(): Promise<GameState[]>;
  cleanup(): Promise<number>; // Returns number of cleaned up games
}
