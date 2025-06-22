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
        X: game.players.X !== null,
        O: game.players.O !== null,
      },
      createdAt: game.createdAt,
      lastActivity: game.lastActivity,
      result: game.result,
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

      if (currentSocketForPlayer && currentSocketForPlayer !== socketId) {
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
      } else if (!currentSocketForPlayer) {
        // Player slot is empty, assign this socket to it
        console.log(
          `🔍 Player slot ${rejoinAsPlayer} is empty, assigning to ${socketId}`
        );

        game.players[rejoinAsPlayer] = socketId;
        game.lastActivity = Date.now();

        // Check if game can start (both players present)
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

    // Check if game is full AFTER checking reconnection scenarios
    if (game.players.X && game.players.O) {
      console.log(`🚫 Game full: ${gameId}`);
      return { success: false, error: 'Game is full' };
    }

    // Assign player to empty slot (normal new join case)
    let assignedPlayer: Player;
    if (!game.players.X) {
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

  // Make a move
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

      return { success: true };
    }
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
    if (game.players.X) {
      const clientStateX = createClientGameState(game, 'X');
      this.io.to(game.players.X).emit('game-state-update', clientStateX);
    }
    if (game.players.O) {
      const clientStateO = createClientGameState(game, 'O');
      this.io.to(game.players.O).emit('game-state-update', clientStateO);
    }
  }
}
