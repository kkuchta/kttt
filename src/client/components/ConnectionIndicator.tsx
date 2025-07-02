import React, { useState } from 'react';
import { colors, createGlow } from '../../shared/constants/colors';

interface ConnectionIndicatorProps {
  isConnected: boolean;
  isConnecting: boolean;
  error?: string | null;
}

export function ConnectionIndicator({
  isConnected,
  isConnecting,
  error,
}: ConnectionIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine the indicator state and styling
  const getIndicatorState = () => {
    if (isConnected) {
      return {
        color: colors.successGreen,
        text: 'Connected',
        emoji: '🟢',
        showExpanded: false,
      };
    } else if (isConnecting) {
      return {
        color: colors.queueOrange,
        text: 'Connecting...',
        emoji: '🔄',
        showExpanded: true,
      };
    } else {
      return {
        color: colors.rejectionRed,
        text: 'Connection failed',
        emoji: '🔴',
        showExpanded: true,
      };
    }
  };

  const state = getIndicatorState();
  const shouldShowExpanded = state.showExpanded || isExpanded;

  // Dot styles for the collapsed state
  const dotStyles: React.CSSProperties = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: state.color,
    boxShadow: `0 0 8px ${createGlow(state.color, 0.4)}`,
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
  };

  // Expanded styles for problem states
  const expandedStyles: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: createGlow(state.color, 0.1),
    border: `1px solid ${state.color}`,
    boxShadow: `0 0 12px ${createGlow(state.color, 0.2)}`,
    minWidth: '120px',
    textAlign: 'center',
    transition: 'all 0.2s ease-in-out',
    cursor: isConnected ? 'pointer' : 'default',
  };

  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const handleClick = () => {
    // Only allow toggling expansion for connected state
    if (isConnected && !isConnecting) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div style={containerStyles}>
      {shouldShowExpanded ? (
        <div style={expandedStyles} onClick={handleClick}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                animation: isConnecting ? 'spin 1s linear infinite' : 'none',
              }}
            >
              {state.emoji}
            </span>
            <span
              style={{
                color: state.color,
                fontSize: '12px',
                fontWeight: '500',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {state.text}
            </span>
          </div>
          {error && !isConnected && (
            <div
              style={{
                marginTop: '4px',
                color: colors.rejectionRed,
                fontSize: '10px',
                fontFamily: 'Inter, sans-serif',
                opacity: 0.8,
              }}
            >
              {error}
            </div>
          )}
        </div>
      ) : (
        <div style={dotStyles} onClick={handleClick} title="Connected" />
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
