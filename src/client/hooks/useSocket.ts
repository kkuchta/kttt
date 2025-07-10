import { BotDifficulty } from '@shared/types/bot';
import {
  ClientGameState,
  GameResult,
  Player,
  Position,
} from '@shared/types/game';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ConnectionState,
  defaultConnectionState,
  socket,
  socketHelpers,
} from '../socket/client';

// Event handlers interface for the hook
export interface SocketEventHandlers {
  onGameCreated?: (data: { gameId: string; yourPlayer: Player }) => void;
  onGameJoined?: (data: {
    success: boolean;
    gameState?: ClientGameState;
    yourPlayer?: Player;
    error?: string;
  }) => void;
  onGameStateUpdate?: (gameState: ClientGameState) => void;
  onMoveResult?: (data: {
    success: boolean;
    error?: string;
    revealedPosition?: Position;
  }) => void;
  onGameOver?: (data: {
    result: GameResult;
    finalBoard: ClientGameState['visibleBoard'];
  }) => void;
  onPlayerJoined?: (data: { player: Player; playersCount: number }) => void;
  onPlayerLeft?: (data: { player: Player; playersCount: number }) => void;
  onError?: (data: { message: string; code?: string }) => void;
  onGameFull?: () => void;
  onGameNotFound?: () => void;
  onReconnected?: (gameState: ClientGameState) => void;

  // Matchmaking events
  onQueueJoined?: (data: { position: number; estimatedWait: number }) => void;
  onQueueLeft?: () => void;
  onQueueStatus?: (data: {
    position: number;
    queueSize: number;
    estimatedWait: number;
  }) => void;
  onMatchFound?: (data: { gameId: string; yourPlayer: Player }) => void;
  onQueueError?: (data: { message: string }) => void;

  // Bot game events
  onBotGameCreated?: (data: {
    gameId: string;
    yourPlayer: Player;
    botPlayer: Player;
    botDifficulty: BotDifficulty;
  }) => void;
  onBotGameError?: (data: { message: string }) => void;

  // New event for opponent hit piece
  onOpponentHitPiece?: (data: { hitPosition: Position }) => void;
}

export function useSocket(handlers: SocketEventHandlers = {}) {
  // Initialize connection state based on actual socket status
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    () => ({
      ...defaultConnectionState,
      isConnected: socket.connected, // Check actual socket connection status
    })
  );
  const [gameState, setGameState] = useState<ClientGameState | null>(null);

  // Use refs to avoid stale closures in event handlers
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  // Connection management
  const connect = useCallback(() => {
    if (!socket.connected && !connectionState.isConnecting) {
      setConnectionState(prev => ({
        ...prev,
        isConnecting: true,
        error: null,
      }));
      socketHelpers.connect();
    }
  }, [connectionState.isConnecting]);

  const disconnect = useCallback(() => {
    socketHelpers.disconnect();
  }, []);

  // Game actions
  const createGame = useCallback(() => {
    if (socket.connected) {
      socketHelpers.createGame();
    }
  }, []);

  const createBotGame = useCallback(
    (botDifficulty: BotDifficulty = 'random', humanPlayer: Player = 'X') => {
      if (socket.connected) {
        socket.emit('create-bot-game', { botDifficulty, humanPlayer });
      }
    },
    []
  );

  const joinGame = useCallback((gameId: string, rejoinAsPlayer?: 'X' | 'O') => {
    if (socket.connected) {
      socketHelpers.joinGame(gameId, rejoinAsPlayer);
    }
  }, []);

  const leaveGame = useCallback(() => {
    if (socket.connected) {
      socketHelpers.leaveGame();
    }
  }, []);

  const makeMove = useCallback((row: number, col: number) => {
    if (socket.connected) {
      socketHelpers.makeMove(row, col);
    }
  }, []);

  const ping = useCallback(() => {
    if (socket.connected) {
      socketHelpers.ping();
    }
  }, []);

  // Matchmaking actions
  const joinQueue = useCallback(() => {
    if (socket.connected) {
      socket.emit('join-queue');
    }
  }, []);

  const leaveQueue = useCallback(() => {
    if (socket.connected) {
      socket.emit('leave-queue');
    }
  }, []);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Game management events
    const handleGameCreated = (data: {
      gameId: string;
      yourPlayer: Player;
    }) => {
      setConnectionState(prev => ({
        ...prev,
        gameId: data.gameId,
        yourPlayer: data.yourPlayer,
      }));
      handlersRef.current.onGameCreated?.(data);
    };

    const handleGameJoined = (data: {
      success: boolean;
      gameState?: ClientGameState;
      yourPlayer?: Player;
      error?: string;
    }) => {
      if (data.success && data.gameState && data.yourPlayer) {
        setConnectionState(prev => ({
          ...prev,
          gameId: data.gameState!.id,
          yourPlayer: data.yourPlayer!,
        }));
        setGameState(data.gameState);
      }
      handlersRef.current.onGameJoined?.(data);
    };

    const handleGameStateUpdate = (newGameState: ClientGameState) => {
      setGameState(newGameState);
      handlersRef.current.onGameStateUpdate?.(newGameState);
    };

    const handlePlayerJoined = (data: {
      player: Player;
      playersCount: number;
    }) => {
      handlersRef.current.onPlayerJoined?.(data);
    };

    const handlePlayerLeft = (data: {
      player: Player;
      playersCount: number;
    }) => {
      handlersRef.current.onPlayerLeft?.(data);
    };

    const handleMoveResult = (data: {
      success: boolean;
      error?: string;
      revealedPosition?: { row: number; col: number };
    }) => {
      handlersRef.current.onMoveResult?.(data);
    };

    const handleOpponentHitPiece = (data: { hitPosition: Position }) => {
      console.log('Opponent hit your piece at:', data.hitPosition);
      handlersRef.current.onOpponentHitPiece?.(data);
    };

    const handleGameOver = (data: {
      result: GameResult;
      finalBoard: ClientGameState['visibleBoard'];
    }) => {
      handlersRef.current.onGameOver?.(data);
    };

    // Bot game events
    const handleBotGameCreated = (data: {
      gameId: string;
      yourPlayer: Player;
      botPlayer: Player;
      botDifficulty: BotDifficulty;
    }) => {
      setConnectionState(prev => ({
        ...prev,
        gameId: data.gameId,
        yourPlayer: data.yourPlayer,
      }));
      handlersRef.current.onBotGameCreated?.(data);
    };

    const handleBotGameError = (data: { message: string }) => {
      setConnectionState(prev => ({ ...prev, error: data.message }));
      handlersRef.current.onBotGameError?.(data);
    };

    // Matchmaking events
    const handleQueueJoined = (data: {
      position: number;
      estimatedWait: number;
    }) => {
      handlersRef.current.onQueueJoined?.(data);
    };

    const handleQueueLeft = () => {
      handlersRef.current.onQueueLeft?.();
    };

    const handleQueueStatus = (data: {
      position: number;
      queueSize: number;
      estimatedWait: number;
    }) => {
      handlersRef.current.onQueueStatus?.(data);
    };

    const handleMatchFound = (data: { gameId: string; yourPlayer: Player }) => {
      setConnectionState(prev => ({
        ...prev,
        gameId: data.gameId,
        yourPlayer: data.yourPlayer,
      }));
      handlersRef.current.onMatchFound?.(data);
    };

    const handleQueueError = (data: { message: string }) => {
      handlersRef.current.onQueueError?.(data);
    };

    // Error handling
    const handleError = (data: { message: string; code?: string }) => {
      setConnectionState(prev => ({ ...prev, error: data.message }));
      handlersRef.current.onError?.(data);
    };

    const handleGameFull = () => {
      handlersRef.current.onGameFull?.();
    };

    const handleGameNotFound = () => {
      handlersRef.current.onGameNotFound?.();
    };

    // Connection events
    const handleConnect = () => {
      console.log('Connected to server');
      setConnectionState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
      }));
    };

    const handleDisconnect = () => {
      console.log('Disconnected from server');
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: 'Connection lost',
      }));
    };

    const handleConnectError = (error: Error) => {
      console.error('Connection error:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: 'Failed to connect',
      }));
    };

    // Set up event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('game-created', handleGameCreated);
    socket.on('game-joined', handleGameJoined);
    socket.on('game-state-update', handleGameStateUpdate);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);
    socket.on('move-result', handleMoveResult);
    socket.on('opponent-hit-piece', handleOpponentHitPiece);
    socket.on('game-over', handleGameOver);
    socket.on('bot-game-created', handleBotGameCreated);
    socket.on('bot-game-error', handleBotGameError);
    socket.on('queue-joined', handleQueueJoined);
    socket.on('queue-left', handleQueueLeft);
    socket.on('queue-status', handleQueueStatus);
    socket.on('match-found', handleMatchFound);
    socket.on('queue-error', handleQueueError);
    socket.on('error', handleError);
    socket.on('game-full', handleGameFull);
    socket.on('game-not-found', handleGameNotFound);

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('game-created', handleGameCreated);
      socket.off('game-joined', handleGameJoined);
      socket.off('game-state-update', handleGameStateUpdate);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('move-result', handleMoveResult);
      socket.off('opponent-hit-piece', handleOpponentHitPiece);
      socket.off('game-over', handleGameOver);
      socket.off('bot-game-created', handleBotGameCreated);
      socket.off('bot-game-error', handleBotGameError);
      socket.off('queue-joined', handleQueueJoined);
      socket.off('queue-left', handleQueueLeft);
      socket.off('queue-status', handleQueueStatus);
      socket.off('match-found', handleMatchFound);
      socket.off('queue-error', handleQueueError);
      socket.off('error', handleError);
      socket.off('game-full', handleGameFull);
      socket.off('game-not-found', handleGameNotFound);
    };
  }, [socket, handlersRef]);

  // Only leave game when the browser/tab is actually closing
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket.connected && connectionState.gameId) {
        socketHelpers.leaveGame();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [connectionState.gameId]);

  return {
    // Connection state
    connectionState,
    gameState,

    // Connection actions
    connect,
    disconnect,

    // Game actions
    createGame,
    createBotGame,
    joinGame,
    leaveGame,
    makeMove,
    ping,

    // Matchmaking actions
    joinQueue,
    leaveQueue,

    // Socket reference for direct access
    socket,

    // Convenience getters
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    error: connectionState.error,
    gameId: connectionState.gameId,
    yourPlayer: connectionState.yourPlayer,
  };
}
