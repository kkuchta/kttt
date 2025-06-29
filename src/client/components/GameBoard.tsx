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
}

export function GameBoard({
  board,
  canMove,
  onCellClick,
  yourPlayer,
  revealedCells,
  isCellRejectionAnimating,
}: GameBoardProps) {
  // Helper function to check if a cell is revealed
  const isCellRevealed = (row: number, col: number): boolean => {
    return revealedCells.some(pos => pos.row === row && pos.col === col);
  };

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
          {board.flat().map((cell, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            return (
              <Cell
                key={index}
                value={cell}
                canMove={canMove}
                onClick={() => onCellClick(row, col)}
                yourPlayer={yourPlayer}
                isRevealed={isCellRevealed(row, col)}
                isRejectionAnimating={
                  isCellRejectionAnimating?.(row, col) ?? false
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
