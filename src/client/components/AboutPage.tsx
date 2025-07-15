import { Link } from 'react-router-dom';
import {
  colors,
  createGlow,
  getHoverColor,
} from '../../shared/constants/colors';
import { PageLayout } from './PageLayout';

export function AboutPage() {
  return (
    <PageLayout variant="home" maxWidth="700px">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          backgroundColor: colors.background,
          border: `2px solid ${colors.gridLines}`,
          padding: '20px 20px', // Reduced horizontal padding for small screens
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '28px',
              fontWeight: '700',
              fontFamily: 'Inter, sans-serif',
              textShadow: '0 0 15px rgba(255, 255, 255, 0.1)',
            }}
          >
            About
          </h1>
          <p
            style={{
              margin: '8px 0 0 0',
              color: colors.textDim,
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Kriegspiel Tic Tac Toe
          </p>
        </div>
        <Link
          to="/"
          style={{
            padding: '10px 18px',
            backgroundColor: colors.textDim,
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            fontFamily: 'Inter, sans-serif',
            border: `1px solid ${colors.textDim}`,
            transition: 'all 0.2s ease-in-out',
            whiteSpace: 'nowrap', // Prevent text wrapping
          }}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.color = colors.background;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = colors.textDim;
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← Home
        </Link>
      </div>

      {/* Main Content */}
      <div
        style={{
          backgroundColor: colors.background,
          border: `2px solid ${colors.gridLines}`,
          borderRadius: '15px',
          padding: '40px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
          marginBottom: '40px',
        }}
      >
        {/* Inspiration */}
        <section style={{ marginBottom: '40px' }}>
          <h2
            style={{
              color: colors.xAccent,
              fontSize: '24px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '20px',
              textShadow: `0 0 15px ${createGlow(colors.xAccent, 0.3)}`,
            }}
          >
            What is this?
          </h2>
          <p
            style={{
              color: '#ffffff',
              fontSize: '18px',
              lineHeight: '1.6',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '20px',
            }}
          >
            Kriegspiel Tic Tac Toe was inspired by{' '}
            <a
              href="https://twitter.com/ZachWeiner/status/1755205085947109517"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: colors.xAccent,
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.2s ease-in-out',
              }}
              onMouseOver={e => {
                e.currentTarget.style.color = getHoverColor(colors.xAccent);
                e.currentTarget.style.textShadow = `0 0 10px ${createGlow(colors.xAccent, 0.4)}`;
              }}
              onMouseOut={e => {
                e.currentTarget.style.color = colors.xAccent;
                e.currentTarget.style.textShadow = 'none';
              }}
            >
              this Zach Wienersmith post
            </a>
            : it&apos;s a Tic Tac Toe variant where you can&apos;t see your
            opponent&apos;s moves and you lose your turn if you take a spot
            they&apos;ve already taken.
          </p>
        </section>

        {/* Development Process */}
        <section style={{ marginBottom: '40px' }}>
          <h2
            style={{
              color: colors.oAccent,
              fontSize: '24px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '20px',
              textShadow: `0 0 15px ${createGlow(colors.oAccent, 0.3)}`,
            }}
          >
            How&apos;d it get built?
          </h2>
          <p
            style={{
              color: '#ffffff',
              fontSize: '18px',
              lineHeight: '1.6',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '20px',
            }}
          >
            I built this partially because it&apos;s been on my &quot;fun
            projects&quot; list for a while and partially because I wanted an
            excuse to try out some AI-driven coding techniques.
          </p>
          <p
            style={{
              color: '#ffffff',
              fontSize: '18px',
              lineHeight: '1.6',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '20px',
            }}
          >
            As an exercise to force myself to practice those techniques, this
            project was fully vibe-coded: didn&apos;t write <em>or read</em> a
            single line of code for it. I tried out some context-engineering
            strategies I&apos;ve seen people talk about and got better at
            getting Cursor + Claude to do what I want.
          </p>
        </section>

        {/* Links */}
        <section>
          <h2
            style={{
              color: colors.successGreen,
              fontSize: '24px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '20px',
              textShadow: `0 0 15px ${createGlow(colors.successGreen, 0.3)}`,
            }}
          >
            More Information
          </h2>
          <div
            style={{
              display: 'grid',
              gap: '20px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            }}
          >
            <div
              style={{
                backgroundColor: createGlow(colors.gridLines, 0.1),
                border: `2px solid ${colors.gridLines}`,
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <h3
                style={{
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  margin: '0 0 12px 0',
                }}
              >
                Source Code
              </h3>
              <p
                style={{
                  color: colors.textDim,
                  fontSize: '16px',
                  lineHeight: '1.5',
                  fontFamily: 'Inter, sans-serif',
                  margin: '0 0 15px 0',
                }}
              >
                View the complete source code and project structure on GitHub.
              </p>
              <a
                href="https://github.com/kkuchta/kttt"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: colors.successGreen,
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '16px',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.color = getHoverColor(
                    colors.successGreen
                  );
                  e.currentTarget.style.textShadow = `0 0 10px ${createGlow(colors.successGreen, 0.4)}`;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.color = colors.successGreen;
                  e.currentTarget.style.textShadow = 'none';
                }}
              >
                View on GitHub →
              </a>
            </div>

            <div
              style={{
                backgroundColor: createGlow(colors.gridLines, 0.1),
                border: `2px solid ${colors.gridLines}`,
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <h3
                style={{
                  color: '#ffffff',
                  fontSize: '18px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  margin: '0 0 12px 0',
                }}
              >
                Development Writeup
              </h3>
              <p
                style={{
                  color: colors.textDim,
                  fontSize: '16px',
                  lineHeight: '1.5',
                  fontFamily: 'Inter, sans-serif',
                  margin: '0 0 15px 0',
                }}
              >
                Read about the AI-driven development process and lessons
                learned.
              </p>
              <a
                href="https://kevinhighwater.com/2025/07/kriegspiel-tic-tac-toe"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: colors.botBlue,
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '16px',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.color = getHoverColor(colors.botBlue);
                  e.currentTarget.style.textShadow = `0 0 10px ${createGlow(colors.botBlue, 0.4)}`;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.color = colors.botBlue;
                  e.currentTarget.style.textShadow = 'none';
                }}
              >
                Read the writeup →
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Navigation */}
      <div
        style={{
          textAlign: 'center',
          padding: '20px 0',
          borderTop: `1px solid ${colors.gridLines}`,
          marginTop: '20px',
        }}
      >
        <Link
          to="/"
          style={{
            color: colors.textDim,
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500',
            fontFamily: 'Inter, sans-serif',
            padding: '12px 24px',
            border: `2px solid ${colors.successGreen}`,
            borderRadius: '10px',
            backgroundColor: 'transparent',
            transition: 'all 0.2s ease-in-out',
            display: 'inline-block',
          }}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = colors.successGreen;
            e.currentTarget.style.color = colors.background;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 0 20px ${createGlow(colors.successGreen, 0.3)}`;
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = colors.textDim;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Start Playing
        </Link>
      </div>
    </PageLayout>
  );
}
