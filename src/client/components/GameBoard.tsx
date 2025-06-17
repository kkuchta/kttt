import { Board } from '@shared/types/game';
import { Cell } from './Cell';

interface GameBoardProps {
  board: Board;
  canMove: boolean;
  onCellClick: (row: number, col: number) => void;
}

export function GameBoard({ board, canMove, onCellClick }: GameBoardProps) {
  return (
    <div
      style={{
        display: 'inline-block',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        border: '2px solid #dee2e6',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 80px)',
          gap: '4px',
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
            />
          );
        })}
      </div>
    </div>
  );
}
