import { CellState, Player } from '@shared/types/game';
import React from 'react';
import {
  boxShadows,
  colors,
  createGlow,
  getPlayerGlow,
} from '../../shared/constants/colors';

interface CellProps {
  value: CellState;
  canMove: boolean;
  onClick: () => void;
  yourPlayer: Player | null;
  isRevealed?: boolean; // Whether this opponent piece was revealed
  isRejectionAnimating?: boolean; // Whether rejection animation is active
}

// Cell state types for styling
type CellDisplayState = 'empty' | 'yours' | 'revealed' | 'rejecting';

function getCellDisplayState(
  value: CellState,
  yourPlayer: Player | null,
  isRevealed: boolean = false,
  isRejectionAnimating: boolean = false
): CellDisplayState {
  if (isRejectionAnimating) return 'rejecting';
  if (value === null) return 'empty';
  if (value === yourPlayer) return 'yours';
  if (isRevealed || value !== yourPlayer) return 'revealed';
  return 'empty';
}

// Generate styles based on cell state
function getCellStyles(
  state: CellDisplayState,
  value: CellState,
  canMove: boolean,
  canHover: boolean
) {
  const baseStyles: React.CSSProperties = {
    width: '80px',
    height: '80px',
    border: `2px solid ${colors.gridLines}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '500',
    fontFamily: 'Space Grotesk, monospace', // Geometric font for symbols
    cursor: canMove && state === 'empty' ? 'pointer' : 'not-allowed',
    borderRadius: '8px',
    backgroundColor: colors.background,
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.2s ease-in-out',
  };

  // State-specific styling
  switch (state) {
    case 'empty':
      return {
        ...baseStyles,
        border: `2px solid ${colors.gridLines}`,
        backgroundColor: colors.background,
        // Hover effect for empty cells (desktop only)
        ':hover':
          canHover && canMove
            ? {
                backgroundColor: '#1a1a1a',
                borderColor: colors.textDim,
              }
            : {},
      };

    case 'yours': {
      const yourGlow = value === 'X' ? boxShadows.xPiece : boxShadows.oPiece;
      const yourColor = value === 'X' ? colors.xAccent : colors.oAccent;
      return {
        ...baseStyles,
        color: yourColor,
        boxShadow: yourGlow,
        border: `2px solid ${yourColor}`,
        transform: 'scale(1.02)', // Slight scale to emphasize your pieces
      };
    }

    case 'revealed': {
      const revealedGlow =
        value === 'X'
          ? createGlow(colors.xAccent, 0.1)
          : createGlow(colors.oAccent, 0.1);
      return {
        ...baseStyles,
        color: colors.textDim, // Dimmer color for revealed pieces
        boxShadow: `0 0 10px ${revealedGlow}`, // Subtle glow
        border: `2px solid ${colors.textDim}`,
        opacity: 0.8, // Slightly transparent to show it's revealed
      };
    }

    case 'rejecting':
      return {
        ...baseStyles,
        backgroundColor: colors.rejectionRed,
        boxShadow: boxShadows.rejection,
        border: `2px solid ${colors.rejectionRed}`,
        color: '#ffffff',
        animation: 'rejectionShake 0.6s ease-in-out',
        zIndex: 10, // Ensure rejection animation is above other elements
      };

    default:
      return baseStyles;
  }
}

export function Cell({
  value,
  canMove,
  onClick,
  yourPlayer,
  isRevealed = false,
  isRejectionAnimating = false,
}: CellProps) {
  const state = getCellDisplayState(
    value,
    yourPlayer,
    isRevealed,
    isRejectionAnimating
  );
  const canHover = !window.matchMedia('(pointer: coarse)').matches; // No hover on touch devices
  const styles = getCellStyles(state, value, canMove, canHover);

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const finalStyles: React.CSSProperties = {
    ...styles,
    // Disable animations if user prefers reduced motion
    animation: prefersReducedMotion ? 'none' : styles.animation,
    transition: prefersReducedMotion ? 'none' : styles.transition,
  };

  return (
    <>
      {/* CSS keyframes for rejection animation */}
      <style>{`
        @keyframes rejectionShake {
          0%, 100% { transform: translateX(0) scale(1); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px) scale(1.05); }
          20%, 40%, 60%, 80% { transform: translateX(3px) scale(1.05); }
        }
        
        /* Hover effects for desktop */
        @media (hover: hover) and (pointer: fine) {
          .cell-empty:hover {
            background-color: #1a1a1a !important;
            border-color: ${colors.textDim} !important;
          }
        }
      `}</style>

      <button
        onClick={onClick}
        disabled={!canMove || state !== 'empty'}
        className={`cell-${state}`}
        style={finalStyles}
        aria-label={
          state === 'empty'
            ? 'Empty cell'
            : state === 'yours'
              ? `Your ${value}`
              : state === 'revealed'
                ? `Revealed ${value}`
                : 'Move rejected'
        }
      >
        {/* Cell content */}
        {value && (
          <span
            style={{
              fontSize: '32px',
              fontWeight: '500',
              lineHeight: '1',
              userSelect: 'none',
              // Add slight glow text effect for better visibility
              textShadow:
                state === 'yours' ? `0 0 8px ${getPlayerGlow(value)}` : 'none',
            }}
          >
            {value}
          </span>
        )}

        {/* Rejection error overlay */}
        {state === 'rejecting' && (
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: colors.rejectionRed,
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              zIndex: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            Cell occupied!
          </div>
        )}
      </button>
    </>
  );
}
