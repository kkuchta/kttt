import type { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  GameResult,
  GameState,
  GameStatus,
  InterServerEvents,
  Player,
  ServerToClientEvents,
  SocketData,
} from '../../shared';
import type { BotDifficulty } from '../../shared/types/bot';
import { BOT_CONFIG } from '../../shared/types/bot';
import {
  createClientGameState,
  createEmptyBoard,
  generateGameId,
  getOpponentPlayer,
  isGameOver,
  positionToKey,
  setCellState,
  validateMove,
} from '../../shared/utils/gameLogic';
import type { GameStorage } from '../storage/StorageInterface';
import { createBot, delay } from './BotPlayer';

export class GameManager {
  constructor(
    private storage: GameStorage,
    private io: Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >
  ) {}

  // Public getter for storage access
  get gameStorage(): GameStorage {
    return this.storage;
  }

  // Create a new game state
  createNewGameState(gameId: string): GameState {
    return {
      id: gameId,
      status: 'waiting-for-players' as GameStatus,
      board: createEmptyBoard(),
      currentTurn: 'X' as Player,
      players: {
        X: null,
        O: null,
      },
      revealedCells: new Set<string>(),
      moveHistory: [],
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };
  }

  // Create a new bot game state
  createNewBotGameState(
    gameId: string,
    humanPlayer: Player,
    botDifficulty: BotDifficulty
  ): GameState {
    const botPlayer = getOpponentPlayer(humanPlayer);

    return {
      id: gameId,
      status: 'active' as GameStatus, // Bot games start immediately
      board: createEmptyBoard(),
      currentTurn: 'X' as Player, // X always goes first
      players: {
        X: humanPlayer === 'X' ? null : 'BOT', // Will be filled with socket ID for human
        O: humanPlayer === 'O' ? null : 'BOT', // BOT is placeholder for bot player
      },
      revealedCells: new Set<string>(),
      moveHistory: [],
      createdAt: Date.now(),
      lastActivity: Date.now(),
      botInfo: {
        isBot: true,
        botPlayer,
        humanPlayer,
        botDifficulty,
      },
    };
  }

  // Create a bot game
  async createBotGame(
    humanSocketId: string,
    botDifficulty: BotDifficulty = 'random',
    humanPlayer: Player = 'X'
  ): Promise<{ gameId: string; success: boolean }> {
    const gameId = generateGameId();
    const newGame = this.createNewBotGameState(
      gameId,
      humanPlayer,
      botDifficulty
    );

    // Assign human player
    newGame.players[humanPlayer] = humanSocketId;

    // Create game (bot games will have shorter TTL handled by storage cleanup)
    await this.storage.createGame(gameId, newGame);
    await this.storage.setSocketGame(humanSocketId, gameId);

    console.log(
      `🤖 Created bot game ${gameId}: Human ${humanSocketId} (${humanPlayer}) vs ${botDifficulty} bot (${newGame.botInfo!.botPlayer})`
    );

    // If bot goes first, schedule bot move
    if (newGame.currentTurn === newGame.botInfo!.botPlayer) {
      this.scheduleBotMove(gameId).catch(error => {
        console.error(
          `🤖 Error scheduling initial bot move for game ${gameId}:`,
          error
        );
      });
    }

    return { gameId, success: true };
  }

  // Schedule a bot move with realistic delay
  private async scheduleBotMove(gameId: string): Promise<void> {
    const game = await this.storage.getGame(gameId);
    if (!game || !game.botInfo || game.status !== 'active') {
      return;
    }

    const bot = createBot(game.botInfo.botDifficulty as BotDifficulty);
    const botPlayer = game.botInfo.botPlayer;

    try {
      // Create filtered game state for bot (same as human players)
      const botClientState = createClientGameState(game, botPlayer);

      // Get bot's move decision
      const botMoveResult = await bot.makeMove(botClientState, botPlayer);

      // Wait for bot's "thinking" time
      await delay(
        Math.max(botMoveResult.thinkingTime, BOT_CONFIG.MIN_THINKING_TIME)
      );

      // Execute bot move
      await this.executeBotMove(gameId, botPlayer, botMoveResult.position);
    } catch (error) {
      console.error(`🤖 Bot move error in game ${gameId}:`, error);
    }
  }

  // Execute a bot move (internal method)
  private async executeBotMove(
    gameId: string,
    botPlayer: Player,
    position: { row: number; col: number }
  ): Promise<void> {
    const game = await this.storage.getGame(gameId);
    if (!game || !game.botInfo || game.status !== 'active') {
      console.log(
        `🤖 Cannot execute bot move - game ${gameId} not found or not active`
      );
      return;
    }

    // Validate it's the bot's turn
    if (game.currentTurn !== botPlayer) {
      console.log(
        `🤖 Bot move attempted but it's not bot's turn in game ${gameId}`
      );
      return;
    }

    // Validate the move using existing game logic
    const moveResult = validateMove(game, botPlayer, position);

    // Update last activity
    game.lastActivity = Date.now();

    if (!moveResult.success) {
      if (moveResult.revealed) {
        // Bot hit occupied cell - reveal and switch turns
        const revealedKey = positionToKey(moveResult.revealed);
        game.revealedCells.add(revealedKey);
        game.currentTurn = getOpponentPlayer(botPlayer);

        console.log(
          `🤖 Bot move failed - revealing piece at ${revealedKey}, switching to ${game.currentTurn}`
        );

        await this.storage.updateGame(gameId, game);
        await this.sendGameStateToAllPlayers(game);
        return;
      } else {
        // Other validation error
        console.error(`🤖 Bot move validation failed: ${moveResult.error}`);
        return;
      }
    }

    // Move is valid - place the piece
    game.board = setCellState(game.board, position, botPlayer);

    // Add to move history
    game.moveHistory.push({
      player: botPlayer,
      position,
      timestamp: Date.now(),
    });

    console.log(
      `🤖 Bot (${botPlayer}) placed piece at (${position.row},${position.col})`
    );

    // Check if game is over
    const gameResult = isGameOver(game.board);
    if (gameResult) {
      // Game is complete
      game.status = 'completed';
      game.result = gameResult;

      console.log(
        `🏁 Bot game ${gameId} completed:`,
        gameResult.winner ? `${gameResult.winner} wins!` : 'Draw'
      );

      await this.storage.updateGame(gameId, game);

      // Notify human player of game over
      const humanPlayer = game.botInfo.humanPlayer;
      const humanSocketId = game.players[humanPlayer];
      if (humanSocketId && humanSocketId !== 'BOT') {
        this.io.to(humanSocketId).emit('game-over', {
          result: gameResult,
          finalBoard: game.board,
        });
      }

      await this.sendGameStateToAllPlayers(game);

      // Clean up socket mappings after all notifications are sent
      await this.cleanupCompletedGame(gameId);
    } else {
      // Game continues - switch turns
      game.currentTurn = getOpponentPlayer(botPlayer);

      console.log(`🔄 Bot game turn switched to ${game.currentTurn}`);

      await this.storage.updateGame(gameId, game);
      await this.sendGameStateToAllPlayers(game);

      // If it's still the bot's turn (bot hit occupied cell and lost turn), schedule another move
      if (game.currentTurn === botPlayer) {
        this.scheduleBotMove(gameId).catch(error => {
          console.error(
            `🤖 Error scheduling follow-up bot move for game ${gameId}:`,
            error
          );
        });
      }
    }
  }

  // Modified makeMove to handle bot games
  async makeMove(
    socketId: string,
    position: { row: number; col: number }
  ): Promise<{
    success: boolean;
    error?: string;
    revealedPosition?: { row: number; col: number };
    gameOver?: boolean;
    gameResult?: GameResult;
  }> {
    const gameId = await this.storage.getSocketGame(socketId);
    if (!gameId) {
      console.log(`❌ Player ${socketId} not in any game`);
      return { success: false, error: 'You are not in a game' };
    }

    const game = await this.storage.getGame(gameId);
    if (!game) {
      console.log(`❌ Game not found: ${gameId}`);
      return { success: false, error: 'Game not found' };
    }

    // Determine which player this socket represents
    let currentPlayer: Player | null = null;
    if (game.players.X === socketId) {
      currentPlayer = 'X';
    } else if (game.players.O === socketId) {
      currentPlayer = 'O';
    }

    if (!currentPlayer) {
      console.log(`❌ Player ${socketId} not in game ${gameId}`);
      return { success: false, error: 'You are not a player in this game' };
    }

    // Validate the move using existing game logic
    const moveResult = validateMove(game, currentPlayer, position);

    // Update last activity
    game.lastActivity = Date.now();

    if (!moveResult.success) {
      if (moveResult.revealed) {
        // Kriegspiel rule: Move failed because cell was occupied
        // Reveal the opponent's piece and switch turns
        const revealedKey = positionToKey(moveResult.revealed);
        game.revealedCells.add(revealedKey);

        // Player loses their turn
        game.currentTurn = getOpponentPlayer(currentPlayer);

        console.log(
          `💥 Move failed - revealing opponent piece at ${revealedKey}, switching to ${game.currentTurn}`
        );

        await this.storage.updateGame(gameId, game);
        await this.sendGameStateToAllPlayers(game);

        // If it's now the bot's turn, schedule bot move
        if (game.botInfo && game.currentTurn === game.botInfo.botPlayer) {
          this.scheduleBotMove(gameId).catch(error => {
            console.error(
              `🤖 Error scheduling bot move after human failed move in game ${gameId}:`,
              error
            );
          });
        }

        return {
          success: false,
          error: 'Cell is occupied',
          revealedPosition: moveResult.revealed,
        };
      } else {
        // Other validation error (not your turn, invalid position, etc.)
        console.log(`❌ Move validation failed: ${moveResult.error}`);
        return { success: false, error: moveResult.error };
      }
    }

    // Move is valid - place the piece
    game.board = setCellState(game.board, position, currentPlayer);

    // Add to move history
    game.moveHistory.push({
      player: currentPlayer,
      position,
      timestamp: Date.now(),
    });

    console.log(
      `✅ Player ${currentPlayer} placed piece at (${position.row},${position.col})`
    );

    // Check if game is over
    const gameResult = isGameOver(game.board);
    if (gameResult) {
      // Game is complete
      game.status = 'completed';
      game.result = gameResult;

      console.log(
        `🏁 Game ${gameId} completed:`,
        gameResult.winner ? `${gameResult.winner} wins!` : 'Draw'
      );

      await this.storage.updateGame(gameId, game);

      return { success: true, gameOver: true, gameResult };
    } else {
      // Game continues - switch turns
      game.currentTurn = getOpponentPlayer(currentPlayer);

      console.log(`🔄 Turn switched to ${game.currentTurn}`);

      await this.storage.updateGame(gameId, game);

      // If it's now the bot's turn, schedule bot move
      if (game.botInfo && game.currentTurn === game.botInfo.botPlayer) {
        this.scheduleBotMove(gameId).catch(error => {
          console.error(
            `🤖 Error scheduling bot move after human move in game ${gameId}:`,
            error
          );
        });
      }

      return { success: true };
    }
  }

  // Create a new game via API
  async createGameViaAPI(): Promise<{ gameId: string; success: boolean }> {
    const gameId = generateGameId();
    const newGame = this.createNewGameState(gameId);

    await this.storage.createGame(gameId, newGame);

    console.log(`🎮 Created game via API: ${gameId}`);

    return { gameId, success: true };
  }

  // Get game state for API
  async getGameForAPI(gameId: string) {
    const game = await this.storage.getGame(gameId);

    if (!game) {
      return null;
    }

    // Return a basic game state without player-specific filtering
    return {
      id: game.id,
      status: game.status,
      currentTurn: game.currentTurn,
      playersConnected: {
        X: game.players.X !== null && game.players.X !== 'BOT',
        O: game.players.O !== null && game.players.O !== 'BOT',
      },
      createdAt: game.createdAt,
      lastActivity: game.lastActivity,
      result: game.result,
      botInfo: game.botInfo,
    };
  }

  // Create game via socket
  async createGameViaSocket(
    socketId: string
  ): Promise<{ gameId: string; yourPlayer: Player }> {
    const gameId = generateGameId();
    const newGame = this.createNewGameState(gameId);
    newGame.players.X = socketId; // Creator becomes player X
    newGame.status = 'waiting-for-players';

    await this.storage.createGame(gameId, newGame);
    await this.storage.setSocketGame(socketId, gameId);

    console.log(`🎮 Created game ${gameId}, creator: ${socketId} (X)`);

    return { gameId, yourPlayer: 'X' };
  }

  // Join a game
  async joinGame(
    socketId: string,
    gameId: string,
    rejoinAsPlayer?: Player
  ): Promise<{
    success: boolean;
    yourPlayer?: Player;
    error?: string;
    isReconnection?: boolean;
  }> {
    const game = await this.storage.getGame(gameId);
    if (!game) {
      console.log(`❌ Game not found: ${gameId}`);
      return { success: false, error: 'Game not found' };
    }

    console.log(`🔍 Join game debug - Game ${gameId}:`, {
      currentPlayers: game.players,
      requestingSocket: socketId,
      rejoinAsPlayer,
    });

    // Check if player is already in this game FIRST (exact socket ID match)
    if (game.players.X === socketId || game.players.O === socketId) {
      console.log(`🔄 Player ${socketId} already in game ${gameId}`);
      const yourPlayer = game.players.X === socketId ? 'X' : 'O';

      await this.storage.setSocketGame(socketId, gameId);

      return { success: true, yourPlayer, isReconnection: true };
    }

    // Handle reconnection case: client is trying to rejoin as a specific player
    if (rejoinAsPlayer) {
      const currentSocketForPlayer = game.players[rejoinAsPlayer];

      console.log(`🔍 Rejoin attempt - Player ${rejoinAsPlayer}:`, {
        currentSocketForPlayer,
        newSocketId: socketId,
        isReconnection:
          currentSocketForPlayer && currentSocketForPlayer !== socketId,
      });

      if (
        currentSocketForPlayer &&
        currentSocketForPlayer !== socketId &&
        currentSocketForPlayer !== 'BOT'
      ) {
        // There's already a different socket ID for this player - this is a reconnection
        console.log(
          `🔄 Reconnecting player ${rejoinAsPlayer}: updating socket ${currentSocketForPlayer} → ${socketId}`
        );

        // Update the socket ID for this player
        game.players[rejoinAsPlayer] = socketId;
        game.lastActivity = Date.now();

        await this.storage.updateGame(gameId, game);
        await this.storage.setSocketGame(socketId, gameId);

        return {
          success: true,
          yourPlayer: rejoinAsPlayer,
          isReconnection: true,
        };
      } else if (!currentSocketForPlayer || currentSocketForPlayer === 'BOT') {
        // Player slot is empty or is a bot slot, assign this socket to it
        console.log(
          `🔍 Player slot ${rejoinAsPlayer} is ${!currentSocketForPlayer ? 'empty' : 'bot'}, assigning to ${socketId}`
        );

        game.players[rejoinAsPlayer] = socketId;
        game.lastActivity = Date.now();

        // Check if game can start (both players present, excluding bots)
        if (game.players.X && game.players.O) {
          game.status = 'active';
        }

        await this.storage.updateGame(gameId, game);
        await this.storage.setSocketGame(socketId, gameId);

        console.log(
          `✅ Player ${socketId} joined game ${gameId} as ${rejoinAsPlayer} (requested slot)`
        );

        return { success: true, yourPlayer: rejoinAsPlayer };
      }
      // If currentSocketForPlayer === socketId, this is handled by the first check above
    }

    console.log(`🔍 Final check - Game players:`, game.players);

    // Check if game is full AFTER checking reconnection scenarios (exclude BOT slots)
    const humanPlayersCount = Object.values(game.players).filter(
      p => p !== null && p !== 'BOT'
    ).length;
    const availableSlots = Object.values(game.players).filter(
      p => p === null || p === 'BOT'
    );

    if (humanPlayersCount >= 2 || availableSlots.length === 0) {
      console.log(`🚫 Game full: ${gameId}`);
      return { success: false, error: 'Game is full' };
    }

    // Assign player to empty slot (normal new join case)
    let assignedPlayer: Player;
    if (!game.players.X || game.players.X === 'BOT') {
      game.players.X = socketId;
      assignedPlayer = 'X';
    } else {
      game.players.O = socketId;
      assignedPlayer = 'O';
    }

    // Update game state
    game.lastActivity = Date.now();

    // Check if game can start (both players present)
    if (game.players.X && game.players.O) {
      game.status = 'active';
    }

    await this.storage.updateGame(gameId, game);
    await this.storage.setSocketGame(socketId, gameId);

    console.log(
      `✅ Player ${socketId} joined game ${gameId} as ${assignedPlayer}`
    );

    return { success: true, yourPlayer: assignedPlayer };
  }

  // Remove a player from a game
  async removePlayerFromGame(socketId: string): Promise<void> {
    const gameId = await this.storage.getSocketGame(socketId);
    if (!gameId) return;

    const game = await this.storage.getGame(gameId);
    if (!game) return;

    // Determine which player left
    let leftPlayer: Player | null = null;
    if (game.players.X === socketId) {
      game.players.X = null;
      leftPlayer = 'X';
    } else if (game.players.O === socketId) {
      game.players.O = null;
      leftPlayer = 'O';
    }

    if (leftPlayer) {
      console.log(`👋 Player ${socketId} (${leftPlayer}) left game ${gameId}`);

      // Remove from tracking
      await this.storage.removeSocketGame(socketId);

      // Update game state
      game.lastActivity = Date.now();

      // For bot games, clean up immediately when human leaves
      if (game.botInfo) {
        console.log(
          `🗑️ Cleaning up bot game ${gameId} after human player left`
        );
        await this.storage.deleteGame(gameId);
        return;
      }

      // Update game status based on remaining players
      const playersCount = (game.players.X ? 1 : 0) + (game.players.O ? 1 : 0);
      if (playersCount === 0) {
        // Game is empty, clean it up
        console.log(`🗑️ Cleaning up empty game ${gameId}`);
        await this.storage.deleteGame(gameId);
      } else {
        if (playersCount === 1 && game.status === 'active') {
          // Game was active but now has only one player
          game.status = 'waiting-for-players';
        }
        await this.storage.updateGame(gameId, game);

        // Notify remaining players
        this.io.to(gameId).emit('player-left', {
          player: leftPlayer,
          playersCount,
        });
      }
    }
  }

  // Send game state updates to all players in a game
  async sendGameStateToAllPlayers(game: GameState): Promise<void> {
    if (game.players.X && game.players.X !== 'BOT') {
      const clientStateX = createClientGameState(game, 'X');
      this.io.to(game.players.X).emit('game-state-update', clientStateX);
    }
    if (game.players.O && game.players.O !== 'BOT') {
      const clientStateO = createClientGameState(game, 'O');
      this.io.to(game.players.O).emit('game-state-update', clientStateO);
    }
  }

  // Clean up socket mappings for completed games
  async cleanupCompletedGame(gameId: string): Promise<void> {
    const game = await this.storage.getGame(gameId);
    if (!game || game.status !== 'completed') {
      return;
    }

    // Clean up socket-to-game mappings for both players so they can join new games/queue
    if (game.players.X && game.players.X !== 'BOT') {
      await this.storage.removeSocketGame(game.players.X);
      console.log(
        `🧹 Cleaned up socket mapping for player X: ${game.players.X}`
      );
    }
    if (game.players.O && game.players.O !== 'BOT') {
      await this.storage.removeSocketGame(game.players.O);
      console.log(
        `🧹 Cleaned up socket mapping for player O: ${game.players.O}`
      );
    }
  }
}
