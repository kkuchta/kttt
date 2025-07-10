import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { colors, createGlow, getHoverColor } from '../shared/constants/colors';

// Simplified HomePage mock that shows different UI states without hooks
function MockHomePage({
  connectionState = 'connected',
  queueState = 'idle',
  error = null,
}: {
  connectionState?: 'connected' | 'connecting' | 'error';
  queueState?: 'idle' | 'inQueue' | 'error';
  error?: string | null;
}) {
  return (
    <BrowserRouter>
      <div
        style={{
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: colors.background,
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(0, 255, 231, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 94, 120, 0.05) 0%, transparent 50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ maxWidth: '600px', width: '100%' }}>
          {/* Connection Indicator */}
          <div
            style={{
              position: 'fixed',
              top: '16px',
              right: '16px',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {connectionState === 'connected' ? (
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: colors.successGreen,
                  boxShadow: `0 0 8px ${createGlow(colors.successGreen, 0.4)}`,
                }}
                title="Connected"
              />
            ) : connectionState === 'connecting' ? (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: createGlow(colors.queueOrange, 0.1),
                  border: `1px solid ${colors.queueOrange}`,
                  color: colors.queueOrange,
                  fontSize: '12px',
                  fontWeight: '500',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Connecting...
              </div>
            ) : (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: createGlow(colors.rejectionRed, 0.1),
                  border: `1px solid ${colors.rejectionRed}`,
                  color: colors.rejectionRed,
                  fontSize: '12px',
                  fontWeight: '500',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Connection failed
                {error && (
                  <div
                    style={{ marginTop: '4px', fontSize: '10px', opacity: 0.8 }}
                  >
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hero Section */}
          <div
            style={{
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto',
              padding: '40px 20px',
              position: 'relative',
            }}
          >
            {/* Background gradient */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(600px circle at center, rgba(0, 255, 231, 0.03), transparent 70%)`,
                borderRadius: '20px',
                zIndex: 0,
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1
                style={{
                  color: '#ffffff',
                  marginBottom: '15px',
                  fontSize: '36px',
                  fontWeight: '700',
                  fontFamily: 'Inter, sans-serif',
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
                }}
              >
                Kriegspiel Tic Tac Toe
              </h1>

              <p
                style={{
                  color: colors.textDim,
                  marginBottom: '40px',
                  fontSize: '18px',
                  lineHeight: '1.6',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Hidden information tic-tac-toe where you can&apos;t see your
                opponent&apos;s moves until you try to place on their squares!
              </p>

              {/* Three Primary Actions */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  maxWidth: '400px',
                  margin: '0 auto',
                }}
              >
                {/* Create Game */}
                <div>
                  <h3
                    style={{
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                      margin: '0 0 15px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    Start New Game
                  </h3>
                  <button
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                      backgroundColor: colors.successGreen,
                      color: colors.background,
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: `0 0 20px ${createGlow(colors.successGreen, 0.3)}`,
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.backgroundColor = getHoverColor(
                        colors.successGreen
                      );
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.backgroundColor =
                        colors.successGreen;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Create Game & Share Link
                  </button>
                </div>

                {/* Quick Match */}
                <div>
                  <h3
                    style={{
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                      margin: '0 0 15px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    Quick Match
                  </h3>

                  {queueState === 'inQueue' ? (
                    <div
                      style={{
                        padding: '20px',
                        backgroundColor: createGlow(colors.queueOrange, 0.1),
                        border: `2px solid ${colors.queueOrange}`,
                        borderRadius: '12px',
                        boxShadow: `0 0 20px ${createGlow(colors.queueOrange, 0.2)}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '15px',
                        }}
                      >
                        <div
                          style={{
                            color: colors.queueOrange,
                            fontSize: '16px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          Looking for opponent...
                        </div>
                      </div>
                      <div
                        style={{
                          color: colors.textDim,
                          fontSize: '14px',
                          fontFamily: 'Inter, sans-serif',
                          textAlign: 'center',
                        }}
                      >
                        1 player in queue • 15s elapsed
                      </div>
                      <div
                        style={{
                          marginTop: '15px',
                          display: 'flex',
                          gap: '10px',
                        }}
                      >
                        <button
                          style={{
                            flex: 1,
                            padding: '15px 20px',
                            fontSize: '16px',
                            fontWeight: '600',
                            fontFamily: 'Inter, sans-serif',
                            backgroundColor: colors.botBlue,
                            color: '#ffffff',
                            border: `2px solid ${colors.botBlue}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: `0 0 12px ${createGlow(colors.botBlue, 0.2)}`,
                          }}
                        >
                          Play vs Bot Instead
                        </button>
                        <button
                          style={{
                            flex: 1,
                            padding: '12px 20px',
                            fontSize: '14px',
                            fontWeight: '500',
                            fontFamily: 'Inter, sans-serif',
                            backgroundColor: 'transparent',
                            color: colors.textDim,
                            border: `2px solid ${colors.textDim}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button
                        style={{
                          width: '100%',
                          padding: '18px 24px',
                          fontSize: '18px',
                          fontWeight: '600',
                          fontFamily: 'Inter, sans-serif',
                          backgroundColor: colors.queueOrange,
                          color: '#ffffff',
                          border: `2px solid ${colors.queueOrange}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          boxShadow: `0 0 15px ${createGlow(colors.queueOrange, 0.2)}`,
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.backgroundColor = getHoverColor(
                            colors.queueOrange
                          );
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.backgroundColor =
                            colors.queueOrange;
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Find Opponent Now
                      </button>
                      <p
                        style={{
                          color: colors.textDim,
                          fontSize: '14px',
                          margin: '12px 0 0 0',
                          textAlign: 'center',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        Get matched with a random opponent instantly!
                      </p>
                    </div>
                  )}

                  {queueState === 'error' && (
                    <div
                      style={{
                        marginTop: '15px',
                        padding: '15px',
                        backgroundColor: createGlow(colors.rejectionRed, 0.1),
                        border: `2px solid ${colors.rejectionRed}`,
                        borderRadius: '8px',
                        color: colors.rejectionRed,
                        fontSize: '14px',
                        fontFamily: 'Inter, sans-serif',
                        boxShadow: `0 0 15px ${createGlow(colors.rejectionRed, 0.1)}`,
                      }}
                    >
                      <strong>Warning:</strong> Failed to join matchmaking queue
                      - server is busy
                    </div>
                  )}
                </div>

                {/* Join Game */}
                <div>
                  <h3
                    style={{
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                      margin: '0 0 15px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    Join Game
                  </h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Enter 4-character game ID"
                      style={{
                        flex: 1,
                        padding: '16px',
                        fontSize: '16px',
                        fontFamily: 'Inter, sans-serif',
                        backgroundColor: colors.cellDepth,
                        color: '#ffffff',
                        border: `2px solid ${colors.gridLines}`,
                        borderRadius: '8px',
                        transition: 'border-color 0.2s ease-in-out',
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = colors.xAccent;
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = colors.gridLines;
                      }}
                    />
                    <button
                      style={{
                        padding: '16px 20px',
                        fontSize: '16px',
                        fontWeight: '600',
                        fontFamily: 'Inter, sans-serif',
                        backgroundColor: colors.botBlue,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: `0 0 12px ${createGlow(colors.botBlue, 0.2)}`,
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.backgroundColor = getHoverColor(
                          colors.botBlue
                        );
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.backgroundColor = colors.botBlue;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

const meta = {
  title: 'Pages/HomePage',
  component: MockHomePage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    connectionState: {
      control: 'radio',
      options: ['connected', 'connecting', 'error'],
      description: 'Connection state of the app',
    },
    queueState: {
      control: 'radio',
      options: ['idle', 'inQueue', 'error'],
      description: 'Matchmaking queue state',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
  },
} satisfies Meta<typeof MockHomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic states
export const Default: Story = {
  args: {
    connectionState: 'connected',
    queueState: 'idle',
    error: null,
  },
};

export const Connecting: Story = {
  args: {
    connectionState: 'connecting',
    queueState: 'idle',
    error: null,
  },
};

export const ConnectionError: Story = {
  args: {
    connectionState: 'error',
    queueState: 'idle',
    error: 'WebSocket connection failed',
  },
};

export const InMatchmakingQueue: Story = {
  args: {
    connectionState: 'connected',
    queueState: 'inQueue',
    error: null,
  },
};

export const MatchmakingError: Story = {
  args: {
    connectionState: 'connected',
    queueState: 'error',
    error: null,
  },
};

// Mobile viewport stories
export const Default_Mobile320: Story = {
  ...Default,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile320', isRotated: false },
  },
};

export const Default_iPhone: Story = {
  ...Default,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile375', isRotated: false },
  },
};

export const Connecting_iPhone: Story = {
  ...Connecting,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile375', isRotated: false },
  },
};

export const ConnectionError_iPhone: Story = {
  ...ConnectionError,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile375', isRotated: false },
  },
};

export const InMatchmakingQueue_iPhone: Story = {
  ...InMatchmakingQueue,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile375', isRotated: false },
  },
};

export const MatchmakingError_iPhone: Story = {
  ...MatchmakingError,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile375', isRotated: false },
  },
};

// Large mobile stories
export const Default_LargeMobile: Story = {
  ...Default,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile414', isRotated: false },
  },
};

export const InMatchmakingQueue_LargeMobile: Story = {
  ...InMatchmakingQueue,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'mobile414', isRotated: false },
  },
};

// Tablet stories
export const Default_Tablet: Story = {
  ...Default,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'tablet768', isRotated: false },
  },
};

export const InMatchmakingQueue_Tablet: Story = {
  ...InMatchmakingQueue,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'tablet768', isRotated: false },
  },
};

// Desktop stories
export const Default_Desktop: Story = {
  ...Default,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'desktop1024', isRotated: false },
  },
};

export const InMatchmakingQueue_Desktop: Story = {
  ...InMatchmakingQueue,
  parameters: {
    layout: 'fullscreen',
  },
  globals: {
    viewport: { value: 'desktop1024', isRotated: false },
  },
};
