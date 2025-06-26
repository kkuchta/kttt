import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { GameBoard } from './GameBoard';
import { GameRules } from './GameRules';
import { GameStatus } from './GameStatus';

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const {
    isConnected,
    isConnecting,
    error,
    yourPlayer,
    gameState,
    connect,
    joinGame,
    makeMove,
  } = useSocket({
    onGameCreated: data => {
      console.log('Game created:', data);
    },
    onGameJoined: data => {
      console.log('Game joined:', data);
      if (!data.success) {
        alert(`Failed to join game: ${data.error}`);
        // Redirect back to home page on join failure
        navigate('/');
      } else if (data.yourPlayer && gameId) {
        // Store player identity in localStorage for reconnection
        localStorage.setItem(`game-${gameId}-player`, data.yourPlayer);
      }
    },
    onGameOver: data => {
      console.log('Game over:', data);

      // Use gameState.yourPlayer as fallback since it should be more reliable
      const currentPlayer = yourPlayer || gameState?.yourPlayer;

      // Show win announcement
      if (data.result.winner) {
        const isYourWin = data.result.winner === currentPlayer;
        alert(isYourWin ? '🎉 You win!' : '😔 You lose!');
      } else {
        alert('🤝 Game ended in a draw!');
      }

      // Clean up localStorage for this game
      if (gameId) {
        localStorage.removeItem(`game-${gameId}-player`);
      }
    },
    onError: data => {
      console.error('Socket error:', data);
      alert(`Error: ${data.message}`);
    },
    onGameFull: () => {
      alert('Game is full! This game already has 2 players.');
      navigate('/');
    },
    onGameNotFound: () => {
      alert('Game not found! The game ID might be invalid or expired.');
      navigate('/');
    },
  });

  // Auto-connect and join game when component loads
  useEffect(() => {
    if (!gameId) {
      navigate('/');
      return;
    }

    // Always try to connect if not connected
    if (!isConnected && !isConnecting) {
      connect();
    }
  }, [gameId, isConnected, isConnecting, connect, navigate]);

  // Join game when connected
  useEffect(() => {
    if (!gameId || !isConnected || yourPlayer) {
      return; // Don't join if no gameId, not connected, or already joined
    }

    // Check if we have a stored player identity for reconnection
    const storedPlayer = localStorage.getItem(`game-${gameId}-player`) as
      | 'X'
      | 'O'
      | null;

    if (storedPlayer) {
      console.log(
        `Attempting to rejoin game ${gameId} as player ${storedPlayer}`
      );
      joinGame(gameId, storedPlayer);
    } else {
      console.log(`Joining new game ${gameId}`);
      joinGame(gameId);
    }
  }, [gameId, isConnected, yourPlayer, joinGame]);

  // Cleanup localStorage when component unmounts or game changes
  useEffect(() => {
    return () => {
      // Clean up localStorage for this game when navigating away
      if (gameId) {
        localStorage.removeItem(`game-${gameId}-player`);
      }
    };
  }, [gameId]);

  const handleCellClick = (row: number, col: number) => {
    if (!gameState?.canMove || !gameId) return;

    makeMove(row, col);
  };

  if (!gameId) {
    return null; // Will redirect to home
  }

  const gameUrl = `${window.location.origin}/game/${gameId}`;

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          backgroundColor: 'white',
          padding: '15px 20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>
            Kriegspiel Tic Tac Toe
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            Game ID: <strong>{gameId}</strong>
          </p>
        </div>
        <Link
          to="/"
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            fontSize: '14px',
          }}
        >
          ← Home
        </Link>
      </div>

      {/* Connection Status */}
      <div
        style={{
          padding: '15px',
          margin: '20px 0',
          borderRadius: '10px',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
          Connection Status
        </h3>
        <div
          style={{
            padding: '10px',
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

        {yourPlayer && (
          <p style={{ margin: '10px 0 0 0', color: '#333' }}>
            <strong>You are playing as:</strong> {yourPlayer}
          </p>
        )}
      </div>

      {/* Share Game URL - only show for human vs human games */}
      {(!gameState || !gameState.botInfo) && (
        <div
          style={{
            padding: '15px',
            margin: '20px 0',
            borderRadius: '10px',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
            Invite a Friend
          </h3>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
            Share this URL with someone to play together:
          </p>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              backgroundColor: '#f8f9fa',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #dee2e6',
            }}
          >
            <input
              type="text"
              value={gameUrl}
              readOnly
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '14px',
                backgroundColor: 'white',
              }}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(gameUrl);
                alert('Game URL copied to clipboard!');
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Game State Display */}
      {gameState ? (
        <div
          style={{
            padding: '20px',
            borderRadius: '10px',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Game Board</h3>

          <GameStatus
            status={gameState.status}
            currentTurn={gameState.currentTurn}
            canMove={gameState.canMove}
            result={gameState.result}
            yourPlayer={gameState.yourPlayer}
            botInfo={gameState.botInfo}
          />

          <GameBoard
            board={gameState.visibleBoard}
            canMove={gameState.canMove}
            onCellClick={handleCellClick}
          />

          <GameRules />
        </div>
      ) : (
        <div
          style={{
            padding: '40px',
            borderRadius: '10px',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#666', fontSize: '18px' }}>
            {isConnecting
              ? '🔄 Connecting to game...'
              : isConnected
                ? '🎮 Joining game...'
                : '❌ Unable to connect to game'}
          </p>
        </div>
      )}
    </div>
  );
}
