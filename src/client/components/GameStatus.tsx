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
  // Bot game information
  botInfo?: {
    isBot: true;
    botPlayer: Player;
    humanPlayer: Player;
    botDifficulty: string;
  };
}

export function GameStatus({
  status,
  currentTurn,
  canMove,
  result,
  yourPlayer,
  botInfo,
}: GameStatusProps) {
  // Helper function to get bot difficulty display name
  const getBotDisplayName = (difficulty: string): string => {
    const difficultyMap: Record<string, string> = {
      random: 'Random Bot',
      easy: 'Easy Bot',
      medium: 'Medium Bot',
      hard: 'Hard Bot',
    };
    return difficultyMap[difficulty] || `${difficulty} Bot`;
  };

  // Helper function to render game type header
  const renderGameTypeHeader = () => {
    if (!botInfo) return null;

    return (
      <div
        style={{
          marginBottom: '15px',
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: '#e3f2fd',
          border: '2px solid #2196f3',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '20px' }}>🤖</span>
          <p
            style={{
              margin: 0,
              color: '#1565c0',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            You ({botInfo.humanPlayer}) vs{' '}
            {getBotDisplayName(botInfo.botDifficulty)} ({botInfo.botPlayer})
          </p>
        </div>
      </div>
    );
  };

  // Handle completed games
  if (status === 'completed' && result) {
    if (result.winner) {
      const isYourWin = result.winner === yourPlayer;
      const isBotWin = botInfo && result.winner === botInfo.botPlayer;

      return (
        <div>
          {renderGameTypeHeader()}
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
              {isYourWin
                ? '🎉 You Won!'
                : isBotWin
                  ? '🤖 Bot Wins!'
                  : '😔 You Lost!'}
            </h3>
            <p
              style={{
                margin: '5px 0',
                color: isYourWin ? '#155724' : '#721c24',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              {isYourWin
                ? botInfo
                  ? `You beat the ${getBotDisplayName(botInfo.botDifficulty)}!`
                  : 'You won the game!'
                : isBotWin
                  ? `The ${getBotDisplayName(botInfo.botDifficulty)} outplayed you!`
                  : 'You lost the game!'}
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
        </div>
      );
    } else {
      // Draw
      return (
        <div>
          {renderGameTypeHeader()}
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
              {botInfo
                ? `Neither you nor the ${getBotDisplayName(botInfo.botDifficulty)} could win!`
                : 'The board is full with no winner.'}
            </p>
          </div>
        </div>
      );
    }
  }

  // Handle waiting for players (shouldn't happen for bot games, but just in case)
  if (status === 'waiting-for-players') {
    return (
      <div>
        {renderGameTypeHeader()}
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
      </div>
    );
  }

  // Active game status
  const isBotTurn = botInfo && currentTurn === botInfo.botPlayer;
  const isYourTurn = canMove && !isBotTurn;

  return (
    <div style={{ marginBottom: '20px' }}>
      {renderGameTypeHeader()}

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
            <strong>Current Turn:</strong>{' '}
            {botInfo
              ? currentTurn === botInfo.botPlayer
                ? `${getBotDisplayName(botInfo.botDifficulty)} (${currentTurn})`
                : `You (${currentTurn})`
              : `Player ${currentTurn}`}
          </p>
        </div>
        <div
          style={{
            padding: '5px 12px',
            borderRadius: '15px',
            backgroundColor: isYourTurn
              ? '#d4edda'
              : isBotTurn
                ? '#fff3cd'
                : '#f8d7da',
            border: `1px solid ${isYourTurn ? '#28a745' : isBotTurn ? '#ffc107' : '#dc3545'}`,
          }}
        >
          <p
            style={{
              margin: '0',
              color: isYourTurn ? '#155724' : isBotTurn ? '#856404' : '#721c24',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {isYourTurn
              ? '✓ Your Turn'
              : isBotTurn
                ? '🤖 Bot Thinking...'
                : '⏳ Waiting for opponent'}
          </p>
        </div>
      </div>
    </div>
  );
}
