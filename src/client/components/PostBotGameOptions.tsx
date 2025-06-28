import { BotDifficulty } from '@shared/types/bot';
import { GameResult, Player } from '@shared/types/game';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';

interface PostBotGameOptionsProps {
  result: GameResult;
  yourPlayer: Player | null;
  botDifficulty: string;
  onClose: () => void;
}

export function PostBotGameOptions({
  result,
  yourPlayer,
  botDifficulty,
  onClose,
}: PostBotGameOptionsProps) {
  const navigate = useNavigate();
  const { isConnected, connect, createBotGame, joinQueue } = useSocket({
    onBotGameCreated: data => {
      console.log('New bot game created:', data);
      onClose(); // Close the options modal
      navigate(`/game/${data.gameId}`);
    },
    onQueueJoined: () => {
      console.log('Joined matchmaking queue');
      onClose(); // Close the options modal
      navigate('/'); // Go to home page where QuickMatch component will show queue status
    },
    onBotGameError: data => {
      console.error('Bot game error:', data);
      alert(`Failed to create bot game: ${data.message}`);
    },
    onQueueError: data => {
      console.error('Queue error:', data);
      alert(`Failed to join queue: ${data.message}`);
    },
  });

  const isYourWin = result.winner === yourPlayer;
  const isDraw = !result.winner;

  const getBotDisplayName = (difficulty: string): string => {
    const difficultyMap: Record<string, string> = {
      random: 'Random Bot',
      easy: 'Easy Bot',
      medium: 'Medium Bot',
      hard: 'Hard Bot',
    };
    return difficultyMap[difficulty] || `${difficulty} Bot`;
  };

  const handleFindHuman = async () => {
    if (!isConnected) {
      await connect();
    }

    if (isConnected) {
      joinQueue();
    }
  };

  const handlePlayAnotherBot = async () => {
    if (!isConnected) {
      await connect();
    }

    if (isConnected) {
      createBotGame(botDifficulty as BotDifficulty, yourPlayer || 'X');
    }
  };

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
        }}
      >
        {/* Game Result Header */}
        <div
          style={{
            marginBottom: '25px',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: isYourWin
              ? '#d4edda'
              : isDraw
                ? '#fff3cd'
                : '#f8d7da',
            border: `2px solid ${
              isYourWin ? '#28a745' : isDraw ? '#ffc107' : '#dc3545'
            }`,
          }}
        >
          <h2
            style={{
              margin: '0 0 10px 0',
              color: isYourWin ? '#155724' : isDraw ? '#856404' : '#721c24',
              fontSize: '24px',
            }}
          >
            {isYourWin ? '🎉 You Won!' : isDraw ? '🤝 Draw!' : '🤖 Bot Wins!'}
          </h2>
          <p
            style={{
              margin: 0,
              color: isYourWin ? '#155724' : isDraw ? '#856404' : '#721c24',
              fontSize: '16px',
            }}
          >
            {isYourWin
              ? `You beat the ${getBotDisplayName(botDifficulty)}!`
              : isDraw
                ? `You and the ${getBotDisplayName(botDifficulty)} tied!`
                : `The ${getBotDisplayName(botDifficulty)} outplayed you!`}
          </p>
        </div>

        {/* Game Options */}
        <h3
          style={{
            margin: '0 0 20px 0',
            color: '#333',
            fontSize: '18px',
          }}
        >
          What would you like to do next?
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Find Human Opponent */}
          <button
            onClick={handleFindHuman}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              backgroundColor: '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              fontWeight: 'bold',
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = '#e8680f';
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = '#fd7e14';
            }}
          >
            🎯 Find Human Opponent
          </button>

          {/* Play Another Bot */}
          <button
            onClick={handlePlayAnotherBot}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              fontWeight: 'bold',
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = '#138496';
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = '#17a2b8';
            }}
          >
            🤖 Play Another {getBotDisplayName(botDifficulty)}
          </button>

          {/* Go Home */}
          <button
            onClick={handleGoHome}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = '#5a6268';
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = '#6c757d';
            }}
          >
            🏠 Go Home
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            padding: '8px 16px',
            fontSize: '14px',
            backgroundColor: 'transparent',
            color: '#6c757d',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = '#f8f9fa';
            e.currentTarget.style.borderColor = '#adb5bd';
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = '#dee2e6';
          }}
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
}
