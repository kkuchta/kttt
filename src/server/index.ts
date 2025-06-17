import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  GameState,
  GameStatus,
  InterServerEvents,
  Player,
  ServerToClientEvents,
  SocketData,
} from '../shared';
import {
  createClientGameState,
  createEmptyBoard,
  generateGameId,
  getOpponentPlayer,
  isGameOver,
  positionToKey,
  setCellState,
  validateMove,
} from '../shared/utils/gameLogic';

// In-memory storage for active games using full GameState
const activeGames = new Map<string, GameState>();

// Socket to game mapping for cleanup
const socketToGame = new Map<string, string>();

const app = express();
const server = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173', 'null'], // Allow both Vite ports and file:// protocol
    methods: ['GET', 'POST'],
  },
});

const PORT = 3001;

// Middleware
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  })
);
app.use(express.json());

// Helper function to create a new game state
function createNewGameState(gameId: string): GameState {
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

// Basic test route
app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    message: 'Kriegspiel Tic Tac Toe server is running',
    timestamp: new Date().toISOString(),
  });
});

// REST API: Create a new game
app.post('/api/games', (_req, res) => {
  try {
    const gameId = generateGameId();
    const newGame = createNewGameState(gameId);

    activeGames.set(gameId, newGame);

    console.log(`🎮 Created game via API: ${gameId}`);

    res.status(201).json({
      gameId,
      success: true,
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create game',
    });
  }
});

// REST API: Get game state
app.get('/api/games/:gameId', (req, res) => {
  try {
    const { gameId } = req.params;
    const game = activeGames.get(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Game not found',
      });
    }

    // Return a basic game state without player-specific filtering
    // This endpoint is mainly for checking if a game exists and its basic status
    const publicGameState = {
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

    res.json({
      success: true,
      game: publicGameState,
    });
  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game state',
    });
  }
});

// Socket.io connection handling
io.on('connection', socket => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Game creation
  socket.on('create-game', () => {
    console.log(`📝 Create game request from ${socket.id}`);
    const gameId = generateGameId();

    // Create new game state
    const newGame = createNewGameState(gameId);
    newGame.players.X = socket.id; // Creator becomes player X
    newGame.status = 'waiting-for-players';

    // Store the game
    activeGames.set(gameId, newGame);
    socketToGame.set(socket.id, gameId);

    // Join the Socket.io room
    socket.join(gameId);

    console.log(`🎮 Created game ${gameId}, creator: ${socket.id} (X)`);
    socket.emit('game-created', {
      gameId,
      yourPlayer: 'X',
    });
  });

  // Game joining
  socket.on('join-game', gameId => {
    console.log(`🎮 Join game request: ${gameId} from ${socket.id}`);

    const game = activeGames.get(gameId);
    if (!game) {
      console.log(`❌ Game not found: ${gameId}`);
      socket.emit('game-not-found');
      return;
    }

    // Check if game is full
    if (game.players.X && game.players.O) {
      console.log(`🚫 Game full: ${gameId}`);
      socket.emit('game-full');
      return;
    }

    // Check if player is already in this game
    if (game.players.X === socket.id || game.players.O === socket.id) {
      console.log(`🔄 Player ${socket.id} already in game ${gameId}`);
      const yourPlayer = game.players.X === socket.id ? 'X' : 'O';
      socket.emit('game-joined', {
        success: true,
        yourPlayer,
      });

      // Send current game state
      const clientState = createClientGameState(game, yourPlayer);
      socket.emit('game-state-update', clientState);
      return;
    }

    // Assign player to empty slot
    let assignedPlayer: Player;
    if (!game.players.X) {
      game.players.X = socket.id;
      assignedPlayer = 'X';
    } else {
      game.players.O = socket.id;
      assignedPlayer = 'O';
    }

    // Update game state
    game.lastActivity = Date.now();

    // Check if game can start (both players present)
    if (game.players.X && game.players.O) {
      game.status = 'active';
    }

    socketToGame.set(socket.id, gameId);

    // Join the Socket.io room
    socket.join(gameId);

    console.log(
      `✅ Player ${socket.id} joined game ${gameId} as ${assignedPlayer}`
    );

    // Notify the joining player
    socket.emit('game-joined', {
      success: true,
      yourPlayer: assignedPlayer,
    });

    // Send current game state to all players
    const playersCount = (game.players.X ? 1 : 0) + (game.players.O ? 1 : 0);

    // Send filtered game state to each player
    if (game.players.X) {
      const clientStateX = createClientGameState(game, 'X');
      io.to(game.players.X).emit('game-state-update', clientStateX);
    }
    if (game.players.O) {
      const clientStateO = createClientGameState(game, 'O');
      io.to(game.players.O).emit('game-state-update', clientStateO);
    }

    // Notify other players in the room
    socket.to(gameId).emit('player-joined', {
      player: assignedPlayer,
      playersCount,
    });
  });

  // Leave game
  socket.on('leave-game', () => {
    console.log(`👋 Leave game request from ${socket.id}`);

    const gameId = socketToGame.get(socket.id);
    if (!gameId) {
      console.log(`❌ Player ${socket.id} not in any game`);
      return;
    }

    removePlayerFromGame(socket.id, gameId);
  });

  // Make move
  socket.on('make-move', position => {
    console.log(`🎯 Move attempt from ${socket.id}:`, position);

    const gameId = socketToGame.get(socket.id);
    if (!gameId) {
      console.log(`❌ Player ${socket.id} not in any game`);
      socket.emit('move-result', {
        success: false,
        error: 'You are not in a game',
      });
      return;
    }

    const game = activeGames.get(gameId);
    if (!game) {
      console.log(`❌ Game not found: ${gameId}`);
      socket.emit('move-result', {
        success: false,
        error: 'Game not found',
      });
      return;
    }

    // Determine which player this socket represents
    let currentPlayer: Player | null = null;
    if (game.players.X === socket.id) {
      currentPlayer = 'X';
    } else if (game.players.O === socket.id) {
      currentPlayer = 'O';
    }

    if (!currentPlayer) {
      console.log(`❌ Player ${socket.id} not in game ${gameId}`);
      socket.emit('move-result', {
        success: false,
        error: 'You are not a player in this game',
      });
      return;
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

        // Send move result to the player who made the invalid move
        socket.emit('move-result', {
          success: false,
          error: 'Cell is occupied',
          revealedPosition: moveResult.revealed,
        });

        // Send updated game state to all players
        sendGameStateToAllPlayers(game);
      } else {
        // Other validation error (not your turn, invalid position, etc.)
        console.log(`❌ Move validation failed: ${moveResult.error}`);
        socket.emit('move-result', {
          success: false,
          error: moveResult.error,
        });
      }
      return;
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

      // Send move result to current player
      socket.emit('move-result', { success: true });

      // Send game over notification to all players
      io.to(gameId).emit('game-over', {
        result: gameResult,
        finalBoard: game.board, // Show full board when game ends
      });

      // Send final game state to all players
      sendGameStateToAllPlayers(game);
    } else {
      // Game continues - switch turns
      game.currentTurn = getOpponentPlayer(currentPlayer);

      console.log(`🔄 Turn switched to ${game.currentTurn}`);

      // Send move result to current player
      socket.emit('move-result', { success: true });

      // Send updated game state to all players
      sendGameStateToAllPlayers(game);
    }
  });

  // Connection utilities
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // Disconnection handling
  socket.on('disconnect', reason => {
    console.log(`🔌 Client disconnected: ${socket.id}, reason: ${reason}`);

    const gameId = socketToGame.get(socket.id);
    if (gameId) {
      removePlayerFromGame(socket.id, gameId);
    }
  });
});

// Helper function to remove a player from a game
function removePlayerFromGame(socketId: string, gameId: string) {
  const game = activeGames.get(gameId);
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
    socketToGame.delete(socketId);

    // Update game state
    game.lastActivity = Date.now();

    // Update game status based on remaining players
    const playersCount = (game.players.X ? 1 : 0) + (game.players.O ? 1 : 0);
    if (playersCount === 0) {
      // Game is empty, clean it up
      console.log(`🗑️ Cleaning up empty game ${gameId}`);
      activeGames.delete(gameId);
    } else if (playersCount === 1 && game.status === 'active') {
      // Game was active but now has only one player
      game.status = 'waiting-for-players';
    }

    // Notify remaining players
    if (playersCount > 0) {
      io.to(gameId).emit('player-left', {
        player: leftPlayer,
        playersCount,
      });
    }
  }
}

// Helper function to send game state updates to all players in a game
function sendGameStateToAllPlayers(game: GameState) {
  if (game.players.X) {
    const clientStateX = createClientGameState(game, 'X');
    io.to(game.players.X).emit('game-state-update', clientStateX);
  }
  if (game.players.O) {
    const clientStateO = createClientGameState(game, 'O');
    io.to(game.players.O).emit('game-state-update', clientStateO);
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🆕 Create game: POST http://localhost:${PORT}/api/games`);
  console.log(
    `📋 Get game state: GET http://localhost:${PORT}/api/games/:gameId`
  );
  console.log(`🔌 Socket.io ready for connections`);
});
