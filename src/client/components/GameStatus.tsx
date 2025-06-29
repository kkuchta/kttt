import {
  GameResult,
  GameStatus as GameStatusType,
  Player,
} from '@shared/types/game';
import React from 'react';
import { boxShadows, colors, createGlow } from '../../shared/constants/colors';

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
          marginBottom: '20px',
          padding: '15px 20px',
          borderRadius: '10px',
          backgroundColor: colors.background,
          border: `2px solid ${colors.botBlue}`,
          boxShadow: boxShadows.botIndicator,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '24px' }}>🤖</span>
          <p
            style={{
              margin: 0,
              color: colors.botBlue,
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            You ({botInfo.humanPlayer}) vs{' '}
            {getBotDisplayName(botInfo.botDifficulty)} ({botInfo.botPlayer})
          </p>
        </div>
      </div>
    );
  };

  // Helper function to render status badge
  const renderStatusBadge = (
    text: string,
    type: 'your-turn' | 'opponent-turn' | 'bot-thinking' | 'waiting'
  ) => {
    let badgeStyles: React.CSSProperties = {
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      border: '2px solid',
      transition: 'all 0.2s ease-in-out',
    };

    switch (type) {
      case 'your-turn':
        badgeStyles = {
          ...badgeStyles,
          backgroundColor: createGlow(colors.successGreen, 0.15),
          borderColor: colors.successGreen,
          color: colors.successGreen,
          boxShadow: `0 0 12px ${createGlow(colors.successGreen, 0.3)}`,
        };
        break;
      case 'opponent-turn':
        badgeStyles = {
          ...badgeStyles,
          backgroundColor: createGlow(colors.textDim, 0.1),
          borderColor: colors.textDim,
          color: colors.textDim,
        };
        break;
      case 'bot-thinking':
        badgeStyles = {
          ...badgeStyles,
          backgroundColor: createGlow(colors.queueOrange, 0.15),
          borderColor: colors.queueOrange,
          color: colors.queueOrange,
          boxShadow: `0 0 12px ${createGlow(colors.queueOrange, 0.3)}`,
        };
        break;
      case 'waiting':
        badgeStyles = {
          ...badgeStyles,
          backgroundColor: createGlow(colors.textDim, 0.1),
          borderColor: colors.textDim,
          color: colors.textDim,
        };
        break;
    }

    return (
      <div style={badgeStyles}>
        {type === 'your-turn' && <span>✓</span>}
        {type === 'bot-thinking' && (
          <span
            style={{
              animation: 'botThinking 1.5s ease-in-out infinite',
            }}
          >
            🤖
          </span>
        )}
        {type === 'waiting' && <span>⏳</span>}
        <span>{text}</span>
        {type === 'bot-thinking' && (
          <span
            style={{
              animation: 'dots 1.5s ease-in-out infinite',
            }}
          >
            ...
          </span>
        )}
      </div>
    );
  };

  // Handle completed games
  if (status === 'completed' && result) {
    if (result.winner) {
      const isYourWin = result.winner === yourPlayer;
      const isBotWin = botInfo && result.winner === botInfo.botPlayer;
      const winColor = isYourWin ? colors.successGreen : colors.rejectionRed;

      return (
        <div>
          {renderGameTypeHeader()}
          <div
            style={{
              marginBottom: '20px',
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: createGlow(winColor, 0.1),
              border: `2px solid ${winColor}`,
              textAlign: 'center',
              boxShadow: `0 0 20px ${createGlow(winColor, 0.2)}`,
            }}
          >
            <h3
              style={{
                margin: '0 0 12px 0',
                color: winColor,
                fontSize: '28px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
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
                margin: '8px 0',
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: '500',
                fontFamily: 'Inter, sans-serif',
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
                  margin: '8px 0 0 0',
                  color: colors.textDim,
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
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
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: createGlow(colors.queueOrange, 0.1),
              border: `2px solid ${colors.queueOrange}`,
              textAlign: 'center',
              boxShadow: `0 0 20px ${createGlow(colors.queueOrange, 0.2)}`,
            }}
          >
            <h3
              style={{
                margin: '0 0 12px 0',
                color: colors.queueOrange,
                fontSize: '28px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              🤝 It&apos;s a Draw!
            </h3>
            <p
              style={{
                margin: '8px 0',
                color: '#ffffff',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
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
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: createGlow(colors.botBlue, 0.1),
            border: `2px solid ${colors.botBlue}`,
            textAlign: 'center',
            boxShadow: boxShadows.botIndicator,
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              color: colors.botBlue,
              fontSize: '20px',
              fontWeight: '500',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ⏳ Waiting for another player to join...
          </h3>
          <p
            style={{
              margin: '8px 0',
              color: colors.textDim,
              fontFamily: 'Inter, sans-serif',
            }}
          >
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
    <>
      {/* CSS for animations */}
      <style>{`
        @keyframes botThinking {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes dots {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      <div style={{ marginBottom: '20px' }}>
        {renderGameTypeHeader()}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 20px',
            backgroundColor: colors.background,
            borderRadius: '12px',
            border: `2px solid ${colors.gridLines}`,
            marginBottom: '15px',
          }}
        >
          <div>
            <p
              style={{
                margin: '0',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '500',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <strong>Current Turn:</strong>{' '}
              {botInfo
                ? currentTurn === botInfo.botPlayer
                  ? `${getBotDisplayName(botInfo.botDifficulty)} (${currentTurn})`
                  : `You (${currentTurn})`
                : `Player ${currentTurn}`}
            </p>
          </div>

          {isYourTurn && renderStatusBadge('Your Turn', 'your-turn')}
          {isBotTurn && renderStatusBadge('Bot Thinking', 'bot-thinking')}
          {!isYourTurn &&
            !isBotTurn &&
            renderStatusBadge("Opponent's Turn", 'opponent-turn')}
        </div>
      </div>
    </>
  );
}
