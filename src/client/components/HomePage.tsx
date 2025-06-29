import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  colors,
  createGlow,
  getHoverColor,
} from '../../shared/constants/colors';
import { useSocket } from '../hooks/useSocket';
import { PageLayout } from './PageLayout';
import { QuickMatch } from './QuickMatch';

export function HomePage() {
  const [joinGameId, setJoinGameId] = useState('');
  const navigate = useNavigate();

  const { isConnected, isConnecting, error, connect, createGame } = useSocket({
    onGameCreated: data => {
      console.log('Game created:', data);
      // Navigate to the game page
      navigate(`/game/${data.gameId}`);
    },
    onGameJoined: data => {
      console.log('Game joined:', data);
      if (data.success) {
        // Navigation will happen automatically since we're already on the game URL
        // We can get the gameId from the current URL if needed
        const currentPath = window.location.pathname;
        const gameIdFromUrl = currentPath.split('/').pop();
        if (gameIdFromUrl && gameIdFromUrl !== 'game') {
          navigate(`/game/${gameIdFromUrl}`);
        }
      } else {
        alert(`Failed to join game: ${data.error}`);
      }
    },
    onError: data => {
      console.error('Socket error:', data);
      alert(`Error: ${data.message}`);
    },
    onGameFull: () => {
      alert('Game is full! Please try a different game.');
    },
    onGameNotFound: () => {
      alert('Game not found! Please check the game ID.');
    },
  });

  const handleCreateGame = () => {
    if (isConnected) {
      createGame();
    } else {
      alert('Connecting to server...');
      connect();
    }
  };

  const handleJoinGame = () => {
    if (!joinGameId.trim()) {
      alert('Please enter a game ID');
      return;
    }

    if (isConnected) {
      // Navigate to the game page first, then join
      navigate(`/game/${joinGameId.toUpperCase()}`);
    } else {
      alert('Connecting to server...');
      connect();
    }
  };

  const handleGameIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-uppercase and limit to 4 characters
    const value = event.target.value.toUpperCase().slice(0, 4);
    setJoinGameId(value);
  };

  // Auto-connect when component loads
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      connect();
    }
  }, [isConnected, isConnecting, connect]);

  // Button styles for primary actions
  const primaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '18px 24px',
    fontSize: '18px',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: colors.successGreen,
    color: '#ffffff',
    border: `2px solid ${colors.successGreen}`,
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: `0 0 15px ${createGlow(colors.successGreen, 0.2)}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    padding: '14px 20px',
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: 'transparent',
    color: colors.botBlue,
    border: `2px solid ${colors.botBlue}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  };

  return (
    <PageLayout variant="home" maxWidth="500px">
      {/* Hero Section */}
      <div
        style={{
          backgroundColor: colors.background,
          border: `2px solid ${colors.gridLines}`,
          padding: '50px 40px',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at center, rgba(255, 255, 255, 0.02) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1
            style={{
              color: '#ffffff',
              marginBottom: '15px',
              fontSize: '36px',
              fontWeight: '700',
              fontFamily: 'Inter, sans-serif',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
            }}
          >
            Kriegspiel Tic Tac Toe
          </h1>

          <p
            style={{
              color: colors.textDim,
              marginBottom: '40px',
              fontSize: '18px',
              lineHeight: '1.6',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Hidden information tic-tac-toe where you can&apos;t see your
            opponent&apos;s moves until you try to place on their squares!
          </p>

          {/* Connection Status */}
          <div
            style={{
              padding: '15px 20px',
              margin: '0 0 40px 0',
              borderRadius: '10px',
              backgroundColor: isConnected
                ? createGlow(colors.successGreen, 0.1)
                : createGlow(colors.rejectionRed, 0.1),
              border: `2px solid ${isConnected ? colors.successGreen : colors.rejectionRed}`,
              boxShadow: isConnected
                ? `0 0 15px ${createGlow(colors.successGreen, 0.2)}`
                : `0 0 15px ${createGlow(colors.rejectionRed, 0.2)}`,
            }}
          >
            <p
              style={{
                margin: 0,
                color: isConnected ? colors.successGreen : colors.rejectionRed,
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {isConnecting
                ? '🔄 Connecting to server...'
                : isConnected
                  ? '🟢 Connected and ready to play'
                  : '🔴 Connection failed'}
            </p>
            {error && (
              <p
                style={{
                  margin: '8px 0 0 0',
                  color: colors.rejectionRed,
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Three Primary Actions with Equal Visual Weight */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* 1. Create Game */}
            <div>
              <h3
                style={{
                  color: '#ffffff',
                  marginBottom: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                🎮 Start New Game
              </h3>
              <button
                onClick={handleCreateGame}
                disabled={isConnecting}
                style={{
                  ...primaryButtonStyle,
                  opacity: isConnecting ? 0.6 : 1,
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                }}
                onMouseOver={e => {
                  if (!isConnecting) {
                    e.currentTarget.style.backgroundColor = getHoverColor(
                      colors.successGreen
                    );
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 0 25px ${createGlow(colors.successGreen, 0.3)}`;
                  }
                }}
                onMouseOut={e => {
                  if (!isConnecting) {
                    e.currentTarget.style.backgroundColor = colors.successGreen;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 0 15px ${createGlow(colors.successGreen, 0.2)}`;
                  }
                }}
              >
                <span>✨</span>
                {isConnecting ? 'Connecting...' : 'Create Game & Share Link'}
              </button>
            </div>

            {/* 2. Quick Match */}
            <div>
              <h3
                style={{
                  color: '#ffffff',
                  marginBottom: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                ⚡ Quick Match
              </h3>
              <QuickMatch />
            </div>

            {/* 3. Join Game */}
            <div>
              <h3
                style={{
                  color: '#ffffff',
                  marginBottom: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                🔗 Join Existing Game
              </h3>
              <div
                style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}
              >
                <input
                  type="text"
                  value={joinGameId}
                  onChange={handleGameIdChange}
                  placeholder="Enter Game ID"
                  style={{
                    flex: 1,
                    padding: '16px',
                    fontSize: '18px',
                    fontWeight: '600',
                    fontFamily: 'Space Grotesk, monospace',
                    backgroundColor: colors.background,
                    color: '#ffffff',
                    border: `2px solid ${colors.gridLines}`,
                    borderRadius: '8px',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    outline: 'none',
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = colors.botBlue;
                    e.currentTarget.style.boxShadow = `0 0 15px ${createGlow(colors.botBlue, 0.2)}`;
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = colors.gridLines;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  maxLength={4}
                />
                <button
                  onClick={handleJoinGame}
                  disabled={isConnecting || !joinGameId.trim()}
                  style={{
                    ...secondaryButtonStyle,
                    opacity: isConnecting || !joinGameId.trim() ? 0.5 : 1,
                    cursor:
                      isConnecting || !joinGameId.trim()
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                  onMouseOver={e => {
                    if (!isConnecting && joinGameId.trim()) {
                      e.currentTarget.style.backgroundColor = createGlow(
                        colors.botBlue,
                        0.1
                      );
                      e.currentTarget.style.boxShadow = `0 0 15px ${createGlow(colors.botBlue, 0.2)}`;
                    }
                  }}
                  onMouseOut={e => {
                    if (!isConnecting && joinGameId.trim()) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  Join Game
                </button>
              </div>
              <p
                style={{
                  color: colors.textDim,
                  fontSize: '14px',
                  margin: 0,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Game IDs are 4-character codes (e.g., H3K8)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '30px',
          textAlign: 'center',
          color: colors.textDim,
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <p>
          🎯 Perfect your strategy in this hidden information variant of the
          classic game
        </p>
      </div>
    </PageLayout>
  );
}
