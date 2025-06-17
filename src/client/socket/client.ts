import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@shared/types/socket';
import { io, Socket } from 'socket.io-client';

// Type-safe Socket.io client
export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Socket connection configuration
const SOCKET_CONFIG = {
  autoConnect: false, // We'll connect manually when needed
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 5000,
};

// Create socket instance
export const socket: TypedSocket = io(
  // In development, connect to localhost:3001 (server port)
  // In production, this will be the same origin
  import.meta.env.DEV ? 'http://localhost:3001' : '',
  SOCKET_CONFIG
);

// Connection state management
export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  gameId: string | null;
  yourPlayer: 'X' | 'O' | null;
}

// Default connection state
export const defaultConnectionState: ConnectionState = {
  isConnected: false,
  isConnecting: false,
  error: null,
  gameId: null,
  yourPlayer: null,
};

// Helper functions for socket connection
export const socketHelpers = {
  connect: () => {
    if (!socket.connected) {
      socket.connect();
    }
  },

  disconnect: () => {
    if (socket.connected) {
      socket.disconnect();
    }
  },

  // Game actions
  createGame: () => {
    socket.emit('create-game');
  },

  joinGame: (gameId: string) => {
    socket.emit('join-game', gameId);
  },

  leaveGame: () => {
    socket.emit('leave-game');
  },

  makeMove: (row: number, col: number) => {
    socket.emit('make-move', { row, col });
  },

  // Connection test
  ping: () => {
    socket.emit('ping');
  },
};
