import {
  GameResult,
  GameStatus as GameStatusType,
  Player,
} from '@shared/types/game';

interface GameStatusProps {
  status: GameStatusType;
  currentTurn: Player;
  canMove: boolean;
  result?: GameResult;
  yourPlayer?: Player | null;
}

export function GameStatus({
  status,
  currentTurn,
  canMove,
  result,
  yourPlayer,
}: GameStatusProps) {
  // Handle completed games
  if (status === 'completed' && result) {
    if (result.winner) {
      const isYourWin = result.winner === yourPlayer;
      return (
        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: isYourWin ? '#d4edda' : '#f8d7da',
            border: `2px solid ${isYourWin ? '#28a745' : '#dc3545'}`,
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              margin: '0 0 10px 0',
              color: isYourWin ? '#155724' : '#721c24',
              fontSize: '24px',
            }}
          >
            {isYourWin ? '🎉 You Won!' : '😔 You Lost!'}
          </h3>
          <p
            style={{
              margin: '5px 0',
              color: isYourWin ? '#155724' : '#721c24',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            {isYourWin ? 'You won the game!' : 'You lost the game!'}
          </p>
          {result.winningLine && (
            <p
              style={{
                margin: '5px 0',
                color: isYourWin ? '#155724' : '#721c24',
                fontSize: '14px',
              }}
            >
              Winning line:{' '}
              {result.winningLine
                .map(pos => `(${pos.row + 1},${pos.col + 1})`)
                .join(' → ')}
            </p>
          )}
        </div>
      );
    } else {
      // Draw
      return (
        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: '#fff3cd',
            border: '2px solid #ffc107',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              margin: '0 0 10px 0',
              color: '#856404',
              fontSize: '24px',
            }}
          >
            🤝 It&apos;s a Draw!
          </h3>
          <p
            style={{
              margin: '5px 0',
              color: '#856404',
              fontSize: '16px',
            }}
          >
            The board is full with no winner.
          </p>
        </div>
      );
    }
  }

  // Handle waiting for players
  if (status === 'waiting-for-players') {
    return (
      <div
        style={{
          marginBottom: '20px',
          padding: '15px',
          borderRadius: '8px',
          backgroundColor: '#cce5ff',
          border: '2px solid #007bff',
          textAlign: 'center',
        }}
      >
        <h3
          style={{ margin: '0 0 10px 0', color: '#004085', fontSize: '18px' }}
        >
          ⏳ Waiting for another player to join...
        </h3>
        <p style={{ margin: '5px 0', color: '#004085' }}>
          Share the game URL to invite someone!
        </p>
      </div>
    );
  }

  // Active game status
  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          marginBottom: '10px',
        }}
      >
        <div>
          <p style={{ margin: '0', color: '#333', fontSize: '16px' }}>
            <strong>Current Turn:</strong> Player {currentTurn}
          </p>
        </div>
        <div
          style={{
            padding: '5px 12px',
            borderRadius: '15px',
            backgroundColor: canMove ? '#d4edda' : '#f8d7da',
            border: `1px solid ${canMove ? '#28a745' : '#dc3545'}`,
          }}
        >
          <p
            style={{
              margin: '0',
              color: canMove ? '#155724' : '#721c24',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {canMove ? '✓ Your Turn' : '⏳ Waiting for opponent'}
          </p>
        </div>
      </div>
    </div>
  );
}
