import { useMatchmaking } from '../hooks/useMatchmaking';

export function QuickMatch() {
  const {
    isInQueue,
    queueStatus,
    error,
    isConnecting,
    joinQueue,
    leaveQueue,
    clearError,
    formatWaitTime,
  } = useMatchmaking();

  const handleJoinQueue = () => {
    clearError();
    joinQueue();
  };

  const handleLeaveQueue = () => {
    leaveQueue();
  };

  // If not in queue, show the Quick Match button
  if (!isInQueue) {
    return (
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', marginBottom: '15px' }}>Quick Match</h3>
        <button
          onClick={handleJoinQueue}
          disabled={isConnecting}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '18px',
            backgroundColor: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={e => {
            if (!isConnecting) {
              e.currentTarget.style.backgroundColor = '#e8680f';
            }
          }}
          onMouseOut={e => {
            if (!isConnecting) {
              e.currentTarget.style.backgroundColor = '#fd7e14';
            }
          }}
        >
          {isConnecting ? 'Connecting...' : 'Find Opponent'}
        </button>
        <p
          style={{
            color: '#666',
            fontSize: '12px',
            margin: '10px 0 0 0',
            textAlign: 'center',
          }}
        >
          Get matched with a random opponent instantly!
        </p>

        {error && (
          <div
            style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '5px',
              color: '#721c24',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}
      </div>
    );
  }

  // If in queue, show the queue status
  return (
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{ color: '#333', marginBottom: '15px' }}>
        Looking for Opponent...
      </h3>

      <div
        style={{
          padding: '20px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '5px',
          marginBottom: '15px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#fd7e14',
              marginRight: '10px',
              animation: 'pulse 2s infinite',
            }}
          />
          <span style={{ color: '#856404', fontWeight: 'bold' }}>
            Searching for opponent...
          </span>
        </div>

        {queueStatus && (
          <div style={{ color: '#856404', fontSize: '14px' }}>
            <div style={{ marginBottom: '5px' }}>
              <strong>Position in queue:</strong> {queueStatus.position} of{' '}
              {queueStatus.queueSize}
            </div>
            <div style={{ marginBottom: '5px' }}>
              <strong>Waiting time:</strong>{' '}
              {formatWaitTime(queueStatus.elapsedTime)}
            </div>
            <div>
              <strong>Estimated wait:</strong>{' '}
              {formatWaitTime(queueStatus.estimatedWait)}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleLeaveQueue}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={e => {
          e.currentTarget.style.backgroundColor = '#5a6268';
        }}
        onMouseOut={e => {
          e.currentTarget.style.backgroundColor = '#6c757d';
        }}
      >
        Cancel Search
      </button>

      {error && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '5px',
            color: '#721c24',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.5;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}
