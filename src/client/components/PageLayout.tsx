import React from 'react';
import { colors } from '../../shared/constants/colors';

interface PageLayoutProps {
  children: React.ReactNode;
  maxWidth?: string;
  variant?: 'home' | 'game';
}

export function PageLayout({
  children,
  maxWidth = '600px',
  variant = 'home',
}: PageLayoutProps) {
  // Background gradients for different page types
  const backgroundGradients = {
    home: 'radial-gradient(circle at 20% 50%, rgba(0, 255, 231, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 94, 120, 0.05) 0%, transparent 50%)',
    game: 'radial-gradient(circle at 30% 20%, rgba(0, 255, 231, 0.03) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 94, 120, 0.03) 0%, transparent 50%)',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: colors.background,
        backgroundImage: backgroundGradients[variant],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: variant === 'home' ? 'center' : 'flex-start',
      }}
    >
      <div
        style={{
          maxWidth,
          width: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}
