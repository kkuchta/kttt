import { useEffect, useRef } from 'react';

interface TurnVisualFeedbackOptions {
  isYourTurn: boolean;
  isGameActive: boolean;
  gameId?: string;
}

// Base64 encoded favicon data URIs
const FAVICON_NORMAL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzBFMEUwRSIvPgo8cGF0aCBkPSJNOCAxMEgxMFY4SDhWMTBaIiBmaWxsPSIjNTU1NTU1Ii8+CjxwYXRoIGQ9Ik0xMiAxMEgxNFY4SDEyVjEwWiIgZmlsbD0iIzU1NTU1NSIvPgo8cGF0aCBkPSJNMTYgMTBIMThWOEgxNlYxMFoiIGZpbGw9IiM1NTU1NTUiLz4KPHBhdGggZD0iTTggMTRIMTBWMTJIOFYxNFoiIGZpbGw9IiM1NTU1NTUiLz4KPHBhdGggZD0iTTEyIDE0SDE0VjEySDEyVjE0WiIgZmlsbD0iIzU1NTU1NSIvPgo8cGF0aCBkPSJNMTYgMTRIMThWMTJIMTZWMTRaIiBmaWxsPSIjNTU1NTU1Ii8+CjxwYXRoIGQ9Ik04IDE4SDEwVjE2SDhWMThaIiBmaWxsPSIjNTU1NTU1Ii8+CjxwYXRoIGQ9Ik0xMiAxOEgxNFYxNkgxMlYxOFoiIGZpbGw9IiM1NTU1NTUiLz4KPHBhdGggZD0iTTE2IDE4SDE4VjE2SDE2VjE4WiIgZmlsbD0iIzU1NTU1NSIvPgo8L3N2Zz4K';
const FAVICON_YOUR_TURN =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzBFMEUwRSIvPgo8cGF0aCBkPSJNOCAxMEgxMFY4SDhWMTBaIiBmaWxsPSIjNTU1NTU1Ii8+CjxwYXRoIGQ9Ik0xMiAxMEgxNFY4SDEyVjEwWiIgZmlsbD0iIzU1NTU1NSIvPgo8cGF0aCBkPSJNMTYgMTBIMThWOEgxNlYxMFoiIGZpbGw9IiM1NTU1NTUiLz4KPHBhdGggZD0iTTggMTRIMTBWMTJIOFYxNFoiIGZpbGw9IiM1NTU1NTUiLz4KPHBhdGggZD0iTTEyIDE0SDE0VjEySDEyVjE0WiIgZmlsbD0iIzU1NTU1NSIvPgo8cGF0aCBkPSJNMTYgMTRIMThWMTJIMTZWMTRaIiBmaWxsPSIjNTU1NTU1Ii8+CjxwYXRoIGQ9Ik04IDE4SDEwVjE2SDhWMThaIiBmaWxsPSIjNTU1NTU1Ii8+CjxwYXRoIGQ9Ik0xMiAxOEgxNFYxNkgxMlYxOFoiIGZpbGw9IiM1NTU1NTUiLz4KPHBhdGggZD0iTTE2IDE4SDE4VjE2SDE2VjE4WiIgZmlsbD0iIzU1NTU1NSIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjgiIHI9IjQiIGZpbGw9IiMwMEZGOTkiLz4KPC9zdmc+Cg==';

// Default page title
const DEFAULT_TITLE = 'Kriegspiel Tic Tac Toe';

export function useTurnVisualFeedback({
  isYourTurn,
  isGameActive,
  gameId,
}: TurnVisualFeedbackOptions) {
  const originalTitle = useRef<string>(document.title);
  const originalFavicon = useRef<string>('');

  // Store original favicon on mount
  useEffect(() => {
    const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (link) {
      originalFavicon.current = link.href;
    }
  }, []);

  // Update page title and favicon based on turn state
  useEffect(() => {
    if (!isGameActive) {
      // Reset to defaults when game is not active
      document.title = DEFAULT_TITLE;
      updateFavicon(FAVICON_NORMAL);
      return;
    }

    if (isYourTurn) {
      // Update title with turn indicator
      const turnTitle = gameId
        ? `🟢 Your Turn - ${DEFAULT_TITLE}`
        : `🟢 Your Turn - ${DEFAULT_TITLE}`;
      document.title = turnTitle;

      // Update favicon to green dot version
      updateFavicon(FAVICON_YOUR_TURN);
    } else {
      // Opponent's turn or waiting
      document.title = DEFAULT_TITLE;
      updateFavicon(FAVICON_NORMAL);
    }
  }, [isYourTurn, isGameActive, gameId]);

  // Reset title and favicon on unmount
  useEffect(() => {
    return () => {
      document.title = originalTitle.current;
      if (originalFavicon.current) {
        updateFavicon(originalFavicon.current);
      }
    };
  }, []);

  // Helper function to update favicon
  const updateFavicon = (href: string) => {
    let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;

    if (!link) {
      // Create favicon link if it doesn't exist
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      document.head.appendChild(link);
    }

    link.href = href;
  };
}
