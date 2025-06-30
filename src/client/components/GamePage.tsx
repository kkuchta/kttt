import { Board, GameResult, Player, Position } from '@shared/types/game';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  colors,
  createGlow,
  getHoverColor,
} from '../../shared/constants/colors';
import { useMoveRejectionWithSocket } from '../hooks/useMoveRejection';
import { useSocket } from '../hooks/useSocket';
import { GameBoard } from './GameBoard';
import { GameRules } from './GameRules';
import { GameStatus } from './GameStatus';
import { PageLayout } from './PageLayout';
import { PostBotGameOptions } from './PostBotGameOptions';

// Board reveal state interface
interface RevealState {
  isRevealing: boolean;
  revealedBoard: Board | null;
  revealStep: number;
  totalSteps: number;
  revealingCells: Position[]; // Cells currently being revealed with animation
  revealSequence: Position[]; // Order in which cells will be revealed
}

// Initial reveal state
const initialRevealState: RevealState = {
  isRevealing: false,
  revealedBoard: null,
  revealStep: 0,
  totalSteps: 0,
  revealingCells: [],
  revealSequence: [],
};

// Calculate the sequence of cells to reveal (hidden pieces)
const calculateRevealSequence = (
  currentVisibleBoard: Board,
  finalBoard: Board,
  yourPlayer: Player | null
): Position[] => {
  const hiddenCells: Position[] = [];

  console.log('🔍 Calculating reveal sequence:');
  console.log('Current visible board:', currentVisibleBoard);
  console.log('Final board:', finalBoard);
  console.log('Your player:', yourPlayer);

  // Create a proper pre-reveal board that includes ALL player pieces from final board
  const preRevealBoard: Board = currentVisibleBoard.map(row => [
    ...row,
  ]) as Board;

  // Add any missing player pieces from final board (like the winning move)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const finalCell = finalBoard[row][col];

      // If final board has player's piece but current visible doesn't, add it
      if (finalCell === yourPlayer && preRevealBoard[row][col] === null) {
        console.log(
          `🔍 Adding missing player piece at (${row},${col}): ${finalCell}`
        );
        preRevealBoard[row][col] = finalCell;
      }
    }
  }

  console.log('Pre-reveal board (with all player pieces):', preRevealBoard);

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const preRevealCell = preRevealBoard[row][col];
      const finalCell = finalBoard[row][col];

      // Find opponent pieces that are in finalBoard but not in preRevealBoard
      if (
        finalCell !== null &&
        finalCell !== yourPlayer &&
        preRevealCell === null
      ) {
        console.log(
          `🔍 Hidden opponent piece found at (${row},${col}): ${finalCell}`
        );
        hiddenCells.push({ row, col });
      } else if (preRevealCell !== finalCell) {
        console.log(
          `🔍 Mismatch at (${row},${col}): preReveal=${preRevealCell}, final=${finalCell}`
        );
      } else {
        console.log(`🔍 Same at (${row},${col}): ${preRevealCell}`);
      }
    }
  }

  console.log('🔍 Hidden opponent cells to reveal:', hiddenCells);

  // For now, reveal in reading order (top-left to bottom-right)
  return hiddenCells.sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });
};

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  // State for post-bot game options modal
  const [showPostBotGameOptions, setShowPostBotGameOptions] = useState(false);
  const [botGameResult, setBotGameResult] = useState<GameResult | null>(null);

  // Board reveal state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [revealState, setRevealState] =
    useState<RevealState>(initialRevealState);

  // Refs for managing reveal animation timing
  const revealTimeoutRefs = useRef<number[]>([]);

  // Move rejection hook for animations
  const { isCellAnimating, handleMoveResult } = useMoveRejectionWithSocket();

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

      // Instead of showing immediate alerts/modals, start the reveal animation
      if (data.finalBoard) {
        startReveal(data.finalBoard, data.result);
      } else {
        // Fallback to old behavior if no finalBoard (shouldn't happen)
        console.warn('No finalBoard received in game-over event');

        // Check if this is a bot game
        if (gameState?.botInfo) {
          setBotGameResult(data.result);
          setShowPostBotGameOptions(true);
        } else {
          // For human games, keep the existing alert behavior
          const currentPlayer = yourPlayer || gameState?.yourPlayer;

          // Show win announcement
          if (data.result.winner) {
            const isYourWin = data.result.winner === currentPlayer;
            alert(isYourWin ? '🎉 You win!' : '😔 You lose!');
          } else {
            alert('🤝 Game ended in a draw!');
          }
        }
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
    onMoveResult: handleMoveResult, // Integrate move rejection animations
  });

  // Reveal completion callback - memoized to prevent useEffect loops
  const handleRevealComplete = useCallback(() => {
    console.log('🎭 Board reveal animation completed');

    // After reveal completes, show the appropriate game over UI
    if (botGameResult && gameState?.botInfo) {
      // For bot games, show the post-game options modal
      setShowPostBotGameOptions(true);
    }
    // Note: GameStatus component now handles result display, no need for alerts

    // Reset reveal state
    setRevealState(initialRevealState);
  }, [botGameResult, gameState?.botInfo, gameState?.yourPlayer, yourPlayer]);

  // Reveal animation orchestration - removed handleRevealComplete from deps to prevent loop
  useEffect(() => {
    if (!revealState.isRevealing || revealState.revealSequence.length === 0) {
      return;
    }

    console.log('🎭 Starting sequential reveal animation');

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      // Instant reveal for accessibility
      console.log('🎭 Using instant reveal (reduced motion)');
      handleRevealComplete();
      return;
    }

    // Clear any existing timeouts
    revealTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    revealTimeoutRefs.current = [];

    // Phase 1: Initial pause (500ms)
    const initialPauseTimeout = setTimeout(() => {
      // Phase 2: Sequential piece reveal (200ms per piece)
      revealState.revealSequence.forEach((position, index) => {
        const revealTimeout = setTimeout(
          () => {
            console.log(
              `🎭 Revealing piece ${index + 1}/${revealState.revealSequence.length} at (${position.row},${position.col})`
            );

            // Add this cell to revealing cells
            setRevealState(prev => ({
              ...prev,
              revealStep: index + 1,
              revealingCells: [...prev.revealingCells, position],
            }));

            // Remove from revealing cells after animation (800ms, matching CSS animation)
            const removeTimeout = setTimeout(() => {
              console.log(
                `🎭 Finished revealing piece at (${position.row},${position.col})`
              );

              setRevealState(prev => ({
                ...prev,
                revealingCells: prev.revealingCells.filter(
                  cell =>
                    !(cell.row === position.row && cell.col === position.col)
                ),
              }));

              // Check if this was the last piece
              if (index === revealState.revealSequence.length - 1) {
                // Phase 4: Show final result UI after slight delay
                const completeTimeout = setTimeout(() => {
                  console.log(
                    '🎭 All pieces revealed, calling handleRevealComplete'
                  );
                  handleRevealComplete();
                }, 200); // Small delay after last animation
                revealTimeoutRefs.current.push(completeTimeout);
              }
            }, 800); // Match pieceReveal animation duration
            revealTimeoutRefs.current.push(removeTimeout);
          },
          500 + index * 200
        ); // Initial pause + staggered timing
        revealTimeoutRefs.current.push(revealTimeout);
      });
    }, 500); // Initial pause

    revealTimeoutRefs.current.push(initialPauseTimeout);

    // Cleanup function
    return () => {
      revealTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      revealTimeoutRefs.current = [];
    };
  }, [revealState.isRevealing, revealState.revealSequence]);

  // Start reveal animation
  const startReveal = (finalBoard: Board, gameResult: GameResult) => {
    console.log('🎭 Starting board reveal animation', {
      finalBoard,
      gameResult,
    });

    // Store the game result for use after reveal
    setBotGameResult(gameResult);

    // Calculate total steps (number of hidden pieces to reveal)
    const currentVisibleBoard = gameState?.visibleBoard;
    let hiddenPieces = 0;
    let revealSequence: Position[] = [];

    if (currentVisibleBoard) {
      revealSequence = calculateRevealSequence(
        currentVisibleBoard,
        finalBoard,
        yourPlayer || gameState?.yourPlayer
      );
      hiddenPieces = revealSequence.length;
    }

    // Set reveal state
    setRevealState({
      isRevealing: true,
      revealedBoard: finalBoard,
      revealStep: 0,
      totalSteps: hiddenPieces,
      revealingCells: [],
      revealSequence: revealSequence,
    });
  };

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
    <PageLayout variant="game" maxWidth="700px">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          backgroundColor: colors.background,
          border: `2px solid ${colors.gridLines}`,
          padding: '20px 25px',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '28px',
              fontWeight: '700',
              fontFamily: 'Inter, sans-serif',
              textShadow: '0 0 15px rgba(255, 255, 255, 0.1)',
            }}
          >
            Kriegspiel Tic Tac Toe
          </h1>
          <p
            style={{
              margin: '8px 0 0 0',
              color: colors.textDim,
              fontSize: '16px',
              fontFamily: 'Space Grotesk, monospace',
              letterSpacing: '1px',
            }}
          >
            Game ID: <strong style={{ color: '#ffffff' }}>{gameId}</strong>
          </p>
        </div>
        <Link
          to="/"
          style={{
            padding: '12px 20px',
            backgroundColor: colors.textDim,
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            fontFamily: 'Inter, sans-serif',
            border: `2px solid ${colors.textDim}`,
            transition: 'all 0.2s ease-in-out',
          }}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.color = colors.background;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = colors.textDim;
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← Home
        </Link>
      </div>

      {/* Connection Status */}
      <div
        style={{
          padding: '20px',
          margin: '0 0 25px 0',
          borderRadius: '12px',
          backgroundColor: colors.background,
          border: `2px solid ${colors.gridLines}`,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h3
          style={{
            margin: '0 0 15px 0',
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: '600',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Connection Status
        </h3>
        <div
          style={{
            padding: '15px 20px',
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

        {yourPlayer && (
          <p
            style={{
              margin: '15px 0 0 0',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '500',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <strong>You are playing as:</strong>{' '}
            <span
              style={{
                color: yourPlayer === 'X' ? colors.xAccent : colors.oAccent,
                fontFamily: 'Space Grotesk, monospace',
                fontSize: '18px',
                fontWeight: '600',
              }}
            >
              {yourPlayer}
            </span>
          </p>
        )}
      </div>

      {/* Share Game URL - only show for human vs human games */}
      {(!gameState || !gameState.botInfo) && (
        <div
          style={{
            padding: '20px',
            margin: '0 0 25px 0',
            borderRadius: '12px',
            backgroundColor: colors.background,
            border: `2px solid ${colors.botBlue}`,
            boxShadow: `0 0 20px ${createGlow(colors.botBlue, 0.1)}`,
          }}
        >
          <h3
            style={{
              margin: '0 0 15px 0',
              color: colors.botBlue,
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            🔗 Invite a Friend
          </h3>
          <p
            style={{
              margin: '0 0 15px 0',
              color: colors.textDim,
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Share this URL with someone to play together:
          </p>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              backgroundColor: createGlow(colors.gridLines, 0.1),
              padding: '15px',
              borderRadius: '8px',
              border: `1px solid ${colors.gridLines}`,
            }}
          >
            <input
              type="text"
              value={gameUrl}
              readOnly
              style={{
                flex: 1,
                padding: '12px',
                border: `2px solid ${colors.gridLines}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'Space Grotesk, monospace',
                backgroundColor: colors.background,
                color: '#ffffff',
                outline: 'none',
              }}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(gameUrl);
                alert('Game URL copied to clipboard!');
              }}
              style={{
                padding: '12px 20px',
                backgroundColor: colors.botBlue,
                color: '#ffffff',
                border: `2px solid ${colors.botBlue}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s ease-in-out',
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = getHoverColor(
                  colors.botBlue
                );
                e.currentTarget.style.boxShadow = `0 0 15px ${createGlow(colors.botBlue, 0.3)}`;
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = colors.botBlue;
                e.currentTarget.style.boxShadow = 'none';
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
            padding: '25px',
            borderRadius: '15px',
            backgroundColor: colors.background,
            border: `2px solid ${colors.gridLines}`,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
            textAlign: 'center',
          }}
        >
          <GameStatus
            status={gameState.status}
            currentTurn={gameState.currentTurn}
            canMove={gameState.canMove}
            result={gameState.result}
            yourPlayer={gameState.yourPlayer}
            botInfo={gameState.botInfo}
            isRevealing={revealState.isRevealing}
          />

          <GameBoard
            board={gameState.visibleBoard}
            canMove={gameState.canMove}
            onCellClick={handleCellClick}
            yourPlayer={gameState.yourPlayer}
            revealedCells={gameState.revealedCells}
            isCellRejectionAnimating={isCellAnimating}
            isInRevealMode={revealState.isRevealing}
            revealBoard={revealState.revealedBoard}
            revealingCells={revealState.revealingCells}
            revealStep={revealState.revealStep}
          />

          <GameRules />
        </div>
      ) : (
        <div
          style={{
            padding: '50px',
            borderRadius: '15px',
            backgroundColor: colors.background,
            border: `2px solid ${colors.gridLines}`,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              color: colors.textDim,
              fontSize: '20px',
              fontFamily: 'Inter, sans-serif',
              margin: 0,
            }}
          >
            {isConnecting
              ? '🔄 Connecting to game...'
              : isConnected
                ? '🎮 Joining game...'
                : '❌ Unable to connect to game'}
          </p>
        </div>
      )}

      {/* Post-Bot Game Options Modal */}
      {showPostBotGameOptions && botGameResult && gameState?.botInfo && (
        <PostBotGameOptions
          result={botGameResult}
          yourPlayer={gameState.yourPlayer}
          botDifficulty={gameState.botInfo.botDifficulty}
          onClose={() => {
            setShowPostBotGameOptions(false);
            setBotGameResult(null);
          }}
        />
      )}
    </PageLayout>
  );
}
