// Socket.io Event Types for Kriegspiel Tic Tac Toe

import { ClientGameState, GameResult, Player, Position } from './game';

// Events sent from client to server
export interface ClientToServerEvents {
  // Game creation and joining
  'create-game': () => void;
  'join-game': (gameId: string) => void;
  'leave-game': () => void;

  // Gameplay
  'make-move': (position: Position) => void;

  // Connection management
  ping: () => void;
}

// Events sent from server to client
export interface ServerToClientEvents {
  // Game management responses
  'game-created': (data: { gameId: string }) => void;
  'game-joined': (data: {
    success: boolean;
    gameState?: ClientGameState;
    yourPlayer?: Player;
    error?: string;
  }) => void;
  'game-full': () => void;
  'game-not-found': () => void;

  // Game state updates
  'game-state-update': (gameState: ClientGameState) => void;
  'player-joined': (data: { player: Player; playersCount: number }) => void;
  'player-left': (data: { player: Player; playersCount: number }) => void;

  // Move responses
  'move-result': (data: {
    success: boolean;
    error?: string;
    revealedPosition?: Position; // If move failed due to occupied cell
  }) => void;

  // Game completion
  'game-over': (data: {
    result: GameResult;
    finalBoard: ClientGameState['visibleBoard'];
  }) => void;

  // Connection/error handling
  error: (data: { message: string; code?: string }) => void;
  pong: () => void;
  reconnected: (gameState: ClientGameState) => void;
}

// Server-side socket data (what we store per socket)
interface ServerSocketData {
  gameId?: string;
  player?: Player;
  userId?: string; // For future user identification
}

// Client-side socket data
export interface ClientSocketData {
  gameId?: string;
  player?: Player;
}

// Full Socket.io TypeScript integration
export interface InterServerEvents {
  // For future multi-server scaling
  'game-update': (gameId: string, gameState: ClientGameState) => void;
}

export interface SocketData extends ServerSocketData {}

// Convenience types for socket event handlers
export type ClientEventHandler<T extends keyof ClientToServerEvents> =
  ClientToServerEvents[T];

export type ServerEventHandler<T extends keyof ServerToClientEvents> =
  ServerToClientEvents[T];

// Error codes for consistent error handling
export const SOCKET_ERROR_CODES = {
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  GAME_FULL: 'GAME_FULL',
  INVALID_MOVE: 'INVALID_MOVE',
  NOT_YOUR_TURN: 'NOT_YOUR_TURN',
  GAME_NOT_ACTIVE: 'GAME_NOT_ACTIVE',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
} as const;

export type SocketErrorCode =
  (typeof SOCKET_ERROR_CODES)[keyof typeof SOCKET_ERROR_CODES];
