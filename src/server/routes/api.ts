import { Router } from 'express';
import type { GameManager } from '../game/GameManager';

export function createApiRoutes(gameManager: GameManager): Router {
  const router = Router();

  // Health check endpoint
  router.get('/health', (_, res) => {
    res.json({
      status: 'ok',
      message: 'Kriegspiel Tic Tac Toe server is running',
      timestamp: new Date().toISOString(),
    });
  });

  // Create a new game
  router.post('/games', async (_req, res) => {
    try {
      const result = await gameManager.createGameViaAPI();

      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating game:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create game',
      });
    }
  });

  // Get game state
  router.get('/games/:gameId', async (req, res) => {
    try {
      const { gameId } = req.params;
      const gameState = await gameManager.getGameForAPI(gameId);

      if (!gameState) {
        return res.status(404).json({
          success: false,
          error: 'Game not found',
        });
      }

      res.json({
        success: true,
        game: gameState,
      });
    } catch (error) {
      console.error('Error getting game state:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get game state',
      });
    }
  });

  return router;
}
