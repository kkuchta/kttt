// Design Color Palette
export const colors = {
  // Core theme colors
  background: '#0e0e0e',
  gridLines: '#1a1a1a',
  textDim: '#666666',

  // Player accent colors
  xAccent: '#00ffe7', // Teal
  oAccent: '#ff5e78', // Coral

  // Feedback colors
  rejectionRed: '#ff3c3c', // Primary - Move rejection flash
  successGreen: '#00ff99', // Move accepted confirmation

  // UI accent colors
  botBlue: '#2196f3', // Bot game indicators and headers
  queueOrange: '#ffc107', // Matchmaking queue status
} as const;

// Player type for utility functions
export type Player = 'X' | 'O';

// Utility function to get player-specific glow color
export const getPlayerGlow = (player: Player): string => {
  return player === 'X' ? colors.xAccent : colors.oAccent;
};

// Utility function to create glow effect with specified opacity
export const createGlow = (color: string, opacity: number = 0.2): string => {
  // Convert hex to rgba for glow effects
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Utility function to get hover color (slightly lighter version)
export const getHoverColor = (baseColor: string): string => {
  // For dark theme, hover states are typically lighter
  // This creates a subtle brightness increase
  const hex = baseColor.replace('#', '');
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + 30);
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + 30);
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + 30);

  return `rgb(${r}, ${g}, ${b})`;
};

// Pre-computed glow colors for common use cases
export const glows = {
  xGlow: createGlow(colors.xAccent, 0.2),
  oGlow: createGlow(colors.oAccent, 0.2),
  rejectionGlow: createGlow(colors.rejectionRed, 0.3),
  successGlow: createGlow(colors.successGreen, 0.2),
  botGlow: createGlow(colors.botBlue, 0.2),
  queueGlow: createGlow(colors.queueOrange, 0.2),
} as const;

// Box shadow utilities for glow effects
export const boxShadows = {
  xPiece: `0 0 20px ${glows.xGlow}`,
  oPiece: `0 0 20px ${glows.oGlow}`,
  rejection: `0 0 25px ${glows.rejectionGlow}`,
  success: `0 0 15px ${glows.successGlow}`,
  botIndicator: `0 0 15px ${glows.botGlow}`,
  queueStatus: `0 0 15px ${glows.queueGlow}`,
} as const;
