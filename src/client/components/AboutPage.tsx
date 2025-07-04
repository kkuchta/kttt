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
          padding: '20px 25px',
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
            padding: '12px 20px',
            backgroundColor: colors.textDim,
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            fontFamily: 'Inter, sans-serif',
            border: `2px solid ${colors.textDim}`,
            transition: 'all 0.2s ease-in-out',
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
        {/* Game Description */}
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
            What is Kriegspiel Tic Tac Toe?
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
            Kriegspiel Tic Tac Toe is a <strong>hidden information</strong>{' '}
            variant of the classic game. Unlike regular tic-tac-toe, you
            can&apos;t see your opponent&apos;s moves until you accidentally try
            to place a piece on one of their squares!
          </p>
          <p
            style={{
              color: colors.textDim,
              fontSize: '16px',
              lineHeight: '1.6',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '20px',
            }}
          >
            This creates a fascinating game of deduction and risk management.
            Every move rejection gives you valuable information, but costs you a
            turn. Do you play it safe with corner strategies, or boldly probe
            the center?
          </p>
          <div
            style={{
              backgroundColor: createGlow(colors.oAccent, 0.05),
              border: `2px solid ${colors.oAccent}`,
              borderRadius: '12px',
              padding: '20px',
              marginTop: '25px',
            }}
          >
            <h3
              style={{
                color: colors.oAccent,
                fontSize: '18px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                margin: '0 0 15px 0',
              }}
            >
              💡 The Strategic Twist
            </h3>
            <p
              style={{
                color: '#ffffff',
                fontSize: '16px',
                lineHeight: '1.5',
                fontFamily: 'Inter, sans-serif',
                margin: 0,
              }}
            >
              Move rejection becomes your primary source of information. Each
              &quot;failed&quot; move reveals an opponent piece and teaches you
              about their strategy, but at the cost of giving them an extra
              turn.
            </p>
          </div>
        </section>

        {/* Features */}
        <section style={{ marginBottom: '40px' }}>
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
            Features
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
                🔗 Instant Multiplayer
              </h3>
              <p
                style={{
                  color: colors.textDim,
                  fontSize: '16px',
                  lineHeight: '1.5',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0,
                }}
              >
                Create games and share URLs instantly. No accounts, no setup -
                just share and play.
              </p>
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
                Quick Match
              </h3>
              <p
                style={{
                  color: colors.textDim,
                  fontSize: '16px',
                  lineHeight: '1.5',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0,
                }}
              >
                Jump into a game with a random opponent, or practice against the
                bot while you wait.
              </p>
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
                Dramatic Reveals
              </h3>
              <p
                style={{
                  color: colors.textDim,
                  fontSize: '16px',
                  lineHeight: '1.5',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0,
                }}
              >
                When the game ends, watch as all hidden pieces are revealed in a
                satisfying animation.
              </p>
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
                📱 Mobile Ready
              </h3>
              <p
                style={{
                  color: colors.textDim,
                  fontSize: '16px',
                  lineHeight: '1.5',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0,
                }}
              >
                Fully responsive design optimized for touch devices and mobile
                gameplay.
              </p>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section style={{ marginBottom: '40px' }}>
          <h2
            style={{
              color: colors.botBlue,
              fontSize: '24px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '20px',
              textShadow: `0 0 15px ${createGlow(colors.botBlue, 0.3)}`,
            }}
          >
            🛠️ Built With
          </h2>
          <div
            style={{
              backgroundColor: createGlow(colors.botBlue, 0.05),
              border: `2px solid ${colors.botBlue}`,
              borderRadius: '12px',
              padding: '25px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gap: '15px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              }}
            >
              <div>
                <h3
                  style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    fontFamily: 'Space Grotesk, monospace',
                    margin: '0 0 8px 0',
                  }}
                >
                  Frontend
                </h3>
                <p
                  style={{
                    color: colors.textDim,
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    margin: 0,
                    lineHeight: '1.4',
                  }}
                >
                  React • TypeScript • Vite
                </p>
              </div>
              <div>
                <h3
                  style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    fontFamily: 'Space Grotesk, monospace',
                    margin: '0 0 8px 0',
                  }}
                >
                  Backend
                </h3>
                <p
                  style={{
                    color: colors.textDim,
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    margin: 0,
                    lineHeight: '1.4',
                  }}
                >
                  Node.js • Express • Socket.io
                </p>
              </div>
              <div>
                <h3
                  style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    fontFamily: 'Space Grotesk, monospace',
                    margin: '0 0 8px 0',
                  }}
                >
                  Real-time
                </h3>
                <p
                  style={{
                    color: colors.textDim,
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    margin: 0,
                    lineHeight: '1.4',
                  }}
                >
                  WebSockets • Redis Storage
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Creator */}
        <section>
          <h2
            style={{
              color: colors.queueOrange,
              fontSize: '24px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              marginBottom: '20px',
              textShadow: `0 0 15px ${createGlow(colors.queueOrange, 0.3)}`,
            }}
          >
            👨‍💻 About the Developer
          </h2>
          <div
            style={{
              backgroundColor: createGlow(colors.queueOrange, 0.05),
              border: `2px solid ${colors.queueOrange}`,
              borderRadius: '12px',
              padding: '25px',
            }}
          >
            <p
              style={{
                color: '#ffffff',
                fontSize: '18px',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '20px',
              }}
            >
              This game was built as an exploration of{' '}
              <strong>hidden information mechanics</strong> in classic games.
              The original Kriegspiel chess inspired the idea - what happens
              when you remove perfect information from familiar games?
            </p>
            <p
              style={{
                color: colors.textDim,
                fontSize: '16px',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '20px',
              }}
            >
              The result is a surprisingly deep variant that transforms simple
              tic-tac-toe into a game of deduction, psychology, and calculated
              risk-taking.
            </p>
            <p
              style={{
                color: '#ffffff',
                fontSize: '16px',
                lineHeight: '1.6',
                fontFamily: 'Inter, sans-serif',
                margin: 0,
              }}
            >
              Created by{' '}
              <a
                href="https://kevinhighwater.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: colors.queueOrange,
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.color = getHoverColor(
                    colors.queueOrange
                  );
                  e.currentTarget.style.textShadow = `0 0 10px ${createGlow(colors.queueOrange, 0.4)}`;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.color = colors.queueOrange;
                  e.currentTarget.style.textShadow = 'none';
                }}
              >
                Kevin Highwater
              </a>
              , a generalist software engineer building serious tools and silly
              hacks.
            </p>
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
