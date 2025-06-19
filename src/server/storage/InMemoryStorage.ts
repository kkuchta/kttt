import type { GameState } from '../../shared';
import type { GameStorage } from './StorageInterface';

export class InMemoryStorage implements GameStorage {
  // In-memory storage for active games
  private activeGames = new Map<string, GameState>();

  // Socket to game mapping for cleanup
  private socketToGame = new Map<string, string>();

  async createGame(gameId: string, gameState: GameState): Promise<void> {
    this.activeGames.set(gameId, gameState);
  }

  async getGame(gameId: string): Promise<GameState | null> {
    return this.activeGames.get(gameId) || null;
  }

  async updateGame(gameId: string, gameState: GameState): Promise<void> {
    this.activeGames.set(gameId, gameState);
  }

  async deleteGame(gameId: string): Promise<void> {
    this.activeGames.delete(gameId);
  }

  async setSocketGame(socketId: string, gameId: string): Promise<void> {
    this.socketToGame.set(socketId, gameId);
  }

  async getSocketGame(socketId: string): Promise<string | null> {
    return this.socketToGame.get(socketId) || null;
  }

  async removeSocketGame(socketId: string): Promise<void> {
    this.socketToGame.delete(socketId);
  }

  async getAllGames(): Promise<GameState[]> {
    return Array.from(this.activeGames.values());
  }

  async cleanup(): Promise<number> {
    const now = Date.now();
    const GAME_TIMEOUT_MS = 4 * 60 * 60 * 1000; // 4 hours
    let cleanedCount = 0;

    for (const [gameId, game] of this.activeGames.entries()) {
      if (now - game.lastActivity > GAME_TIMEOUT_MS) {
        this.activeGames.delete(gameId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  // Additional helper methods for backward compatibility
  get gameCount(): number {
    return this.activeGames.size;
  }

  get socketCount(): number {
    return this.socketToGame.size;
  }
}
