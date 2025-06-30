import { Board, Player, Position } from '@shared/types/game';
import { colors } from '../../shared/constants/colors';
import { Cell } from './Cell';

interface GameBoardProps {
  board: Board;
  canMove: boolean;
  onCellClick: (row: number, col: number) => void;
  yourPlayer: Player | null;
  revealedCells: Position[];
  isCellRejectionAnimating?: (row: number, col: number) => boolean;

  // Board reveal props (Phase 1)
  isInRevealMode?: boolean;
  revealBoard?: Board | null;
  // Phase 3: Animation orchestration
  revealingCells?: Position[];
  revealStep?: number; // Track how many pieces have been revealed
}

export function GameBoard({
  board,
  canMove,
  onCellClick,
  yourPlayer,
  revealedCells,
  isCellRejectionAnimating,
  isInRevealMode = false,
  revealBoard = null,
  revealingCells = [],
  revealStep = 0,
}: GameBoardProps) {
  // Helper function to check if a cell is revealed
  const isCellRevealed = (row: number, col: number): boolean => {
    return revealedCells.some(pos => pos.row === row && pos.col === col);
  };

  // Helper function to check if a cell is currently revealing
  const isCellRevealing = (row: number, col: number): boolean => {
    return revealingCells.some(pos => pos.row === row && pos.col === col);
  };

  // Create progressive board for reveal mode
  const getDisplayBoard = (): Board => {
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

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          padding: '30px',
          backgroundColor: colors.background,
          borderRadius: '15px',
          border: `3px solid ${colors.gridLines}`,
          boxShadow: `0 8px 25px rgba(0, 0, 0, 0.4)`,
          position: 'relative',
        }}
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
          }}
        >
          {displayBoard.flat().map((cell, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
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
                isRevealing={isCellRevealing(row, col)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
