import { BotDifficulty } from '@shared/types/bot';
import { GameResult, Player } from '@shared/types/game';
import { Bot, Target } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  colors,
  createGlow,
  getHoverColor,
} from '../../shared/constants/colors';
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

  // Get result-specific colors
  const resultColor = isYourWin
    ? colors.successGreen
    : isDraw
      ? colors.queueOrange
      : colors.rejectionRed;

  // Button styles
  const primaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const humanButtonStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    backgroundColor: colors.queueOrange,
    color: '#ffffff',
    border: `2px solid ${colors.queueOrange}`,
    boxShadow: `0 0 15px ${createGlow(colors.queueOrange, 0.2)}`,
  };

  const botButtonStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    backgroundColor: colors.botBlue,
    color: '#ffffff',
    border: `2px solid ${colors.botBlue}`,
    boxShadow: `0 0 15px ${createGlow(colors.botBlue, 0.2)}`,
  };

  const homeButtonStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    backgroundColor: 'transparent',
    color: colors.textDim,
    border: `2px solid ${colors.textDim}`,
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: colors.background,
          border: `2px solid ${colors.gridLines}`,
          borderRadius: '20px',
          padding: '40px 35px',
          maxWidth: '450px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          textAlign: 'center',
          position: 'relative',
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
            background: `radial-gradient(circle at center, ${createGlow(resultColor, 0.02)} 0%, transparent 70%)`,
            borderRadius: '20px',
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Game Result Header */}
          <div
            style={{
              marginBottom: '30px',
              padding: '25px',
              borderRadius: '15px',
              backgroundColor: createGlow(resultColor, 0.1),
              border: `2px solid ${resultColor}`,
              boxShadow: `0 0 25px ${createGlow(resultColor, 0.2)}`,
            }}
          >
            <h2
              style={{
                margin: '0 0 12px 0',
                color: resultColor,
                fontSize: '32px',
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif',
                textShadow: `0 0 15px ${createGlow(resultColor, 0.3)}`,
              }}
            >
              {isYourWin ? 'Victory!' : isDraw ? 'Draw!' : 'Bot Wins!'}
            </h2>
            <p
              style={{
                margin: 0,
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: '500',
                fontFamily: 'Inter, sans-serif',
                lineHeight: '1.4',
              }}
            >
              {isYourWin
                ? `You successfully defeated the ${getBotDisplayName(botDifficulty)}!`
                : isDraw
                  ? `You and the ${getBotDisplayName(botDifficulty)} fought to a draw!`
                  : `The ${getBotDisplayName(botDifficulty)} claimed victory this time!`}
            </p>
          </div>

          {/* Game Options */}
          <h3
            style={{
              margin: '0 0 25px 0',
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            What would you like to do next?
          </h3>

          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            {/* Find Human Opponent */}
            <button
              onClick={handleFindHuman}
              style={humanButtonStyle}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = getHoverColor(
                  colors.queueOrange
                );
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 0 25px ${createGlow(colors.queueOrange, 0.3)}`;
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = colors.queueOrange;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 0 15px ${createGlow(colors.queueOrange, 0.2)}`;
              }}
            >
              <Target size={16} color="#ffffff" />
              <span>Find Human Opponent</span>
            </button>

            {/* Play Another Bot */}
            <button
              onClick={handlePlayAnotherBot}
              style={botButtonStyle}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = getHoverColor(
                  colors.botBlue
                );
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 0 25px ${createGlow(colors.botBlue, 0.3)}`;
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = colors.botBlue;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 0 15px ${createGlow(colors.botBlue, 0.2)}`;
              }}
            >
              <Bot size={16} color="#ffffff" />
              <span>Challenge {getBotDisplayName(botDifficulty)} Again</span>
            </button>

            {/* Go Home */}
            <button
              onClick={handleGoHome}
              style={homeButtonStyle}
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
              <span>🏠</span>
              <span>Return to Home</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              marginTop: '25px',
              padding: '10px 16px',
              fontSize: '14px',
              backgroundColor: 'transparent',
              color: colors.textDim,
              border: `1px solid ${colors.gridLines}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = createGlow(
                colors.gridLines,
                0.1
              );
              e.currentTarget.style.borderColor = colors.textDim;
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = colors.gridLines;
              e.currentTarget.style.color = colors.textDim;
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
}
