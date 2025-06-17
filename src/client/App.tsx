import { useSocket } from './hooks/useSocket';

function App() {
  const {
    isConnected,
    isConnecting,
    error,
    gameId,
    yourPlayer,
    gameState,
    connect,
    disconnect,
    ping,
    createGame,
    joinGame,
  } = useSocket({
    onGameCreated: data => {
      console.log('Game created:', data);
      alert(
        `Game created! Game ID: ${data.gameId}\nYou are player: ${data.yourPlayer}`
      );
    },
    onGameJoined: data => {
      console.log('Game joined:', data);
      if (data.success) {
        alert(`Successfully joined game!\nYou are player: ${data.yourPlayer}`);
      } else {
        alert(`Failed to join game: ${data.error}`);
      }
    },
    onError: data => {
      console.error('Socket error:', data);
      alert(`Error: ${data.message}`);
    },
    onGameFull: () => {
      alert('Game is full!');
    },
    onGameNotFound: () => {
      alert('Game not found!');
    },
  });

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handlePing = () => {
    if (isConnected) {
      ping();
      alert('Ping sent! Check console for pong response.');
    } else {
      alert('Not connected to server');
    }
  };

  const handleCreateGame = () => {
    if (isConnected) {
      createGame();
    } else {
      alert('Please connect to server first');
    }
  };

  const handleJoinGame = () => {
    const gameIdInput = prompt('Enter Game ID (4 characters):');
    if (gameIdInput && isConnected) {
      joinGame(gameIdInput.toUpperCase());
    } else if (!isConnected) {
      alert('Please connect to server first');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Kriegspiel Tic Tac Toe</h1>

      {/* Connection Status */}
      <div
        style={{
          padding: '10px',
          margin: '10px 0',
          border: '1px solid #ccc',
          borderRadius: '5px',
          backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
        }}
      >
        <h3>Connection Status</h3>
        <p>
          <strong>Status:</strong>{' '}
          {isConnecting
            ? 'Connecting...'
            : isConnected
              ? '🟢 Connected'
              : '🔴 Disconnected'}
        </p>
        {error && (
          <p style={{ color: 'red' }}>
            <strong>Error:</strong> {error}
          </p>
        )}
        {gameId && (
          <p>
            <strong>Game ID:</strong> {gameId}
          </p>
        )}
        {yourPlayer && (
          <p>
            <strong>You are:</strong> Player {yourPlayer}
          </p>
        )}
      </div>

      {/* Connection Controls */}
      <div style={{ margin: '10px 0' }}>
        <h3>Connection Controls</h3>
        <button
          onClick={handleConnect}
          disabled={isConnected || isConnecting}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            marginRight: '10px',
            backgroundColor: isConnected ? '#28a745' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isConnected || isConnecting ? 'not-allowed' : 'pointer',
          }}
        >
          {isConnecting
            ? 'Connecting...'
            : isConnected
              ? 'Connected'
              : 'Connect to Server'}
        </button>

        <button
          onClick={handleDisconnect}
          disabled={!isConnected}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            marginRight: '10px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: !isConnected ? 'not-allowed' : 'pointer',
          }}
        >
          Disconnect
        </button>

        <button
          onClick={handlePing}
          disabled={!isConnected}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: !isConnected ? 'not-allowed' : 'pointer',
          }}
        >
          Test Ping
        </button>
      </div>

      {/* Game Controls */}
      <div style={{ margin: '10px 0' }}>
        <h3>Game Controls</h3>
        <button
          onClick={handleCreateGame}
          disabled={!isConnected}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: !isConnected ? 'not-allowed' : 'pointer',
          }}
        >
          Create New Game
        </button>

        <button
          onClick={handleJoinGame}
          disabled={!isConnected}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: !isConnected ? 'not-allowed' : 'pointer',
          }}
        >
          Join Existing Game
        </button>
      </div>

      {/* Game State Display */}
      {gameState && (
        <div
          style={{
            padding: '10px',
            margin: '10px 0',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#f8f9fa',
          }}
        >
          <h3>Current Game State</h3>
          <p>
            <strong>Game Status:</strong> {gameState.status}
          </p>
          <p>
            <strong>Current Turn:</strong> Player {gameState.currentTurn}
          </p>
          <p>
            <strong>Can Move:</strong> {gameState.canMove ? 'Yes' : 'No'}
          </p>

          {/* Simple board display */}
          <div style={{ margin: '10px 0' }}>
            <strong>Board:</strong>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 40px)',
                gap: '2px',
                marginTop: '5px',
              }}
            >
              {gameState.visibleBoard.flat().map((cell, index) => (
                <div
                  key={index}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '1px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                >
                  {cell || ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>🎮 Socket.io integration complete!</p>
        <p>Connect to the server and try creating or joining a game.</p>
      </div>
    </div>
  );
}

export default App;
