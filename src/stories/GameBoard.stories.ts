import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameBoard } from '../client/components/GameBoard';
import { Board } from '../shared/types/game';

const meta = {
  title: 'Game/GameBoard',
  component: GameBoard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    canMove: {
      control: 'boolean',
      description: 'Whether the player can make a move',
    },
    yourPlayer: {
      control: 'radio',
      options: ['X', 'O', null],
      description: 'Which player this client represents',
    },
    isYourTurn: {
      control: 'boolean',
      description: "Whether it's currently the player's turn",
    },
    gameCompleted: {
      control: 'boolean',
      description: 'Whether the game has ended',
    },
  },
} satisfies Meta<typeof GameBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for different game states
const emptyBoard: Board = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

const midGameBoard: Board = [
  ['X', null, 'O'],
  [null, 'X', null],
  [null, null, null],
];

const nearEndBoard: Board = [
  ['X', 'O', 'X'],
  ['O', 'X', 'O'],
  [null, null, 'X'],
];

const completeBoard: Board = [
  ['X', 'O', 'X'],
  ['O', 'X', 'O'],
  ['X', 'O', 'X'],
];

const mockOnCellClick = (row: number, col: number) => {
  console.log(`Cell clicked: ${row}, ${col}`);
};

// Basic states - will default to Mobile 375px viewport
export const EmptyBoard: Story = {
  args: {
    board: emptyBoard,
    canMove: true,
    onCellClick: mockOnCellClick,
    yourPlayer: 'X',
    revealedCells: [],
    hitPieces: [],
    isYourTurn: true,
  },
};

export const MidGame: Story = {
  args: {
    board: midGameBoard,
    canMove: true,
    onCellClick: mockOnCellClick,
    yourPlayer: 'X',
    revealedCells: [{ row: 0, col: 2 }], // O piece revealed
    hitPieces: [],
    isYourTurn: true,
  },
};

export const OpponentTurn: Story = {
  args: {
    board: midGameBoard,
    canMove: false,
    onCellClick: mockOnCellClick,
    yourPlayer: 'X',
    revealedCells: [{ row: 0, col: 2 }],
    hitPieces: [],
    isYourTurn: false,
  },
};

export const GameCompleted: Story = {
  args: {
    board: nearEndBoard,
    canMove: false,
    onCellClick: mockOnCellClick,
    yourPlayer: 'X',
    revealedCells: [
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 2 },
    ],
    hitPieces: [],
    gameCompleted: true,
    revealBoard: completeBoard,
    winnerLineCells: [
      { row: 0, col: 2 },
      { row: 1, col: 1 },
      { row: 2, col: 0 },
    ],
  },
};

// Mobile-specific stories (320px - smallest mobile)
export const EmptyBoard_Mobile320: Story = {
  ...EmptyBoard,
  parameters: {
    viewport: { defaultViewport: 'mobile320' },
    layout: 'fullscreen',
  },
};

export const MidGame_Mobile320: Story = {
  ...MidGame,
  parameters: {
    viewport: { defaultViewport: 'mobile320' },
    layout: 'fullscreen',
  },
};

// iPhone standard size (375px)
export const EmptyBoard_iPhone: Story = {
  ...EmptyBoard,
  parameters: {
    viewport: { defaultViewport: 'mobile375' },
    layout: 'fullscreen',
  },
};

export const MidGame_iPhone: Story = {
  ...MidGame,
  parameters: {
    viewport: { defaultViewport: 'mobile375' },
    layout: 'fullscreen',
  },
};

export const GameCompleted_iPhone: Story = {
  ...GameCompleted,
  parameters: {
    viewport: { defaultViewport: 'mobile375' },
    layout: 'fullscreen',
  },
};

// Large mobile (414px)
export const EmptyBoard_LargeMobile: Story = {
  ...EmptyBoard,
  parameters: {
    viewport: { defaultViewport: 'mobile414' },
    layout: 'fullscreen',
  },
};

// Tablet comparison
export const EmptyBoard_Tablet: Story = {
  ...EmptyBoard,
  parameters: {
    viewport: { defaultViewport: 'tablet768' },
    layout: 'fullscreen',
  },
};

export const MidGame_Tablet: Story = {
  ...MidGame,
  parameters: {
    viewport: { defaultViewport: 'tablet768' },
    layout: 'fullscreen',
  },
};

// Desktop comparison
export const EmptyBoard_Desktop: Story = {
  ...EmptyBoard,
  parameters: {
    viewport: { defaultViewport: 'desktop1024' },
    layout: 'fullscreen',
  },
};

export const MidGame_Desktop: Story = {
  ...MidGame,
  parameters: {
    viewport: { defaultViewport: 'desktop1024' },
    layout: 'fullscreen',
  },
};

// Touch target testing story
export const TouchTargetTesting: Story = {
  args: {
    board: emptyBoard,
    canMove: true,
    onCellClick: mockOnCellClick,
    yourPlayer: 'X',
    revealedCells: [],
    hitPieces: [],
    isYourTurn: true,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile320' },
    layout: 'fullscreen',
  },
};
