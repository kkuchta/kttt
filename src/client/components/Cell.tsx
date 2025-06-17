import { CellState } from '@shared/types/game';
import React from 'react';

interface CellProps {
  value: CellState;
  canMove: boolean;
  onClick: () => void;
}

export function Cell({ value, canMove, onClick }: CellProps) {
  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (canMove && !value) {
      e.currentTarget.style.backgroundColor = '#007bff';
      e.currentTarget.style.color = 'white';
    }
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!value) {
      e.currentTarget.style.backgroundColor = '#fff';
      e.currentTarget.style.color = '#333';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={!canMove}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      style={{
        width: '80px',
        height: '80px',
        border: '2px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: value ? '#e9ecef' : '#fff',
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#333',
        cursor: canMove ? 'pointer' : 'not-allowed',
        borderRadius: '8px',
        transition: 'all 0.2s',
      }}
    >
      {value || ''}
    </button>
  );
}
