import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
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

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            color: '#333',
            marginBottom: '10px',
            fontSize: '28px',
          }}
        >
          Kriegspiel Tic Tac Toe
        </h1>

        <p
          style={{
            color: '#666',
            marginBottom: '30px',
            fontSize: '16px',
          }}
        >
          Hidden information tic-tac-toe where you can&apos;t see your
          opponent&apos;s moves!
        </p>

        {/* Connection Status */}
        <div
          style={{
            padding: '10px',
            margin: '20px 0',
            borderRadius: '5px',
            backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
            border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          <p
            style={{
              margin: 0,
              color: isConnected ? '#155724' : '#721c24',
              fontSize: '14px',
            }}
          >
            {isConnecting
              ? '🔄 Connecting...'
              : isConnected
                ? '🟢 Connected to server'
                : '🔴 Disconnected'}
          </p>
          {error && (
            <p
              style={{
                margin: '5px 0 0 0',
                color: '#721c24',
                fontSize: '12px',
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* Create Game Section */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>
            Start New Game
          </h3>
          <button
            onClick={handleCreateGame}
            disabled={isConnecting}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={e => {
              if (!isConnecting) {
                e.currentTarget.style.backgroundColor = '#218838';
              }
            }}
            onMouseOut={e => {
              if (!isConnecting) {
                e.currentTarget.style.backgroundColor = '#28a745';
              }
            }}
          >
            {isConnecting ? 'Connecting...' : 'Create Game'}
          </button>
        </div>

        {/* Quick Match Section */}
        <QuickMatch />

        {/* Join Game Section */}
        <div>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>
            Join Existing Game
          </h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={joinGameId}
              onChange={handleGameIdChange}
              placeholder="Enter Game ID"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
              maxLength={4}
            />
            <button
              onClick={handleJoinGame}
              disabled={isConnecting || !joinGameId.trim()}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor:
                  isConnecting || !joinGameId.trim()
                    ? 'not-allowed'
                    : 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={e => {
                if (!isConnecting && joinGameId.trim()) {
                  e.currentTarget.style.backgroundColor = '#138496';
                }
              }}
              onMouseOut={e => {
                if (!isConnecting && joinGameId.trim()) {
                  e.currentTarget.style.backgroundColor = '#17a2b8';
                }
              }}
            >
              Join
            </button>
          </div>
          <p
            style={{
              color: '#666',
              fontSize: '12px',
              margin: 0,
            }}
          >
            Game IDs are 4-character codes (e.g., H3K8)
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: '20px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
        }}
      >
        <p>Share your game URL with a friend to play together!</p>
      </div>
    </div>
  );
}
