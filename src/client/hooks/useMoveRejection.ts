import { Position } from '@shared/types/game';
import { useCallback, useRef, useState } from 'react';

// Animation state for each cell
interface RejectionAnimation {
  isAnimating: boolean;
  revealedPosition?: Position;
  startTime: number;
}

// Animation configuration
const ANIMATION_DURATION = 1000; // 1000ms as specified in design
const REDUCED_ANIMATION_DURATION = 200; // Shorter for users who prefer reduced motion

export interface MoveRejectionState {
  // Animation state for each position (0-8, representing flattened 3x3 grid)
  animations: Map<number, RejectionAnimation>;

  // Check if a specific cell is currently animating
  isCellAnimating: (row: number, col: number) => boolean;

  // Trigger rejection animation for a specific cell
  triggerRejection: (revealedPosition: Position) => void;

  // Clear animation for a specific cell (auto-cleanup)
  clearAnimation: (row: number, col: number) => void;

  // Check if any cell is currently animating
  hasActiveAnimations: boolean;
}

// Convert row/col to flat index
const positionToIndex = (row: number, col: number): number => row * 3 + col;

// Check if user prefers reduced motion
const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export function useMoveRejection(): MoveRejectionState {
  const [animations, setAnimations] = useState<Map<number, RejectionAnimation>>(
    new Map()
  );
  const timeoutRefs = useRef<Map<number, number>>(new Map());

  // Clear animation for a specific cell
  const clearAnimation = useCallback((row: number, col: number) => {
    const index = positionToIndex(row, col);

    // Clear any existing timeout
    const existingTimeout = timeoutRefs.current.get(index);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutRefs.current.delete(index);
    }

    // Remove animation state
    setAnimations(prev => {
      const newAnimations = new Map(prev);
      newAnimations.delete(index);
      return newAnimations;
    });
  }, []);

  // Trigger rejection animation for a specific cell
  const triggerRejection = useCallback(
    (revealedPosition: Position) => {
      const { row, col } = revealedPosition;
      const index = positionToIndex(row, col);

      // Clear any existing animation for this cell
      clearAnimation(row, col);

      // Determine animation duration based on user preference
      const duration = prefersReducedMotion()
        ? REDUCED_ANIMATION_DURATION
        : ANIMATION_DURATION;

      // Set animation state
      setAnimations(prev => {
        const newAnimations = new Map(prev);
        newAnimations.set(index, {
          isAnimating: true,
          revealedPosition,
          startTime: Date.now(),
        });
        return newAnimations;
      });

      // Auto-clear animation after duration
      const timeout = setTimeout(() => {
        clearAnimation(row, col);
      }, duration);

      timeoutRefs.current.set(index, timeout);
    },
    [clearAnimation]
  );

  // Check if a specific cell is currently animating
  const isCellAnimating = useCallback(
    (row: number, col: number): boolean => {
      const index = positionToIndex(row, col);
      const animation = animations.get(index);
      return animation?.isAnimating ?? false;
    },
    [animations]
  );

  // Check if any cell is currently animating
  const hasActiveAnimations = animations.size > 0;

  // Cleanup timeouts on unmount
  // useEffect(() => {
  //   return () => {
  //     timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
  //     timeoutRefs.current.clear();
  //   };
  // }, []);

  return {
    animations,
    isCellAnimating,
    triggerRejection,
    clearAnimation,
    hasActiveAnimations,
  };
}

// Helper hook to integrate move rejection with useSocket
export function useMoveRejectionWithSocket() {
  const moveRejection = useMoveRejection();

  // Return the rejection handler that can be passed to useSocket
  const handleMoveResult = useCallback(
    (data: {
      success: boolean;
      error?: string;
      revealedPosition?: Position;
    }) => {
      // Only trigger rejection animation if move failed and we have revealed position
      if (!data.success && data.revealedPosition) {
        moveRejection.triggerRejection(data.revealedPosition);
      }
    },
    [moveRejection]
  );

  return {
    ...moveRejection,
    handleMoveResult,
  };
}
