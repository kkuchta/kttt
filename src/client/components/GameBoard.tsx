import { Board, Player, Position } from '@shared/types/game';
import React from 'react';
import { boxShadows, colors } from '../../shared/constants/colors';
import { Cell } from './Cell';

interface GameBoardProps {
  board: Board;
  canMove: boolean;
  onCellClick: (row: number, col: number) => void;
  yourPlayer: Player | null;
  revealedCells: Position[];
  hitPieces: Position[]; // Pieces that have been hit by opponent
  isCellRejectionAnimating?: (row: number, col: number) => boolean;

  // Board reveal props (Phase 1)
  isInRevealMode?: boolean;
  revealBoard?: Board | null;
  // Phase 3: Animation orchestration
  revealingCells?: Position[];
  revealStep?: number; // Track how many pieces have been revealed
  // Winner line highlighting
  isHighlightingWinnerLine?: boolean;
  winnerLineCells?: Position[];
  isWinnerLineAnimating?: boolean; // Whether winner line is actively animating
  // Game completion state
  gameCompleted?: boolean; // Whether the game has ended (to show full board)
  // Turn-based visual feedback
  isYourTurn?: boolean; // Whether it's currently the player's turn
}

export function GameBoard({
  board,
  canMove,
  onCellClick,
  yourPlayer,
  revealedCells,
  hitPieces,
  isCellRejectionAnimating,
  isInRevealMode = false,
  revealBoard = null,
  revealingCells = [],
  revealStep = 0,
  isHighlightingWinnerLine = false,
  winnerLineCells = [],
  isWinnerLineAnimating,
  gameCompleted,
  isYourTurn = false,
}: GameBoardProps) {
  // Helper function to check if a cell is revealed
  const isCellRevealed = (row: number, col: number): boolean => {
    return revealedCells.some(pos => pos.row === row && pos.col === col);
  };

  // Helper function to check if a cell is currently revealing
  const isCellRevealing = (row: number, col: number): boolean => {
    return revealingCells.some(pos => pos.row === row && pos.col === col);
  };

  // Helper function to check if a cell is in the winner line
  const isCellInWinnerLine = (row: number, col: number): boolean => {
    return winnerLineCells.some(pos => pos.row === row && pos.col === col);
  };

  // Helper function to check if a cell has been hit by opponent
  const isCellHit = (row: number, col: number): boolean => {
    return hitPieces.some(pos => pos.row === row && pos.col === col);
  };

  // Create progressive board for reveal mode
  const getDisplayBoard = (): Board => {
    // If game is completed and we have the final board, but we're NOT currently revealing, show complete board
    if (gameCompleted && revealBoard && !isInRevealMode) {
      return revealBoard; // Show complete final board for completed games (after reveal finishes)
    }

    if (!isInRevealMode || !revealBoard) {
      return board; // Normal mode - use filtered board
    }

    // In reveal mode: build progressive board
    const progressiveBoard: Board = board.map(row => [...row]) as Board;

    // Show pieces that are currently revealing OR have been revealed (up to revealStep)
    // This ensures pieces stay visible after their animation completes
    let revealedCount = 0;

    // First pass: mark pieces that should be permanently visible (completed reveals)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const originallyHidden =
          board[row][col] === null && revealBoard[row][col] !== null;

        if (originallyHidden) {
          revealedCount++;
          // If this piece's reveal step has passed, show it permanently
          if (revealedCount <= revealStep) {
            progressiveBoard[row][col] = revealBoard[row][col];
          }
        }
      }
    }

    // Second pass: add currently revealing pieces
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (isCellRevealing(row, col)) {
          progressiveBoard[row][col] = revealBoard[row][col];
        }
      }
    }

    return progressiveBoard;
  };

  // Determine which board to display based on reveal mode
  const displayBoard = getDisplayBoard();

  // Disable interactions during reveal animation
  const canInteract = canMove && !isInRevealMode;

  // Create enhanced board styling for turn-based feedback
  const getBoardStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'inline-block',
      padding: '30px',
      backgroundColor: colors.background,
      borderRadius: '15px',
      border: `3px solid ${colors.gridLines}`,
      boxShadow: `0 8px 25px rgba(0, 0, 0, 0.4), ${boxShadows.boardGlow}`,
      position: 'relative',
      transition: 'border-color 0.3s ease-in-out',
    };

    // Add prominent glow effect when it's the player's turn
    if (isYourTurn && !isInRevealMode && !gameCompleted) {
      return {
        ...baseStyles,
        border: `3px solid ${colors.successGreen}`,
        // Much simpler, performant styling
        animation: 'yourTurnBoardPulse 2s ease-in-out infinite alternate',
      };
    }

    return baseStyles;
  };

  return (
    <>
      {/* Optimized CSS animations - much more performant */}
      <style>{`
        @keyframes yourTurnBoardPulse {
          0% {
            border-color: ${colors.successGreen};
            transform: scale(1);
          }
          100% {
            border-color: ${colors.successGreen};
            transform: scale(1.02);
          }
        }
        
        /* Glow effect using pseudo-element for better performance */
        .game-board.your-turn::before {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          background: ${colors.successGreen};
          border-radius: 20px;
          opacity: 0.15;
          z-index: -1;
          animation: yourTurnGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes yourTurnGlow {
          0% { opacity: 0.1; }
          100% { opacity: 0.25; }
        }
        
        /* Disable animations for users who prefer reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .game-board {
            animation: none !important;
            transform: none !important;
          }
          .game-board.your-turn::before {
            animation: none !important;
            opacity: 0.15 !important;
          }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 20px',
        }}
      >
        <div
          className={`game-board ${isYourTurn && !isInRevealMode && !gameCompleted ? 'your-turn' : ''}`}
          style={getBoardStyles()}
        >
          {/* Optional subtle background pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '15px',
              background: `radial-gradient(circle at center, rgba(255, 255, 255, 0.01) 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 80px)',
              gridTemplateRows: 'repeat(3, 80px)',
              gap: '6px',
              position: 'relative',
              zIndex: 1,
              // Performance optimizations for smooth animations
              willChange: 'auto',
              transform: 'translateZ(0)', // Force hardware acceleration
              backfaceVisibility: 'hidden', // Prevent flickering
            }}
          >
            {displayBoard.flat().map((cell, index) => {
              const row = Math.floor(index / 3);
              const col = index % 3;
              const isCurrentlyRevealing = isCellRevealing(row, col);

              // DEBUG: Log revealing cells
              if (isCurrentlyRevealing) {
                console.log('GAMEBOARD: Cell is revealing:', {
                  row,
                  col,
                  cell,
                  revealingCells,
                });
              }

              return (
                <Cell
                  key={index}
                  value={cell}
                  canMove={canInteract}
                  onClick={() => onCellClick(row, col)}
                  yourPlayer={yourPlayer}
                  isRevealed={isCellRevealed(row, col)}
                  isRejectionAnimating={
                    isCellRejectionAnimating?.(row, col) ?? false
                  }
                  isRevealing={isCurrentlyRevealing}
                  isHighlightingWinnerLine={
                    isHighlightingWinnerLine && isCellInWinnerLine(row, col)
                  }
                  isWinnerLineAnimating={isWinnerLineAnimating}
                  isHit={isCellHit(row, col)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
