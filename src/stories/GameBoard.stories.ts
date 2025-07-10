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

// Mock data
const emptyBoard: Board = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

const mockOnCellClick = (row: number, col: number) => {
  console.log(`Cell clicked: ${row}, ${col}`);
};

// Primary state
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

// Responsive variants
export const EmptyBoard_SmallMobile: Story = {
  ...EmptyBoard,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile320', isRotated: false },
  },
};

export const EmptyBoard_LargeMobile: Story = {
  ...EmptyBoard,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile414', isRotated: false },
  },
};

export const EmptyBoard_Laptop: Story = {
  ...EmptyBoard,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'desktop1024', isRotated: false },
  },
};
