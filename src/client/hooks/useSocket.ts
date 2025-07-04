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
    // Connection events
    const onConnect = () => {
      setConnectionState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
      }));
    };

    const onDisconnect = () => {
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
      }));
    };

    const onConnectError = (error: Error) => {
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: error.message,
      }));
    };

    // Game events
    const onGameCreated = (data: { gameId: string; yourPlayer: Player }) => {
      setConnectionState(prev => ({
        ...prev,
        gameId: data.gameId,
        yourPlayer: data.yourPlayer,
      }));
      handlersRef.current.onGameCreated?.(data);
    };

    const onBotGameCreated = (data: {
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

    const onBotGameError = (data: { message: string }) => {
      setConnectionState(prev => ({ ...prev, error: data.message }));
      handlersRef.current.onBotGameError?.(data);
    };

    const onGameJoined = (data: {
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

    const onGameStateUpdate = (gameState: ClientGameState) => {
      setGameState(gameState);
      handlersRef.current.onGameStateUpdate?.(gameState);
    };

    const onMoveResult = (data: {
      success: boolean;
      error?: string;
      revealedPosition?: Position;
    }) => {
      handlersRef.current.onMoveResult?.(data);
    };

    const onGameOver = (data: {
      result: GameResult;
      finalBoard: ClientGameState['visibleBoard'];
    }) => {
      handlersRef.current.onGameOver?.(data);
    };

    const onPlayerJoined = (data: { player: Player; playersCount: number }) => {
      handlersRef.current.onPlayerJoined?.(data);
    };

    const onPlayerLeft = (data: { player: Player; playersCount: number }) => {
      handlersRef.current.onPlayerLeft?.(data);
    };

    const onError = (data: { message: string; code?: string }) => {
      setConnectionState(prev => ({ ...prev, error: data.message }));
      handlersRef.current.onError?.(data);
    };

    const onGameFull = () => {
      handlersRef.current.onGameFull?.();
    };

    const onGameNotFound = () => {
      handlersRef.current.onGameNotFound?.();
    };

    const onReconnected = (gameState: ClientGameState) => {
      setGameState(gameState);
      setConnectionState(prev => ({
        ...prev,
        gameId: gameState.id,
        yourPlayer: gameState.yourPlayer,
      }));
      handlersRef.current.onReconnected?.(gameState);
    };

    const onPong = () => {
      // Simple ping/pong for connection testing
      console.log('Pong received');
    };

    // Matchmaking events
    const onQueueJoined = (data: {
      position: number;
      estimatedWait: number;
    }) => {
      handlersRef.current.onQueueJoined?.(data);
    };

    const onQueueLeft = () => {
      handlersRef.current.onQueueLeft?.();
    };

    const onQueueStatus = (data: {
      position: number;
      queueSize: number;
      estimatedWait: number;
    }) => {
      handlersRef.current.onQueueStatus?.(data);
    };

    const onMatchFound = (data: { gameId: string; yourPlayer: Player }) => {
      handlersRef.current.onMatchFound?.(data);
    };

    const onQueueError = (data: { message: string }) => {
      handlersRef.current.onQueueError?.(data);
    };

    // Register all event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('game-created', onGameCreated);
    socket.on('bot-game-created', onBotGameCreated);
    socket.on('bot-game-error', onBotGameError);
    socket.on('game-joined', onGameJoined);
    socket.on('game-state-update', onGameStateUpdate);
    socket.on('move-result', onMoveResult);
    socket.on('game-over', onGameOver);
    socket.on('player-joined', onPlayerJoined);
    socket.on('player-left', onPlayerLeft);
    socket.on('error', onError);
    socket.on('game-full', onGameFull);
    socket.on('game-not-found', onGameNotFound);
    socket.on('reconnected', onReconnected);
    socket.on('pong', onPong);
    socket.on('queue-joined', onQueueJoined);
    socket.on('queue-left', onQueueLeft);
    socket.on('queue-status', onQueueStatus);
    socket.on('match-found', onMatchFound);
    socket.on('queue-error', onQueueError);

    // Cleanup function
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('game-created', onGameCreated);
      socket.off('bot-game-created', onBotGameCreated);
      socket.off('bot-game-error', onBotGameError);
      socket.off('game-joined', onGameJoined);
      socket.off('game-state-update', onGameStateUpdate);
      socket.off('move-result', onMoveResult);
      socket.off('game-over', onGameOver);
      socket.off('player-joined', onPlayerJoined);
      socket.off('player-left', onPlayerLeft);
      socket.off('error', onError);
      socket.off('game-full', onGameFull);
      socket.off('game-not-found', onGameNotFound);
      socket.off('reconnected', onReconnected);
      socket.off('pong', onPong);
      socket.off('queue-joined', onQueueJoined);
      socket.off('queue-left', onQueueLeft);
      socket.off('queue-status', onQueueStatus);
      socket.off('match-found', onMatchFound);
      socket.off('queue-error', onQueueError);
    };
  }, []);

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
