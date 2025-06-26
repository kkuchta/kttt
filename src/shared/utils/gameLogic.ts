// Shared Game Logic for Kriegspiel Tic Tac Toe

import {
  Board,
  CellIndex,
  CellState,
  ClientGameState,
  GameResult,
  GameState,
  MoveResult,
  Player,
  Position,
} from '../types/game';

// Create an empty board
export function createEmptyBoard(): Board {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
}

// Convert position to string key for Set operations
export function positionToKey(position: Position): string {
  return `${position.row},${position.col}`;
}

// Convert string key back to position
export function keyToPosition(key: string): Position {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}

// Convert Position to CellIndex (0-8) for convenience
export function positionToCellIndex(position: Position): CellIndex {
  return (position.row * 3 + position.col) as CellIndex;
}

// Convert CellIndex back to Position
export function cellIndexToPosition(index: CellIndex): Position {
  return {
    row: Math.floor(index / 3),
    col: index % 3,
  };
}

// Check if a position is valid (within board bounds)
export function isValidPosition(position: Position): boolean {
  return (
    position.row >= 0 &&
    position.row < 3 &&
    position.col >= 0 &&
    position.col < 3
  );
}

// Get the cell state at a position
export function getCellState(board: Board, position: Position): CellState {
  if (!isValidPosition(position)) return null;
  return board[position.row][position.col];
}

// Set a cell state at a position (returns new board, immutable)
export function setCellState(
  board: Board,
  position: Position,
  state: CellState
): Board {
  if (!isValidPosition(position)) return board;

  const newBoard = board.map(row => [...row]) as Board;
  newBoard[position.row][position.col] = state;
  return newBoard;
}

// Check if a cell is empty
export function isCellEmpty(board: Board, position: Position): boolean {
  return getCellState(board, position) === null;
}

// Get the opposite player
export function getOpponentPlayer(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}

// Check for winning lines
const WINNING_LINES: Position[][] = [
  // Rows
  [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
  ],
  [
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 2 },
  ],
  [
    { row: 2, col: 0 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
  ],
  // Columns
  [
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 2, col: 0 },
  ],
  [
    { row: 0, col: 1 },
    { row: 1, col: 1 },
    { row: 2, col: 1 },
  ],
  [
    { row: 0, col: 2 },
    { row: 1, col: 2 },
    { row: 2, col: 2 },
  ],
  // Diagonals
  [
    { row: 0, col: 0 },
    { row: 1, col: 1 },
    { row: 2, col: 2 },
  ],
  [
    { row: 0, col: 2 },
    { row: 1, col: 1 },
    { row: 2, col: 0 },
  ],
];

// Check if a player has won and return the winning line
export function checkWinner(board: Board): GameResult | null {
  for (const line of WINNING_LINES) {
    const cells = line.map(pos => getCellState(board, pos));

    if (cells[0] && cells[0] === cells[1] && cells[1] === cells[2]) {
      return {
        winner: cells[0],
        winningLine: line,
      };
    }
  }

  return null;
}

// Check if the board is full (for draw detection)
export function isBoardFull(board: Board): boolean {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === null) {
        return false;
      }
    }
  }
  return true;
}

// Check if the game is over (win or draw)
export function isGameOver(board: Board): GameResult | null {
  const winResult = checkWinner(board);
  if (winResult) {
    return winResult;
  }

  if (isBoardFull(board)) {
    return { winner: null }; // Draw
  }

  return null;
}

// Validate a move according to Kriegspiel rules
export function validateMove(
  gameState: GameState,
  player: Player,
  position: Position
): MoveResult {
  // Check if game is active
  if (gameState.status !== 'active') {
    return { success: false, error: 'Game is not active' };
  }

  // Check if it's the player's turn
  if (gameState.currentTurn !== player) {
    return { success: false, error: 'Not your turn' };
  }

  // Check if position is valid
  if (!isValidPosition(position)) {
    return { success: false, error: 'Invalid position' };
  }

  // Check if cell is occupied (Kriegspiel rule)
  const cellState = getCellState(gameState.board, position);
  if (cellState !== null) {
    // Cell is occupied - move fails and reveals the piece
    return {
      success: false,
      error: 'Cell is occupied',
      revealed: position,
    };
  }

  return { success: true };
}

// Create a filtered board view for a specific player (Kriegspiel visibility)
export function createVisibleBoard(
  board: Board,
  viewerPlayer: Player | null,
  revealedCells: Set<string>
): Board {
  const visibleBoard = createEmptyBoard();

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const position = { row, col };
      const cellState = board[row][col];
      const positionKey = positionToKey(position);

      if (cellState === null) {
        // Empty cell - always visible as empty
        visibleBoard[row][col] = null;
      } else if (cellState === viewerPlayer) {
        // Player's own piece - always visible
        visibleBoard[row][col] = cellState;
      } else if (revealedCells.has(positionKey)) {
        // Opponent's piece that has been revealed - visible
        visibleBoard[row][col] = cellState;
      } else {
        // Opponent's hidden piece - appears empty
        visibleBoard[row][col] = null;
      }
    }
  }

  return visibleBoard;
}

// Convert server GameState to client-visible GameState for a specific player
export function createClientGameState(
  gameState: GameState,
  viewerPlayer: Player | null
): ClientGameState {
  const visibleBoard = createVisibleBoard(
    gameState.board,
    viewerPlayer,
    gameState.revealedCells
  );

  const revealedPositions = Array.from(gameState.revealedCells).map(
    keyToPosition
  );

  return {
    id: gameState.id,
    status: gameState.status,
    visibleBoard,
    currentTurn: gameState.currentTurn,
    yourPlayer: viewerPlayer,
    revealedCells: revealedPositions,
    canMove:
      gameState.status === 'active' &&
      gameState.currentTurn === viewerPlayer &&
      viewerPlayer !== null,
    result: gameState.result,
    botInfo: gameState.botInfo,
  };
}

// Generate a random game ID (4 characters, avoiding confusing chars)
const GAME_ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1
export function generateGameId(): string {
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += GAME_ID_CHARS.charAt(
      Math.floor(Math.random() * GAME_ID_CHARS.length)
    );
  }
  return result;
}
