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
  isRevealing?: boolean; // Whether this cell is currently in reveal animation
  isHighlightingWinnerLine?: boolean; // Whether this cell is part of the winning line
  isWinnerLineAnimating?: boolean; // Whether winner line is actively animating (vs permanent)
  isHit?: boolean; // Whether this cell is part of the hit state
}

// Cell state types for styling
export type CellDisplayState =
  | 'empty'
  | 'yours'
  | 'revealed'
  | 'rejecting'
  | 'revealing'
  | 'winningLine'
  | 'hit'; // New state for pieces that have been hit by opponent

function getCellDisplayState(
  value: CellState,
  yourPlayer: Player | null,
  isRevealed: boolean = false,
  isRejectionAnimating: boolean = false,
  isRevealing: boolean = false,
  isHighlightingWinnerLine: boolean = false,
  isHit: boolean = false
): CellDisplayState {
  if (isRejectionAnimating) return 'rejecting';
  if (isHighlightingWinnerLine && value !== null) return 'winningLine';
  if (isRevealing) return 'revealing';
  if (value === null) return 'empty';
  if (value === yourPlayer) {
    if (isHit) return 'hit'; // Your piece that was hit by opponent
    return 'yours';
  }
  if (isRevealed || value !== yourPlayer) return 'revealed';
  return 'empty';
}

// Generate styles based on cell state
function getCellStyles(
  state: CellDisplayState,
  value: CellState,
  canMove: boolean,
  canHover: boolean,
  isWinnerLineAnimating: boolean = false,
  yourPlayer: Player | null = null
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
    backgroundColor: colors.cellDepth,
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden', // Prevent content from overflowing rounded corners
    transition: 'all 0.2s ease-in-out',
    boxShadow: boxShadows.cellDepthSubtle,
    // Performance optimizations for smooth animations
    willChange: 'auto', // Let browser optimize automatically
    backfaceVisibility: 'hidden', // Prevent flickering during transforms
    transform: 'translateZ(0)', // Force hardware acceleration
  };

  // State-specific styling
  switch (state) {
    case 'empty':
      return {
        ...baseStyles,
        border: `2px solid ${colors.gridLines}`,
        backgroundColor: colors.cellDepth,
        boxShadow: boxShadows.cellDepthSubtle,
        // Hover effect for empty cells (desktop only)
        ':hover':
          canHover && canMove
            ? {
                backgroundColor: colors.gridDark,
                borderColor: colors.gridLight,
                boxShadow: boxShadows.cellDepth,
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

    case 'revealing': {
      // Use opponent color with fade-in animation
      const revealingColor = value === 'X' ? colors.xAccent : colors.oAccent;
      const revealingGlow =
        value === 'X' ? boxShadows.xPiece : boxShadows.oPiece;
      return {
        ...baseStyles,
        color: revealingColor,
        boxShadow: revealingGlow,
        border: `2px solid ${revealingColor}`,
        opacity: 0.8, // Slightly transparent as per design
        animation: 'pieceReveal 0.8s ease-in-out',
        zIndex: 10, // Ensure revealing animation is above other elements
      };
    }

    case 'winningLine': {
      // Use enhanced player color with golden glow for winning line
      const winnerColor = value === 'X' ? colors.xAccent : colors.oAccent;
      return {
        ...baseStyles,
        color: winnerColor,
        backgroundColor: createGlow(colors.winningLine, 0.2),
        border: `2px solid ${colors.winningLine}`,
        // Use stronger glow and animation during active phase, subtle glow when permanent
        boxShadow: isWinnerLineAnimating
          ? `0 0 30px ${createGlow(colors.winningLine, 0.6)}`
          : `0 0 15px ${createGlow(colors.winningLine, 0.3)}`,
        animation: isWinnerLineAnimating
          ? 'winningLineGlow 1s ease-in-out infinite'
          : 'none',
        zIndex: 15, // Above revealing but below rejecting
        transform: 'scale(1.05)', // Slightly larger for emphasis
      };
    }

    case 'hit': {
      // Enhanced styling for pieces that have been hit by opponent
      // Use opponent's color to show "they tried to place here"
      const opponentColor =
        yourPlayer === 'X'
          ? colors.oAccent
          : yourPlayer === 'O'
            ? colors.xAccent
            : colors.textDim;
      const opponentGlow =
        yourPlayer === 'X'
          ? boxShadows.oPiece
          : yourPlayer === 'O'
            ? boxShadows.xPiece
            : `0 0 15px ${colors.textDim}`;
      const enhancedGlow = `0 0 20px ${opponentColor}, 0 0 30px ${opponentColor}`;
      return {
        ...baseStyles,
        color: value === 'X' ? colors.xAccent : colors.oAccent, // Keep piece in its original color
        boxShadow: `${opponentGlow}, ${enhancedGlow}`, // But glow in opponent's color
        border: `3px solid ${opponentColor}`, // Border in opponent's color
        transform: 'scale(1.05)', // Slightly larger scale to emphasize
        backgroundColor: createGlow(opponentColor, 0.05), // Subtle background glow in opponent's color
      };
    }

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
  isRevealing = false,
  isHighlightingWinnerLine = false,
  isWinnerLineAnimating = false,
  isHit = false,
}: CellProps) {
  const state = getCellDisplayState(
    value,
    yourPlayer,
    isRevealed,
    isRejectionAnimating,
    isRevealing,
    isHighlightingWinnerLine,
    isHit
  );

  const canHover = !window.matchMedia('(pointer: coarse)').matches; // No hover on touch devices
  const styles = getCellStyles(
    state,
    value,
    canMove,
    canHover,
    isWinnerLineAnimating,
    yourPlayer
  );

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
          0%, 100% { 
            transform: translateX(0) scale(1); 
            will-change: transform;
          }
          10%, 30%, 50%, 70%, 90% { 
            transform: translateX(-3px) scale(1.05); 
          }
          20%, 40%, 60%, 80% { 
            transform: translateX(3px) scale(1.05); 
          }
        }
        
        @keyframes pieceReveal {
          0% { 
            opacity: 0; 
            transform: scale(0.5); 
            will-change: transform, opacity;
          }
          100% { 
            opacity: 0.8; 
            transform: scale(1); 
          }
        }
        
        @keyframes winningLineGlow {
          0%, 100% { 
            box-shadow: 0 0 20px ${createGlow(colors.winningLine, 0.4)};
            transform: scale(1.05);
            will-change: transform, box-shadow;
          }
          50% { 
            box-shadow: 0 0 40px ${createGlow(colors.winningLine, 0.8)};
            transform: scale(1.08);
          }
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
              : state === 'hit'
                ? `Your ${value} (hit by opponent)`
                : state === 'revealed'
                  ? `Revealed ${value}`
                  : state === 'rejecting'
                    ? 'Move rejected'
                    : state === 'winningLine'
                      ? 'Winning line'
                      : 'Revealing'
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
