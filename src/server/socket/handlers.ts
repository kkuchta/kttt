import type { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../shared';
import type { BotDifficulty } from '../../shared/types/bot';
import { createClientGameState } from '../../shared/utils/gameLogic';
import type { GameManager } from '../game/GameManager';
import type { MatchmakingManager } from '../game/MatchmakingManager';
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
  gameManager: GameManager,
  matchmakingManager: MatchmakingManager
): void {
  io.on('connection', socket => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    // Game creation - with validation
    socket.on(
      'create-game',
      withValidationNoData(socket, 'create-game', async () => {
        console.log(`[REQUEST] Create game request from ${socket.id}`);

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

    // Matchmaking - join queue
    socket.on(
      'join-queue',
      withValidationNoData(socket, 'join-queue', async () => {
        console.log(`[QUEUE] Join queue request from ${socket.id}`);

        try {
          const result = await matchmakingManager.joinQueue(socket.id);

          if (result.success) {
            socket.emit('queue-joined', {
              position: result.position!,
              estimatedWait: result.estimatedWait!,
            });
          } else {
            socket.emit('queue-error', {
              message: result.error || 'Failed to join queue',
            });
          }
        } catch (error) {
          console.error('Error joining queue:', error);
          socket.emit('queue-error', {
            message: 'Failed to join matchmaking queue',
          });
        }
      })
    );

    // Matchmaking - leave queue
    socket.on(
      'leave-queue',
      withValidationNoData(socket, 'leave-queue', async () => {
        console.log(`[QUEUE] Leave queue request from ${socket.id}`);

        try {
          const wasInQueue = matchmakingManager.leaveQueue(socket.id);

          if (wasInQueue) {
            socket.emit('queue-left');
          }
        } catch (error) {
          console.error('Error leaving queue:', error);
          socket.emit('queue-error', {
            message: 'Failed to leave queue',
          });
        }
      })
    );

    // Bot game creation - with validation
    socket.on(
      'create-bot-game',
      withValidation(socket, 'create-bot-game', async data => {
        console.log(`[BOT] Create bot game request from ${socket.id}:`, data);

        try {
          // Remove player from matchmaking queue if they're in one
          const wasInQueue = matchmakingManager.leaveQueue(socket.id);
          if (wasInQueue) {
            console.log(
              `[QUEUE] Removed ${socket.id} from queue to create bot game`
            );
          }

          // Set defaults for optional parameters
          const botDifficulty: BotDifficulty = data.botDifficulty || 'random';
          const humanPlayer = data.humanPlayer || 'X';

          // Create bot game
          const result = await gameManager.createBotGame(
            socket.id,
            botDifficulty,
            humanPlayer
          );

          if (result.success) {
            // Join the Socket.io room
            socket.join(result.gameId);

            // Get the created game to send complete info
            const game = await gameManager.gameStorage.getGame(result.gameId);
            if (game && game.botInfo) {
              socket.emit('bot-game-created', {
                gameId: result.gameId,
                yourPlayer: humanPlayer,
                botPlayer: game.botInfo.botPlayer,
                botDifficulty: game.botInfo.botDifficulty as BotDifficulty,
              });

              // Send initial game state
              const clientState = createClientGameState(game, humanPlayer);
              socket.emit('game-state-update', clientState);
            } else {
              throw new Error('Failed to retrieve created bot game');
            }
          } else {
            socket.emit('bot-game-error', {
              message: 'Failed to create bot game',
            });
          }
        } catch (error) {
          console.error('Error creating bot game:', error);
          socket.emit('bot-game-error', {
            message: 'Failed to create bot game',
          });
        }
      })
    );

    // Game joining - with manual validation for multiple parameters
    socket.on(
      'join-game',
      withErrorHandling(socket, 'join-game', async (gameId, rejoinAsPlayer) => {
        // Manual validation since we have optional parameters
        if (typeof gameId !== 'string' || gameId.length !== 4) {
          socket.emit('error', {
            message: 'Invalid game ID',
            code: 'INVALID_GAME_ID',
          });
          return;
        }

        if (rejoinAsPlayer && !['X', 'O'].includes(rejoinAsPlayer)) {
          socket.emit('error', {
            message: 'Invalid rejoin player',
            code: 'INVALID_REJOIN_PLAYER',
          });
          return;
        }

        console.log(
          `[GAME] Join game request: ${gameId} from ${socket.id}${rejoinAsPlayer ? ` (rejoin as ${rejoinAsPlayer})` : ''}`
        );

        try {
          const result = await gameManager.joinGame(
            socket.id,
            gameId,
            rejoinAsPlayer
          );

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
        console.log(`[REQUEST] Leave game request from ${socket.id}`);

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
        console.log(`[QUEUE] Move attempt from ${socket.id}:`, position);

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

                  // Clean up socket mappings after all notifications are sent
                  await gameManager.cleanupCompletedGame(gameId);
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
        console.log(
          `[SOCKET] Client disconnected: ${socket.id}, reason: ${reason}`
        );

        try {
          // Clean up from both game and matchmaking queue
          await gameManager.removePlayerFromGame(socket.id);
          matchmakingManager.handlePlayerDisconnect(socket.id);
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      })
    );
  });
}
