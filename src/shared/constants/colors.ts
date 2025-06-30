// Design Color Palette
export const colors = {
  // Core theme colors
  background: '#0e0e0e',
  gridLines: '#1a1a1a',
  textDim: '#888888',

  // Player accent colors
  xAccent: '#00ffe7', // Teal
  oAccent: '#ff5e78', // Coral

  // Feedback colors
  rejectionRed: '#ff3c3c', // Primary - Move rejection flash
  successGreen: '#00ff99', // Move accepted confirmation
  winningLine: '#ffd700', // Golden yellow for winning line highlight

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

// Utility function to calculate contrast ratio for accessibility testing
export const getContrastRatio = (color1: string, color2: string): number => {
  const getRGB = (color: string) => {
    const hex = color.replace('#', '');
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16),
    };
  };

  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const rgb1 = getRGB(color1);
  const rgb2 = getRGB(color2);
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

// Test contrast ratios against WCAG standards
export const contrastTests = {
  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  wcagAA: 4.5,
  wcagAALarge: 3.0,

  // Test our key color combinations
  results: {
    whiteOnBackground: getContrastRatio('#ffffff', colors.background), // Should be ~15:1
    dimTextOnBackground: getContrastRatio(colors.textDim, colors.background), // Check this
    xAccentOnBackground: getContrastRatio(colors.xAccent, colors.background),
    oAccentOnBackground: getContrastRatio(colors.oAccent, colors.background),
    successOnBackground: getContrastRatio(
      colors.successGreen,
      colors.background
    ),
    rejectionOnBackground: getContrastRatio(
      colors.rejectionRed,
      colors.background
    ),
    winningLineOnBackground: getContrastRatio(
      colors.winningLine,
      colors.background
    ),
    botBlueOnBackground: getContrastRatio(colors.botBlue, colors.background),
  },
};

// Pre-computed glow colors for common use cases
export const glows = {
  xGlow: createGlow(colors.xAccent, 0.2),
  oGlow: createGlow(colors.oAccent, 0.2),
  rejectionGlow: createGlow(colors.rejectionRed, 0.3),
  successGlow: createGlow(colors.successGreen, 0.2),
  winningLineGlow: createGlow(colors.winningLine, 0.4),
  botGlow: createGlow(colors.botBlue, 0.2),
  queueGlow: createGlow(colors.queueOrange, 0.2),
} as const;

// Box shadow utilities for glow effects
export const boxShadows = {
  xPiece: `0 0 20px ${glows.xGlow}`,
  oPiece: `0 0 20px ${glows.oGlow}`,
  rejection: `0 0 25px ${glows.rejectionGlow}`,
  success: `0 0 15px ${glows.successGlow}`,
  winningLine: `0 0 30px ${glows.winningLineGlow}`,
  botIndicator: `0 0 15px ${glows.botGlow}`,
  queueStatus: `0 0 15px ${glows.queueGlow}`,
} as const;
