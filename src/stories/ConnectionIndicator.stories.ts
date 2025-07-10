import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectionIndicator } from '../client/components/ConnectionIndicator';

const meta = {
  title: 'Components/ConnectionIndicator',
  component: ConnectionIndicator,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    isConnected: {
      control: 'boolean',
      description: 'Whether the connection is established',
    },
    isConnecting: {
      control: 'boolean',
      description: 'Whether currently trying to connect',
    },
    error: {
      control: 'text',
      description: 'Error message to display when connection fails',
    },
  },
} satisfies Meta<typeof ConnectionIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connected: Story = {
  args: {
    isConnected: true,
    isConnecting: false,
    error: null,
  },
};

export const Connecting: Story = {
  args: {
    isConnected: false,
    isConnecting: true,
    error: null,
  },
};

export const ConnectionFailed: Story = {
  args: {
    isConnected: false,
    isConnecting: false,
    error: 'WebSocket connection failed',
  },
};

export const ConnectionFailedWithLongError: Story = {
  args: {
    isConnected: false,
    isConnecting: false,
    error:
      'Connection timeout - please check your internet connection and try again',
  },
};

// Mobile-specific responsive stories
export const Connected_Mobile320: Story = {
  ...Connected,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile320', isRotated: false },
  },
};

export const ConnectionFailed_Mobile320: Story = {
  ...ConnectionFailed,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile320', isRotated: false },
  },
};

export const Connected_iPhone: Story = {
  ...Connected,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile375', isRotated: false },
  },
};

export const ConnectionFailed_iPhone: Story = {
  ...ConnectionFailed,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile375', isRotated: false },
  },
};
