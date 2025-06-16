// Core Game Types for Kriegspiel Tic Tac Toe

export type Player = 'X' | 'O';

export type CellState = Player | null;

// 3x3 board represented as array of arrays
export type Board = [
  [CellState, CellState, CellState],
  [CellState, CellState, CellState],
  [CellState, CellState, CellState],
];

// Position on the board (0-indexed)
export interface Position {
  row: number;
  col: number;
}

// Alternative position representation (0-8 for convenience)
export type CellIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Move {
  player: Player;
  position: Position;
  timestamp: number;
}

export type GameStatus =
  | 'waiting-for-players' // Less than 2 players
  | 'active' // Game in progress
  | 'completed' // Game finished (win or draw)
  | 'abandoned'; // Players disconnected

export interface GameResult {
  winner: Player | null; // null = draw
  winningLine?: Position[]; // For displaying winning line
}

// Server-side complete game state
export interface GameState {
  id: string;
  status: GameStatus;
  board: Board;
  currentTurn: Player;
  players: {
    X: string | null; // Socket ID of player X
    O: string | null; // Socket ID of player O
  };
  revealedCells: Set<string>; // Positions revealed due to conflicts (as "row,col")
  moveHistory: Move[];
  result?: GameResult;
  createdAt: number;
  lastActivity: number;
}

// Client-side filtered view of game state
export interface ClientGameState {
  id: string;
  status: GameStatus;
  visibleBoard: Board; // Board with hidden opponent pieces
  currentTurn: Player;
  yourPlayer: Player | null; // Which player this client is
  revealedCells: Position[]; // Cells revealed due to conflicts
  canMove: boolean; // Whether this client can make a move
  result?: GameResult;
}

// Utility type for move validation results
export interface MoveResult {
  success: boolean;
  error?: string;
  revealed?: Position; // If move failed due to occupied cell
}
