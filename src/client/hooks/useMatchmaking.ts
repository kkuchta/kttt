import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './useSocket';

export interface QueueStatus {
  position: number;
  queueSize: number;
  estimatedWait: number;
  elapsedTime: number;
}

export interface MatchmakingState {
  isInQueue: boolean;
  queueStatus: QueueStatus | null;
  error: string | null;
  isConnecting: boolean;
}

export function useMatchmaking() {
  const [state, setState] = useState<MatchmakingState>({
    isInQueue: false,
    queueStatus: null,
    error: null,
    isConnecting: false,
  });

  const [queueStartTime, setQueueStartTime] = useState<number | null>(null);
  const navigate = useNavigate();

  const { isConnected, connect, socket } = useSocket({
    onQueueJoined: data => {
      console.log('Queue joined:', data);
      setState(prev => ({
        ...prev,
        isInQueue: true,
        queueStatus: {
          position: data.position,
          queueSize: data.position, // Initial assumption
          estimatedWait: data.estimatedWait,
          elapsedTime: 0,
        },
        error: null,
        isConnecting: false,
      }));
      setQueueStartTime(Date.now());
    },
    onQueueLeft: () => {
      console.log('Left queue');
      setState(prev => ({
        ...prev,
        isInQueue: false,
        queueStatus: null,
        error: null,
        isConnecting: false,
      }));
      setQueueStartTime(null);
    },
    onQueueStatus: data => {
      console.log('Queue status update:', data);
      setState(prev => ({
        ...prev,
        queueStatus: prev.queueStatus
          ? {
              ...data,
              elapsedTime: queueStartTime ? Date.now() - queueStartTime : 0,
            }
          : null,
      }));
    },
    onMatchFound: data => {
      console.log('Match found:', data);
      setState(prev => ({
        ...prev,
        isInQueue: false,
        queueStatus: null,
        error: null,
        isConnecting: false,
      }));
      setQueueStartTime(null);

      // Navigate to the game
      navigate(`/game/${data.gameId}`);
    },
    onQueueError: data => {
      console.error('Queue error:', data);
      setState(prev => ({
        ...prev,
        error: data.message,
        isInQueue: false,
        queueStatus: null,
        isConnecting: false,
      }));
      setQueueStartTime(null);
    },
    onError: data => {
      console.error('Socket error:', data);
      setState(prev => ({
        ...prev,
        error: data.message,
        isConnecting: false,
      }));
    },
  });

  // Update elapsed time every second
  useEffect(() => {
    if (!state.isInQueue || !queueStartTime) return;

    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        queueStatus: prev.queueStatus
          ? {
              ...prev.queueStatus,
              elapsedTime: Date.now() - queueStartTime,
            }
          : null,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isInQueue, queueStartTime]);

  const joinQueue = useCallback(async () => {
    if (!isConnected) {
      setState(prev => ({ ...prev, isConnecting: true }));
      await connect();
    }

    if (socket && isConnected) {
      setState(prev => ({ ...prev, error: null, isConnecting: true }));
      socket.emit('join-queue');
    }
  }, [isConnected, connect, socket]);

  const leaveQueue = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('leave-queue');
    }
  }, [socket, isConnected]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    isConnected,
    joinQueue,
    leaveQueue,
    clearError,
    formatWaitTime: (milliseconds: number) => {
      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      if (minutes > 0) {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      }
      return `${remainingSeconds}s`;
    },
  };
}
