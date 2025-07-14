import { Board, GameResult, Player, Position } from '@shared/types/game';
import { Check, Link as LinkIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  colors,
  createGlow,
  getHoverColor,
} from '../../shared/constants/colors';
import { useMoveRejectionWithSocket } from '../hooks/useMoveRejection';
import { useSocket } from '../hooks/useSocket';
import { useTurnVisualFeedback } from '../hooks/useTurnVisualFeedback';
import { ConnectionIndicator } from './ConnectionIndicator';
import { GameBoard } from './GameBoard';
import { GameRules } from './GameRules';
import { GameStatus } from './GameStatus';
import { PageLayout } from './PageLayout';
import { PostBotGameOptions } from './PostBotGameOptions';

// Custom hook for responsive behavior
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

// Board reveal state interface
interface RevealState {
  isRevealing: boolean;
  revealedBoard: Board | null;
  revealStep: number;
  totalSteps: number;
  revealingCells: Position[]; // Cells currently being revealed with animation
  revealSequence: Position[]; // Order in which cells will be revealed
  // Winner line highlighting
  isHighlightingWinnerLine: boolean;
  winnerLineCells: Position[]; // Cells in the winning line to highlight
  isWinnerLineAnimating: boolean; // Whether winner line animation is active
}

// Initial reveal state
const initialRevealState: RevealState = {
  isRevealing: false,
  revealedBoard: null,
  revealStep: 0,
  totalSteps: 0,
  revealingCells: [],
  revealSequence: [],
  isHighlightingWinnerLine: false,
  winnerLineCells: [],
  isWinnerLineAnimating: false,
};

// Calculate the sequence of cells to reveal (hidden pieces)
const calculateRevealSequence = (
  currentVisibleBoard: Board,
  finalBoard: Board,
  yourPlayer: Player | null
): Position[] => {
  const hiddenCells: Position[] = [];

  console.log('[DEBUG] Calculating reveal sequence:');
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
          '[DEBUG] Adding missing player piece at (${row},${col}): ${finalCell}'
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
          '[DEBUG] Hidden opponent piece found at (${row},${col}): ${finalCell}'
        );
        hiddenCells.push({ row, col });
      } else if (preRevealCell !== finalCell) {
        console.log(
          '[DEBUG] Mismatch at (${row},${col}): preReveal=${preRevealCell}, final=${finalCell}'
        );
      } else {
        console.log(`[DEBUG] Same at (${row},${col}): ${preRevealCell}`);
      }
    }
  }

  console.log('[DEBUG] Hidden opponent cells to reveal:', hiddenCells);

  // For now, reveal in reading order (top-left to bottom-right)
  const sortedCells = hiddenCells.sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  console.log('[DEBUG] DEBUG: Final reveal sequence:', sortedCells);
  return sortedCells;
};

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // State for post-bot game options modal
  const [showPostBotGameOptions, setShowPostBotGameOptions] = useState(false);
  const [botGameResult, setBotGameResult] = useState<GameResult | null>(null);

  // Copy button state
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  // Board reveal state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [revealState, setRevealState] =
    useState<RevealState>(initialRevealState);

  // Refs for managing reveal animation timing
  const revealTimeoutRefs = useRef<number[]>([]);

  // Ref to track if component is mounted (prevent state updates after unmount)
  const isMounted = useRef(true);

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
            alert(isYourWin ? 'You Win!' : 'You Lose!');
          } else {
            alert('Game ended in a draw!');
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
      // Don't show error alerts for now, just log
    },
    onGameFull: () => {
      alert('Game is full! This game already has 2 players.');
      navigate('/');
    },
    onGameNotFound: () => {
      alert('Game not found! The game ID might be invalid or expired.');
      navigate('/');
    },
    onMoveResult: handleMoveResult,
    onOpponentHitPiece: data => {
      console.log('Opponent hit your piece!', data);
      // For now, just log the hit. In the future, we could add immediate animation here
      // The persistent visual indicator will be shown via the hitPieces in game state
    },
  });

  // Turn-based visual feedback (page title, favicon, etc.)
  const isYourTurn = Boolean(
    gameState?.canMove && gameState?.status === 'active'
  );
  const isGameActive = Boolean(gameState?.status === 'active');

  useTurnVisualFeedback({
    isYourTurn,
    isGameActive,
    gameId,
  });

  // Set mounted flag on mount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reveal completion callback - memoized to prevent useEffect loops
  const handleRevealComplete = useCallback(() => {
    if (!isMounted.current) return; // Prevent state updates after unmount

    console.log('REVEAL: Board reveal animation completed');

    // After reveal completes, show the appropriate game over UI
    if (botGameResult && gameState?.botInfo) {
      // For bot games, show the post-game options modal
      setShowPostBotGameOptions(true);
    }
    // Note: GameStatus component now handles result display, no need for alerts

    // Reset reveal state but keep the final board and winner line for completed games
    setRevealState(prev => ({
      ...initialRevealState,
      // Keep the revealed board so completed games continue showing all pieces
      revealedBoard: prev.revealedBoard,
      // Keep winner line highlighted but stop animation
      isHighlightingWinnerLine: prev.isHighlightingWinnerLine,
      winnerLineCells: prev.winnerLineCells,
      isWinnerLineAnimating: false, // Stop the pulsing animation
    }));
  }, [botGameResult, gameState?.botInfo, gameState?.yourPlayer, yourPlayer]);

  // Reveal animation orchestration - removed handleRevealComplete from deps to prevent loop
  useEffect(() => {
    console.log('REVEAL: Reveal useEffect triggered with:', {
      isRevealing: revealState.isRevealing,
      sequenceLength: revealState.revealSequence.length,
      revealSequence: revealState.revealSequence,
    });

    if (!revealState.isRevealing || revealState.revealSequence.length === 0) {
      console.log(
        'REVEAL: Skipping reveal animation - not revealing or empty sequence'
      );
      return;
    }

    console.log('REVEAL: Starting sequential reveal animation');

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      // Instant reveal for accessibility
      console.log('REVEAL: Using instant reveal (reduced motion)');
      handleRevealComplete();
      return;
    }

    // Clear any existing timeouts
    revealTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    revealTimeoutRefs.current = [];

    // Adaptive timing for quick games: shorter initial pause for ≤2 hidden pieces
    const isQuickGame = revealState.revealSequence.length <= 2;
    const initialPauseDuration = isQuickGame ? 400 : 700; // Reduced pause for quick games

    console.log(
      `REVEAL: ${isQuickGame ? 'Quick game' : 'Normal game'} detected: ${revealState.revealSequence.length} pieces, using ${initialPauseDuration}ms initial pause`
    );

    // Phase 1: Initial pause (adaptive timing)
    const initialPauseTimeout = setTimeout(() => {
      // Phase 2: Sequential piece reveal (300ms per piece)
      revealState.revealSequence.forEach((position, index) => {
        const revealTimeout = setTimeout(
          () => {
            console.log(
              `REVEAL: Revealing piece ${index + 1}/${revealState.revealSequence.length} at (${position.row},${position.col})`
            );

            // Add this cell to revealing cells (only if component is still mounted)
            if (isMounted.current) {
              setRevealState(prev => ({
                ...prev,
                revealStep: index + 1,
                revealingCells: [...prev.revealingCells, position],
              }));
            }

            console.log(
              'REVEAL: DEBUG: Added to revealingCells:',
              position,
              'Total revealing:',
              [...revealState.revealingCells, position].length
            );

            // Remove from revealing cells after animation (800ms, matching CSS animation)
            const removeTimeout = setTimeout(() => {
              console.log(
                `REVEAL: Finished revealing piece at (${position.row},${position.col})`
              );

              if (isMounted.current) {
                setRevealState(prev => ({
                  ...prev,
                  revealingCells: prev.revealingCells.filter(
                    cell =>
                      !(cell.row === position.row && cell.col === position.col)
                  ),
                }));
              }

              // Check if this was the last piece
              if (index === revealState.revealSequence.length - 1) {
                // Phase 3: Winner line highlight (if applicable)
                const startWinnerHighlightTimeout = setTimeout(() => {
                  if (
                    botGameResult?.winningLine &&
                    botGameResult.winningLine.length > 0
                  ) {
                    console.log('REVEAL: Starting winner line highlight');
                    if (isMounted.current) {
                      setRevealState(prev => ({
                        ...prev,
                        isHighlightingWinnerLine: true,
                        winnerLineCells: botGameResult.winningLine!,
                        isWinnerLineAnimating: true,
                      }));
                    }

                    // Phase 4: End winner line highlight and show final result UI
                    const endHighlightTimeout = setTimeout(() => {
                      console.log(
                        'REVEAL: Winner line highlight complete, calling handleRevealComplete'
                      );
                      handleRevealComplete();
                    }, 700); // Winner line highlight duration
                    revealTimeoutRefs.current.push(endHighlightTimeout);
                  } else {
                    // No winner line (draw), proceed directly to final result
                    console.log(
                      'REVEAL: No winner line to highlight, calling handleRevealComplete'
                    );
                    handleRevealComplete();
                  }
                }, 300); // Small delay after last piece animation
                revealTimeoutRefs.current.push(startWinnerHighlightTimeout);
              }
            }, 800); // Match pieceReveal animation duration
            revealTimeoutRefs.current.push(removeTimeout);
          },
          initialPauseDuration + index * 300
        ); // Adaptive initial pause + staggered timing
        revealTimeoutRefs.current.push(revealTimeout);
      });
    }, initialPauseDuration); // Adaptive initial pause

    revealTimeoutRefs.current.push(initialPauseTimeout);

    // Cleanup function
    return () => {
      revealTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      revealTimeoutRefs.current = [];
    };
  }, [revealState.isRevealing, revealState.revealSequence]);

  // Cancel any ongoing reveal animation
  const cancelReveal = useCallback((clearBotResult: boolean = true) => {
    console.log(
      'REVEAL: Canceling ongoing reveal animation, clearBotResult:',
      clearBotResult
    );

    // Clear all timeouts
    revealTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    revealTimeoutRefs.current = [];

    // Reset reveal state (only if component is mounted)
    if (isMounted.current) {
      setRevealState(initialRevealState);
      // Only clear bot result if explicitly requested
      if (clearBotResult) {
        setBotGameResult(null);
      }
    }
  }, []);

  // Start reveal animation
  const startReveal = (finalBoard: Board, gameResult: GameResult) => {
    console.log('REVEAL: Starting board reveal animation', {
      finalBoard,
      gameResult,
    });

    // Only clear timeouts, don't reset state (that's too aggressive)
    revealTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    revealTimeoutRefs.current = [];

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

    // Set reveal state (only if component is mounted)
    if (isMounted.current) {
      console.log('REVEAL: Setting reveal state with:', {
        isRevealing: true,
        hiddenPieces,
        revealSequence,
        isMounted: isMounted.current,
      });

      setRevealState({
        isRevealing: true,
        revealedBoard: finalBoard,
        revealStep: 0,
        totalSteps: hiddenPieces,
        revealingCells: [],
        revealSequence: revealSequence,
        isHighlightingWinnerLine: false,
        winnerLineCells: [],
        isWinnerLineAnimating: false,
      });
    } else {
      console.log(
        'REVEAL: ERROR: Component not mounted, cannot set reveal state'
      );
    }

    console.log('REVEAL: DEBUG: Reveal state set:', {
      hiddenPieces,
      revealSequenceLength: revealSequence.length,
      revealSequence,
      currentVisibleBoard,
      finalBoard,
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

  // Cancel reveal animation when gameId changes (new game started)
  useEffect(() => {
    return () => {
      // Cancel any ongoing reveal when switching games (but keep botGameResult for new game)
      console.log('REVEAL: gameId changed, canceling reveal for old game');
      cancelReveal(false); // Don't clear botGameResult - we might be starting a new reveal soon
    };
  }, [gameId, cancelReveal]);

  // Cleanup localStorage when game changes
  useEffect(() => {
    return () => {
      // Clean up localStorage for this game when navigating away
      if (gameId) {
        localStorage.removeItem(`game-${gameId}-player`);
      }
    };
  }, [gameId]);

  // Component unmount cleanup only
  useEffect(() => {
    return () => {
      // Mark component as unmounted
      isMounted.current = false;

      // Cancel any ongoing reveal animations (and clear bot result since unmounting)
      cancelReveal(true);
    };
  }, []); // No dependencies - only runs on actual unmount

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
      {/* Connection Indicator - subtle dot in top-right corner */}
      <ConnectionIndicator
        isConnected={isConnected}
        isConnecting={isConnecting}
        error={error}
      />

      {/* Header */}
      <div
        style={{
          marginBottom: '25px',
          backgroundColor: colors.background,
          border: `2px solid ${colors.gridLines}`,
          padding: '20px 20px',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '15px',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                color: '#ffffff',
                fontSize: isMobile ? '24px' : '28px', // Responsive title size
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif',
                textShadow: '0 0 15px rgba(255, 255, 255, 0.1)',
                lineHeight: '1.2',
              }}
            >
              Kriegspiel Tic Tac Toe
            </h1>
            <p
              style={{
                margin: '8px 0 0 0',
                color: colors.textDim,
                fontSize: isMobile ? '14px' : '16px',
                fontFamily: 'Space Grotesk, monospace',
                letterSpacing: '1px',
              }}
            >
              Game ID: <strong style={{ color: '#ffffff' }}>{gameId}</strong>
            </p>
            {yourPlayer && (
              <p
                style={{
                  margin: '8px 0 0 0',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Playing as:{' '}
                <span
                  style={{
                    color: yourPlayer === 'X' ? colors.xAccent : colors.oAccent,
                    fontFamily: 'Space Grotesk, monospace',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  {yourPlayer}
                </span>
              </p>
            )}
          </div>

          {/* Buttons - responsive layout */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '8px' : '10px',
              alignItems: isMobile ? 'stretch' : 'center',
              marginLeft: '15px',
              flexShrink: 0,
            }}
          >
            <Link
              to="/about"
              style={{
                padding: isMobile ? '8px 12px' : '10px 18px',
                backgroundColor: 'transparent',
                color: colors.textDim,
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'Inter, sans-serif',
                border: `1px solid ${colors.gridLines}`,
                transition: 'all 0.2s ease-in-out',
                textAlign: 'center',
                minWidth: isMobile ? '80px' : 'auto',
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
              About
            </Link>
            <Link
              to="/"
              style={{
                padding: isMobile ? '8px 12px' : '10px 18px',
                backgroundColor: colors.textDim,
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'Inter, sans-serif',
                border: `1px solid ${colors.textDim}`,
                transition: 'all 0.2s ease-in-out',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                minWidth: isMobile ? '80px' : 'auto',
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
        </div>
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
            <LinkIcon
              size={18}
              style={{ verticalAlign: 'middle', marginRight: 4 }}
            />{' '}
            Invite a Friend
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
                setCopyState('copied');
                // Revert back to idle state after 2 seconds
                setTimeout(() => {
                  setCopyState('idle');
                }, 2000);
              }}
              style={{
                padding: '12px 20px',
                backgroundColor:
                  copyState === 'copied' ? colors.successGreen : colors.botBlue,
                color: '#ffffff',
                border: `2px solid ${copyState === 'copied' ? colors.successGreen : colors.botBlue}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s ease-in-out',
                minWidth: '100px', // Prevent button width changes
              }}
              onMouseOver={e => {
                if (copyState === 'idle') {
                  e.currentTarget.style.backgroundColor = getHoverColor(
                    colors.botBlue
                  );
                  e.currentTarget.style.boxShadow = `0 0 15px ${createGlow(colors.botBlue, 0.3)}`;
                }
              }}
              onMouseOut={e => {
                if (copyState === 'idle') {
                  e.currentTarget.style.backgroundColor = colors.botBlue;
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {copyState === 'copied' ? (
                <>
                  <span>Copied!</span>
                  <Check
                    size={16}
                    color="#ffffff"
                    style={{ marginLeft: '4px' }}
                  />
                </>
              ) : (
                'Copy'
              )}
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
            hitPieces={gameState.hitPieces}
            isCellRejectionAnimating={isCellAnimating}
            isInRevealMode={revealState.isRevealing}
            revealBoard={revealState.revealedBoard}
            revealingCells={revealState.revealingCells}
            revealStep={revealState.revealStep}
            isHighlightingWinnerLine={revealState.isHighlightingWinnerLine}
            winnerLineCells={revealState.winnerLineCells}
            isWinnerLineAnimating={revealState.isWinnerLineAnimating}
            gameCompleted={gameState.status === 'completed'}
            isYourTurn={isYourTurn}
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
              ? 'Connecting to game...'
              : isConnected
                ? 'Joining game...'
                : 'Connection Failed - Unable to connect to game'}
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
