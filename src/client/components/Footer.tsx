import React from 'react';
import { colors } from '../../shared/constants/colors';

interface FooterProps {
  primaryAction?: React.ReactNode;
  layoutType?: 'horizontal' | 'vertical';
}

export function Footer({
  primaryAction,
  layoutType = 'horizontal',
}: FooterProps) {
  const creatorLink = (
    <a
      href="https://kevinhighwater.com/"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: colors.textDim,
        textDecoration: 'none',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        transition: 'color 0.2s ease-in-out',
      }}
      onMouseOver={e => {
        e.currentTarget.style.color = '#ffffff';
      }}
      onMouseOut={e => {
        e.currentTarget.style.color = colors.textDim;
      }}
    >
      Created by Kevin Highwater
    </a>
  );

  const blueskyLink = (
    <a
      href="https://bsky.app/profile/kevinkuchta.com"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: colors.textDim,
        textDecoration: 'none',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        transition: 'color 0.2s ease-in-out',
      }}
      onMouseOver={e => {
        e.currentTarget.style.color = '#ffffff';
      }}
      onMouseOut={e => {
        e.currentTarget.style.color = colors.textDim;
      }}
    >
      @kevinkuchta.com
    </a>
  );

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '30px 20px 20px 20px',
        borderTop: `1px solid ${colors.gridLines}`,
        marginTop: '40px',
      }}
    >
      {layoutType === 'horizontal' && primaryAction ? (
        // Horizontal layout: "About • Created by Kevin Highwater • @kevinkuchta.com"
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          {primaryAction}
          <span style={{ color: colors.gridLines, fontSize: '14px' }}>•</span>
          {creatorLink}
          <span style={{ color: colors.gridLines, fontSize: '14px' }}>•</span>
          {blueskyLink}
        </div>
      ) : (
        // Vertical layout: Button above, creator links below
        <>
          {primaryAction && (
            <div style={{ marginBottom: '20px' }}>{primaryAction}</div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              alignItems: 'center',
            }}
          >
            {creatorLink}
            <span style={{ color: colors.gridLines, fontSize: '14px' }}>•</span>
            {blueskyLink}
          </div>
        </>
      )}
    </div>
  );
}
