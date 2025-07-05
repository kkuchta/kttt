import { Bot } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  colors,
  createGlow,
  getHoverColor,
} from '../../shared/constants/colors';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { useSocket } from '../hooks/useSocket';

export function QuickMatch() {
  const navigate = useNavigate();

  const {
    isInQueue,
    queueStatus,
    error,
    isConnecting,
    joinQueue,
    leaveQueue,
    clearError,
    formatWaitTime,
  } = useMatchmaking();

  const { isConnected, connect, createBotGame } = useSocket({
    onBotGameCreated: data => {
      console.log('Bot game created:', data);
      // Navigate to the bot game
      navigate(`/game/${data.gameId}`);
    },
    onBotGameError: data => {
      console.error('Bot game error:', data);
      alert(`Failed to create bot game: ${data.message}`);
    },
  });

  const handleJoinQueue = () => {
    clearError();
    joinQueue();
  };

  const handleLeaveQueue = () => {
    leaveQueue();
  };

  const handlePlayBot = async () => {
    if (!isConnected) {
      await connect();
    }

    if (isConnected) {
      // Remove from queue and create bot game
      createBotGame('random', 'X');
    }
  };

  // Primary button style for Quick Match
  const primaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '18px 24px',
    fontSize: '18px',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: colors.queueOrange,
    color: '#ffffff',
    border: `2px solid ${colors.queueOrange}`,
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: `0 0 15px ${createGlow(colors.queueOrange, 0.2)}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  };

  // Secondary button styles
  const botButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '15px 20px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: colors.botBlue,
    color: '#ffffff',
    border: `2px solid ${colors.botBlue}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: `0 0 12px ${createGlow(colors.botBlue, 0.2)}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const cancelButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: 'transparent',
    color: colors.textDim,
    border: `2px solid ${colors.textDim}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  };

  // If not in queue, show the Quick Match button
  if (!isInQueue) {
    return (
      <div>
        <button
          onClick={handleJoinQueue}
          disabled={isConnecting}
          style={{
            ...primaryButtonStyle,
            opacity: isConnecting ? 0.6 : 1,
            cursor: isConnecting ? 'not-allowed' : 'pointer',
          }}
          onMouseOver={e => {
            if (!isConnecting) {
              e.currentTarget.style.backgroundColor = getHoverColor(
                colors.queueOrange
              );
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 0 25px ${createGlow(colors.queueOrange, 0.3)}`;
            }
          }}
          onMouseOut={e => {
            if (!isConnecting) {
              e.currentTarget.style.backgroundColor = colors.queueOrange;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 0 15px ${createGlow(colors.queueOrange, 0.2)}`;
            }
          }}
        >
          {isConnecting ? 'Connecting...' : 'Find Opponent Now'}
        </button>

        <p
          style={{
            color: colors.textDim,
            fontSize: '14px',
            margin: '12px 0 0 0',
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Get matched with a random opponent instantly!
        </p>

        {error && (
          <div
            style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: createGlow(colors.rejectionRed, 0.1),
              border: `2px solid ${colors.rejectionRed}`,
              borderRadius: '8px',
              color: colors.rejectionRed,
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: `0 0 15px ${createGlow(colors.rejectionRed, 0.1)}`,
            }}
          >
            <strong>Warning:</strong> {error}
          </div>
        )}
      </div>
    );
  }

  // If in queue, show the queue status with bot option
  return (
    <div>
      {/* Queue Status Display */}
      <div
        style={{
          padding: '20px',
          backgroundColor: createGlow(colors.queueOrange, 0.1),
          border: `2px solid ${colors.queueOrange}`,
          borderRadius: '12px',
          marginBottom: '20px',
          boxShadow: `0 0 20px ${createGlow(colors.queueOrange, 0.2)}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '15px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: colors.queueOrange,
              marginRight: '12px',
              animation: 'queuePulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              color: colors.queueOrange,
              fontWeight: '600',
              fontSize: '18px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Looking for opponent
          </span>
          <span
            style={{
              color: colors.queueOrange,
              fontSize: '18px',
              marginLeft: '8px',
              animation: 'dots 1.5s ease-in-out infinite',
            }}
          >
            ...
          </span>
        </div>

        {queueStatus && (
          <div
            style={{
              color: '#ffffff',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                marginBottom: '8px',
                padding: '8px 12px',
                backgroundColor: colors.background,
                borderRadius: '6px',
                border: `1px solid ${colors.gridLines}`,
              }}
            >
              <span style={{ color: colors.textDim }}>Position:</span>{' '}
              <strong style={{ color: colors.queueOrange }}>
                {queueStatus.position} of {queueStatus.queueSize}
              </strong>
            </div>
            <div
              style={{
                marginBottom: '8px',
                padding: '8px 12px',
                backgroundColor: colors.background,
                borderRadius: '6px',
                border: `1px solid ${colors.gridLines}`,
              }}
            >
              <span style={{ color: colors.textDim }}>Waiting:</span>{' '}
              <strong style={{ color: colors.queueOrange }}>
                {formatWaitTime(queueStatus.elapsedTime)}
              </strong>
            </div>
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: colors.background,
                borderRadius: '6px',
                border: `1px solid ${colors.gridLines}`,
              }}
            >
              <span style={{ color: colors.textDim }}>Estimated:</span>{' '}
              <strong style={{ color: colors.queueOrange }}>
                {formatWaitTime(queueStatus.estimatedWait)}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Primary Bot Option - Prominent */}
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={handlePlayBot}
          style={botButtonStyle}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = getHoverColor(
              colors.botBlue
            );
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = `0 0 20px ${createGlow(colors.botBlue, 0.3)}`;
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = colors.botBlue;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 0 12px ${createGlow(colors.botBlue, 0.2)}`;
          }}
        >
          <Bot size={16} color="#ffffff" />
          <span>Play vs Bot Instead</span>
        </button>
      </div>

      {/* Secondary Cancel Option */}
      <button
        onClick={handleLeaveQueue}
        style={cancelButtonStyle}
        onMouseOver={e => {
          e.currentTarget.style.backgroundColor = createGlow(
            colors.textDim,
            0.1
          );
          e.currentTarget.style.borderColor = '#ffffff';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseOut={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = colors.textDim;
          e.currentTarget.style.color = colors.textDim;
        }}
      >
        Cancel Search
      </button>

      {error && (
        <div
          style={{
            marginTop: '15px',
            padding: '15px',
            backgroundColor: createGlow(colors.rejectionRed, 0.1),
            border: `2px solid ${colors.rejectionRed}`,
            borderRadius: '8px',
            color: colors.rejectionRed,
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: `0 0 15px ${createGlow(colors.rejectionRed, 0.1)}`,
          }}
        >
          <strong>Warning:</strong> {error}
        </div>
      )}

      <style>
        {`
          @keyframes queuePulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.3);
              opacity: 0.6;
            }
          }
          
          @keyframes dots {
            0%, 20% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
          
          /* Respect reduced motion preference */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </div>
  );
}
