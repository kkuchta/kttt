import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  colors,
  createGlow,
  getHoverColor,
} from '../../shared/constants/colors';
import { useSocket } from '../hooks/useSocket';
import { ConnectionIndicator } from './ConnectionIndicator';
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

    // Clean the game ID (remove spaces, convert to uppercase)
    const cleanGameId = joinGameId.trim().toUpperCase();

    if (cleanGameId.length !== 4) {
      alert('Game ID must be 4 characters');
      return;
    }

    if (isConnected) {
      // Navigate to the game page - the GamePage component will handle joining
      navigate(`/game/${cleanGameId}`);
    } else {
      alert('Connecting to server...');
      connect();
    }
  };

  // Auto-connect when component mounts
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      connect();
    }
  }, [isConnected, isConnecting, connect]);

  return (
    <PageLayout>
      {/* Connection Indicator - subtle dot in top-right corner */}
      <ConnectionIndicator
        isConnected={isConnected}
        isConnecting={isConnecting}
        error={error}
      />

      {/* Hero Section */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '40px 20px',
          position: 'relative',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(600px circle at center, rgba(0, 255, 231, 0.03), transparent 70%)`,
            borderRadius: '20px',
            zIndex: 0,
          }}
        />

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

          {/* Three Primary Actions with Equal Visual Weight */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxWidth: '400px',
              margin: '0 auto',
            }}
          >
            {/* Create Game & Share Link */}
            <div>
              <h3
                style={{
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  margin: '0 0 15px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                ✨ Start New Game
              </h3>
              <button
                onClick={handleCreateGame}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '16px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  backgroundColor: colors.successGreen,
                  color: colors.background,
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: `0 0 20px ${createGlow(colors.successGreen, 0.3)}`,
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = getHoverColor(
                    colors.successGreen
                  );
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 0 25px ${createGlow(colors.successGreen, 0.4)}`;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = colors.successGreen;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 0 20px ${createGlow(colors.successGreen, 0.3)}`;
                }}
              >
                Create Game & Share Link
              </button>
            </div>

            {/* Quick Match */}
            <div>
              <h3
                style={{
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  margin: '0 0 15px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                ⚡ Quick Match
              </h3>
              <QuickMatch />
            </div>

            {/* Join Existing Game */}
            <div>
              <h3
                style={{
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  margin: '0 0 15px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                🔗 Join Existing Game
              </h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="ENTER GAME ID"
                  value={joinGameId}
                  onChange={e => setJoinGameId(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    fontSize: '16px',
                    fontWeight: '500',
                    fontFamily: 'Space Grotesk, monospace',
                    backgroundColor: colors.background,
                    color: '#ffffff',
                    border: `2px solid ${colors.gridLines}`,
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.2s ease-in-out',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = colors.xAccent;
                    e.currentTarget.style.boxShadow = `0 0 15px ${createGlow(colors.xAccent, 0.2)}`;
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = colors.gridLines;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  maxLength={4}
                />
                <button
                  onClick={handleJoinGame}
                  style={{
                    padding: '16px 20px',
                    fontSize: '16px',
                    fontWeight: '600',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: 'transparent',
                    color: colors.xAccent,
                    border: `2px solid ${colors.xAccent}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    minWidth: '100px',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.backgroundColor = colors.xAccent;
                    e.currentTarget.style.color = colors.background;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 0 20px ${createGlow(colors.xAccent, 0.3)}`;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.xAccent;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Join Game
                </button>
              </div>
              <p
                style={{
                  color: colors.textDim,
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  margin: '8px 0 0 0',
                  textAlign: 'center',
                }}
              >
                Game IDs are 4-character codes (e.g., H3K8)
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
