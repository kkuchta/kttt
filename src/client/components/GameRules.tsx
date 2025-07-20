import { colors } from '../../shared/constants/colors';

export function GameRules() {
  return (
    <div
      style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: colors.background,
        border: `1px solid ${colors.gridLines}`,
        borderRadius: '12px',
        textAlign: 'left',
      }}
    >
      <h4
        style={{
          margin: '0 0 15px 0',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '600',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Kriegspiel Rules
      </h4>
      <div
        style={{
          color: colors.textDim,
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          lineHeight: '1.5',
        }}
      >
        <p style={{ margin: '0 0 10px 0' }}>
          • <strong style={{ color: '#ffffff' }}>Hidden Information:</strong>{' '}
          You can only see your own pieces on the board!
        </p>
        <p style={{ margin: '0' }}>
          • <strong style={{ color: '#ffffff' }}>Move Rejection:</strong> If you
          try to place on an occupied square, that opponent piece will be
          permanently revealed and you&apos;ll lose your turn.
        </p>
      </div>
    </div>
  );
}
