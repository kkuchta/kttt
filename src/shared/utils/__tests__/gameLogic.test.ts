import { Board, GameState, Position } from '../../types/game';
import {
  cellIndexToPosition,
  checkWinner,
  createClientGameState,
  createEmptyBoard,
  createVisibleBoard,
  generateGameId,
  getCellState,
  getOpponentPlayer,
  isBoardFull,
  isCellEmpty,
  isGameOver,
  isValidPosition,
  keyToPosition,
  positionToCellIndex,
  positionToKey,
  setCellState,
  validateMove,
} from '../gameLogic';

describe('gameLogic', () => {
  describe('Board Creation and Basic Operations', () => {
    test('createEmptyBoard creates a 3x3 board with all null cells', () => {
      const board = createEmptyBoard();
      expect(board).toHaveLength(3);
      expect(board[0]).toHaveLength(3);
      expect(board[1]).toHaveLength(3);
      expect(board[2]).toHaveLength(3);

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          expect(board[row][col]).toBeNull();
        }
      }
    });

    test('positionToKey and keyToPosition are inverse operations', () => {
      const positions: Position[] = [
        { row: 0, col: 0 },
        { row: 1, col: 2 },
        { row: 2, col: 1 },
      ];

      for (const position of positions) {
        const key = positionToKey(position);
        const reconstructed = keyToPosition(key);
        expect(reconstructed).toEqual(position);
      }
    });

    test('positionToCellIndex and cellIndexToPosition are inverse operations', () => {
      const positions: Position[] = [
        { row: 0, col: 0 }, // index 0
        { row: 0, col: 2 }, // index 2
        { row: 1, col: 1 }, // index 4
        { row: 2, col: 2 }, // index 8
      ];

      for (const position of positions) {
        const index = positionToCellIndex(position);
        const reconstructed = cellIndexToPosition(index);
        expect(reconstructed).toEqual(position);
      }
    });

    test('positionToCellIndex calculates correct indices', () => {
      expect(positionToCellIndex({ row: 0, col: 0 })).toBe(0);
      expect(positionToCellIndex({ row: 0, col: 1 })).toBe(1);
      expect(positionToCellIndex({ row: 0, col: 2 })).toBe(2);
      expect(positionToCellIndex({ row: 1, col: 0 })).toBe(3);
      expect(positionToCellIndex({ row: 1, col: 1 })).toBe(4);
      expect(positionToCellIndex({ row: 2, col: 2 })).toBe(8);
    });
  });

  describe('Position Validation', () => {
    test('isValidPosition accepts valid positions', () => {
      const validPositions: Position[] = [
        { row: 0, col: 0 },
        { row: 0, col: 2 },
        { row: 1, col: 1 },
        { row: 2, col: 0 },
        { row: 2, col: 2 },
      ];

      for (const position of validPositions) {
        expect(isValidPosition(position)).toBe(true);
      }
    });

    test('isValidPosition rejects invalid positions', () => {
      const invalidPositions: Position[] = [
        { row: -1, col: 0 },
        { row: 0, col: -1 },
        { row: 3, col: 0 },
        { row: 0, col: 3 },
        { row: -1, col: -1 },
        { row: 3, col: 3 },
      ];

      for (const position of invalidPositions) {
        expect(isValidPosition(position)).toBe(false);
      }
    });
  });

  describe('Board State Management', () => {
    test('getCellState returns correct values', () => {
      const board: Board = [
        ['X', null, 'O'],
        [null, 'X', null],
        ['O', null, null],
      ];

      expect(getCellState(board, { row: 0, col: 0 })).toBe('X');
      expect(getCellState(board, { row: 0, col: 1 })).toBeNull();
      expect(getCellState(board, { row: 0, col: 2 })).toBe('O');
      expect(getCellState(board, { row: 1, col: 1 })).toBe('X');
    });

    test('getCellState returns null for invalid positions', () => {
      const board = createEmptyBoard();
      expect(getCellState(board, { row: -1, col: 0 })).toBeNull();
      expect(getCellState(board, { row: 3, col: 0 })).toBeNull();
    });

    test('setCellState creates new board with updated cell', () => {
      const originalBoard = createEmptyBoard();
      const newBoard = setCellState(originalBoard, { row: 1, col: 1 }, 'X');

      // Original board should be unchanged
      expect(originalBoard[1][1]).toBeNull();

      // New board should have the change
      expect(newBoard[1][1]).toBe('X');

      // Other cells should remain the same
      expect(newBoard[0][0]).toBeNull();
      expect(newBoard[2][2]).toBeNull();
    });

    test('setCellState handles invalid positions gracefully', () => {
      const board = createEmptyBoard();
      const result = setCellState(board, { row: -1, col: 0 }, 'X');
      expect(result).toEqual(board);
    });

    test('isCellEmpty correctly identifies empty cells', () => {
      const board: Board = [
        ['X', null, 'O'],
        [null, 'X', null],
        ['O', null, null],
      ];

      expect(isCellEmpty(board, { row: 0, col: 0 })).toBe(false);
      expect(isCellEmpty(board, { row: 0, col: 1 })).toBe(true);
      expect(isCellEmpty(board, { row: 1, col: 1 })).toBe(false);
      expect(isCellEmpty(board, { row: 2, col: 2 })).toBe(true);
    });
  });

  describe('Player Operations', () => {
    test('getOpponentPlayer returns correct opponent', () => {
      expect(getOpponentPlayer('X')).toBe('O');
      expect(getOpponentPlayer('O')).toBe('X');
    });
  });

  describe('Win Detection', () => {
    test('checkWinner detects horizontal wins', () => {
      const boards: Board[] = [
        // Top row
        [
          ['X', 'X', 'X'],
          [null, null, null],
          [null, null, null],
        ],
        // Middle row
        [
          [null, null, null],
          ['O', 'O', 'O'],
          [null, null, null],
        ],
        // Bottom row
        [
          [null, null, null],
          [null, null, null],
          ['X', 'X', 'X'],
        ],
      ];

      const results = boards.map(checkWinner);
      expect(results[0]?.winner).toBe('X');
      expect(results[1]?.winner).toBe('O');
      expect(results[2]?.winner).toBe('X');
    });

    test('checkWinner detects vertical wins', () => {
      const boards: Board[] = [
        // Left column
        [
          ['X', null, null],
          ['X', null, null],
          ['X', null, null],
        ],
        // Middle column
        [
          [null, 'O', null],
          [null, 'O', null],
          [null, 'O', null],
        ],
        // Right column
        [
          [null, null, 'X'],
          [null, null, 'X'],
          [null, null, 'X'],
        ],
      ];

      const results = boards.map(checkWinner);
      expect(results[0]?.winner).toBe('X');
      expect(results[1]?.winner).toBe('O');
      expect(results[2]?.winner).toBe('X');
    });

    test('checkWinner detects diagonal wins', () => {
      const boards: Board[] = [
        // Main diagonal
        [
          ['X', null, null],
          [null, 'X', null],
          [null, null, 'X'],
        ],
        // Anti-diagonal
        [
          [null, null, 'O'],
          [null, 'O', null],
          ['O', null, null],
        ],
      ];

      const results = boards.map(checkWinner);
      expect(results[0]?.winner).toBe('X');
      expect(results[1]?.winner).toBe('O');
    });

    test('checkWinner returns null for no winner', () => {
      const boards: Board[] = [
        createEmptyBoard(),
        [
          ['X', 'O', 'X'],
          ['O', 'X', 'O'],
          ['O', 'X', 'O'],
        ],
      ];

      for (const board of boards) {
        expect(checkWinner(board)).toBeNull();
      }
    });

    test('checkWinner returns winning line information', () => {
      const board: Board = [
        ['X', 'X', 'X'],
        [null, null, null],
        [null, null, null],
      ];

      const result = checkWinner(board);
      expect(result?.winningLine).toEqual([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ]);
    });
  });

  describe('Board State Checks', () => {
    test('isBoardFull detects full boards', () => {
      const fullBoard: Board = [
        ['X', 'O', 'X'],
        ['O', 'X', 'O'],
        ['O', 'X', 'O'],
      ];
      expect(isBoardFull(fullBoard)).toBe(true);
    });

    test('isBoardFull detects non-full boards', () => {
      const partialBoard: Board = [
        ['X', 'O', null],
        ['O', 'X', 'O'],
        ['O', 'X', 'O'],
      ];
      expect(isBoardFull(partialBoard)).toBe(false);
      expect(isBoardFull(createEmptyBoard())).toBe(false);
    });

    test('isGameOver detects win conditions', () => {
      const winBoard: Board = [
        ['X', 'X', 'X'],
        [null, null, null],
        [null, null, null],
      ];
      const result = isGameOver(winBoard);
      expect(result?.winner).toBe('X');
    });

    test('isGameOver detects draw conditions', () => {
      const drawBoard: Board = [
        ['X', 'O', 'X'],
        ['O', 'X', 'O'],
        ['O', 'X', 'O'],
      ];
      const result = isGameOver(drawBoard);
      expect(result?.winner).toBeNull(); // Draw
    });

    test('isGameOver returns null for ongoing games', () => {
      const ongoingBoard: Board = [
        ['X', 'O', null],
        ['O', 'X', null],
        [null, null, null],
      ];
      expect(isGameOver(ongoingBoard)).toBeNull();
    });
  });

  describe('Kriegspiel Move Validation', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = {
        id: 'TEST',
        status: 'active',
        board: createEmptyBoard(),
        currentTurn: 'X',
        players: { X: 'player1', O: 'player2' },
        revealedCells: new Set(),
        moveHistory: [],
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };
    });

    test('validateMove accepts valid moves', () => {
      const result = validateMove(gameState, 'X', { row: 1, col: 1 });
      expect(result.success).toBe(true);
    });

    test('validateMove rejects moves when game is not active', () => {
      gameState.status = 'waiting-for-players';
      const result = validateMove(gameState, 'X', { row: 1, col: 1 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Game is not active');
    });

    test('validateMove rejects moves when it is not player turn', () => {
      const result = validateMove(gameState, 'O', { row: 1, col: 1 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not your turn');
    });

    test('validateMove rejects invalid positions', () => {
      const result = validateMove(gameState, 'X', { row: -1, col: 0 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid position');
    });

    test('validateMove handles Kriegspiel occupied cell rule', () => {
      // Place an O piece first
      gameState.board = setCellState(gameState.board, { row: 1, col: 1 }, 'O');

      // X tries to move to the same spot
      const result = validateMove(gameState, 'X', { row: 1, col: 1 });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cell is occupied');
      expect(result.revealed).toEqual({ row: 1, col: 1 });
    });
  });

  describe('Kriegspiel Visibility Rules', () => {
    test('createVisibleBoard shows player own pieces', () => {
      const board: Board = [
        ['X', null, 'O'],
        [null, 'X', null],
        ['O', null, 'X'],
      ];
      const revealedCells = new Set<string>();

      const visibleToX = createVisibleBoard(board, 'X', revealedCells);
      expect(visibleToX[0][0]).toBe('X'); // Own piece visible
      expect(visibleToX[1][1]).toBe('X'); // Own piece visible
      expect(visibleToX[2][2]).toBe('X'); // Own piece visible
      expect(visibleToX[0][2]).toBeNull(); // Opponent piece hidden
      expect(visibleToX[2][0]).toBeNull(); // Opponent piece hidden
    });

    test('createVisibleBoard shows revealed opponent pieces', () => {
      const board: Board = [
        ['X', null, 'O'],
        [null, 'X', null],
        ['O', null, 'X'],
      ];
      const revealedCells = new Set(['0,2', '2,0']); // Reveal both O pieces

      const visibleToX = createVisibleBoard(board, 'X', revealedCells);
      expect(visibleToX[0][0]).toBe('X'); // Own piece
      expect(visibleToX[0][2]).toBe('O'); // Revealed opponent piece
      expect(visibleToX[2][0]).toBe('O'); // Revealed opponent piece
      expect(visibleToX[1][1]).toBe('X'); // Own piece
      expect(visibleToX[2][2]).toBe('X'); // Own piece
    });

    test('createVisibleBoard shows empty cells to all players', () => {
      const board: Board = [
        ['X', null, 'O'],
        [null, null, null],
        ['O', null, 'X'],
      ];
      const revealedCells = new Set<string>();

      const visibleToX = createVisibleBoard(board, 'X', revealedCells);
      expect(visibleToX[0][1]).toBeNull(); // Empty cell
      expect(visibleToX[1][0]).toBeNull(); // Empty cell
      expect(visibleToX[1][1]).toBeNull(); // Empty cell
      expect(visibleToX[1][2]).toBeNull(); // Empty cell
      expect(visibleToX[2][1]).toBeNull(); // Empty cell
    });
  });

  describe('Client Game State Creation', () => {
    let gameState: GameState;

    beforeEach(() => {
      gameState = {
        id: 'TEST',
        status: 'active',
        board: [
          ['X', null, 'O'],
          [null, 'X', null],
          ['O', null, 'X'],
        ],
        currentTurn: 'X',
        players: { X: 'player1', O: 'player2' },
        revealedCells: new Set(['0,2']), // O piece at (0,2) is revealed
        moveHistory: [],
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };
    });

    test('createClientGameState creates filtered state for player X', () => {
      const clientState = createClientGameState(gameState, 'X');

      expect(clientState.id).toBe('TEST');
      expect(clientState.status).toBe('active');
      expect(clientState.currentTurn).toBe('X');
      expect(clientState.yourPlayer).toBe('X');
      expect(clientState.canMove).toBe(true); // X's turn and game is active

      // Check visible board
      expect(clientState.visibleBoard[0][0]).toBe('X'); // Own piece
      expect(clientState.visibleBoard[0][2]).toBe('O'); // Revealed opponent piece
      expect(clientState.visibleBoard[2][0]).toBeNull(); // Hidden opponent piece
      expect(clientState.visibleBoard[1][1]).toBe('X'); // Own piece
    });

    test('createClientGameState creates filtered state for player O', () => {
      const clientState = createClientGameState(gameState, 'O');

      expect(clientState.yourPlayer).toBe('O');
      expect(clientState.canMove).toBe(false); // Not O's turn

      // Check visible board
      expect(clientState.visibleBoard[0][2]).toBe('O'); // Own piece
      expect(clientState.visibleBoard[2][0]).toBe('O'); // Own piece
      expect(clientState.visibleBoard[0][0]).toBeNull(); // Hidden opponent piece
      expect(clientState.visibleBoard[1][1]).toBeNull(); // Hidden opponent piece
    });

    test('createClientGameState handles null player (spectator)', () => {
      const clientState = createClientGameState(gameState, null);

      expect(clientState.yourPlayer).toBeNull();
      expect(clientState.canMove).toBe(false);

      // Should only see revealed pieces
      expect(clientState.visibleBoard[0][2]).toBe('O'); // Revealed piece
      expect(clientState.visibleBoard[0][0]).toBeNull(); // Hidden X
      expect(clientState.visibleBoard[2][0]).toBeNull(); // Hidden O
    });
  });

  describe('Game ID Generation', () => {
    test('generateGameId creates 4-character IDs', () => {
      for (let i = 0; i < 10; i++) {
        const gameId = generateGameId();
        expect(gameId).toHaveLength(4);
        expect(gameId).toMatch(/^[A-Z2-9]+$/); // Only allowed characters
      }
    });

    test('generateGameId avoids confusing characters', () => {
      const confusingChars = ['O', '0', 'I', '1'];

      for (let i = 0; i < 100; i++) {
        const gameId = generateGameId();
        for (const char of confusingChars) {
          expect(gameId).not.toContain(char);
        }
      }
    });

    test('generateGameId creates unique IDs (probabilistically)', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateGameId());
      }

      // Should be very unlikely to have duplicates with this many characters
      expect(ids.size).toBeGreaterThan(95);
    });
  });
});
