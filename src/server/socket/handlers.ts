import type { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../shared';
import { createClientGameState } from '../../shared/utils/gameLogic';
import type { GameManager } from '../game/GameManager';
import {
  withErrorHandling,
  withValidation,
  withValidationNoData,
} from '../middleware/validation';

export function setupSocketHandlers(
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  gameManager: GameManager
): void {
  io.on('connection', socket => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Game creation - with validation
    socket.on(
      'create-game',
      withValidationNoData(socket, 'create-game', async () => {
        console.log(`📝 Create game request from ${socket.id}`);

        try {
          const result = await gameManager.createGameViaSocket(socket.id);

          // Join the Socket.io room
          socket.join(result.gameId);

          socket.emit('game-created', result);
        } catch (error) {
          console.error('Error creating game:', error);
          socket.emit('error', {
            message: 'Failed to create game',
            code: 'CREATE_GAME_ERROR',
          });
        }
      })
    );

    // Game joining - with validation
    socket.on(
      'join-game',
      withValidation(socket, 'join-game', async gameId => {
        console.log(`🎮 Join game request: ${gameId} from ${socket.id}`);

        try {
          const result = await gameManager.joinGame(socket.id, gameId);

          if (!result.success) {
            if (result.error === 'Game not found') {
              socket.emit('game-not-found');
            } else if (result.error === 'Game is full') {
              socket.emit('game-full');
            } else {
              socket.emit('error', {
                message: result.error || 'Failed to join game',
                code: 'JOIN_GAME_ERROR',
              });
            }
            return;
          }

          // Join the Socket.io room
          socket.join(gameId);

          // Notify the joining player
          socket.emit('game-joined', {
            success: true,
            yourPlayer: result.yourPlayer,
          });

          // Send current game state
          const game = await gameManager.gameStorage.getGame(gameId);
          if (game && result.yourPlayer) {
            const clientState = createClientGameState(game, result.yourPlayer);
            socket.emit('game-state-update', clientState);

            // If this is a new join (not reconnection), update all players
            if (!result.isReconnection) {
              await gameManager.sendGameStateToAllPlayers(game);

              const playersCount =
                (game.players.X ? 1 : 0) + (game.players.O ? 1 : 0);
              socket.to(gameId).emit('player-joined', {
                player: result.yourPlayer,
                playersCount,
              });
            }
          }
        } catch (error) {
          console.error('Error joining game:', error);
          socket.emit('error', {
            message: 'Failed to join game',
            code: 'JOIN_GAME_ERROR',
          });
        }
      })
    );

    // Leave game - with validation
    socket.on(
      'leave-game',
      withValidationNoData(socket, 'leave-game', async () => {
        console.log(`👋 Leave game request from ${socket.id}`);

        try {
          await gameManager.removePlayerFromGame(socket.id);
        } catch (error) {
          console.error('Error leaving game:', error);
          socket.emit('error', {
            message: 'Failed to leave game',
            code: 'LEAVE_GAME_ERROR',
          });
        }
      })
    );

    // Make move - with validation
    socket.on(
      'make-move',
      withValidation(socket, 'make-move', async position => {
        console.log(`🎯 Move attempt from ${socket.id}:`, position);

        try {
          const result = await gameManager.makeMove(socket.id, position);

          // Send move result to current player
          socket.emit('move-result', {
            success: result.success,
            error: result.error,
            revealedPosition: result.revealedPosition,
          });

          if (result.success) {
            // Get updated game state to send to all players
            const gameId = await gameManager.gameStorage.getSocketGame(
              socket.id
            );
            if (gameId) {
              const game = await gameManager.gameStorage.getGame(gameId);
              if (game) {
                if (result.gameOver && result.gameResult) {
                  // Send game over notification to all players
                  io.to(gameId).emit('game-over', {
                    result: result.gameResult,
                    finalBoard: game.board, // Show full board when game ends
                  });
                }

                // Send updated game state to all players
                await gameManager.sendGameStateToAllPlayers(game);
              }
            }
          }
        } catch (error) {
          console.error('Error making move:', error);
          socket.emit('move-result', {
            success: false,
            error: 'Failed to make move',
          });
        }
      })
    );

    // Connection utilities - with validation
    socket.on(
      'ping',
      withValidationNoData(socket, 'ping', () => {
        socket.emit('pong');
      })
    );

    // Disconnection handling - with error handling
    socket.on(
      'disconnect',
      withErrorHandling(socket, 'disconnect', async reason => {
        console.log(`🔌 Client disconnected: ${socket.id}, reason: ${reason}`);

        try {
          await gameManager.removePlayerFromGame(socket.id);
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      })
    );
  });
}
