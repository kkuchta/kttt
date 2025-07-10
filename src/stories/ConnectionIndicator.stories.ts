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

// Responsive variants
export const Connected_SmallMobile: Story = {
  ...Connected,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile320', isRotated: false },
  },
};

export const Connected_LargeMobile: Story = {
  ...Connected,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile414', isRotated: false },
  },
};

export const Connected_Laptop: Story = {
  ...Connected,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'desktop1024', isRotated: false },
  },
};
