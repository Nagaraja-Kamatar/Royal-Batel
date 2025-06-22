import { useGameState } from "../../lib/stores/useGameState";
import { useAudio } from "../../lib/stores/useAudio";

export default function Menu() {
  const { startGame } = useGameState();
  const { toggleMute, isMuted } = useAudio();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Title */}
      <div style={{
        fontSize: '72px',
        fontWeight: 'bold',
        marginBottom: '20px',
        textShadow: '4px 4px 8px rgba(0,0,0,0.5)',
        background: 'linear-gradient(45deg, #4caf50, #f44336)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        CURSOR CLASH
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: '24px',
        marginBottom: '50px',
        opacity: 0.8
      }}>
        Arena Battle
      </div>

      {/* Game Description */}
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
        fontSize: '18px',
        lineHeight: '1.6',
        marginBottom: '40px',
        opacity: 0.9
      }}>
        <p>Two players enter the arena, only one can dominate!</p>
        <p>Collide with your opponent to score points. First to 5 wins!</p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '60px',
        marginBottom: '50px',
        fontSize: '16px'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          borderRadius: '10px',
          border: '2px solid #4caf50'
        }}>
          <div style={{ color: '#4caf50', fontWeight: 'bold', marginBottom: '10px' }}>
            Player 1
          </div>
          <div>W A S D</div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '5px' }}>
            Move
          </div>
        </div>
        
        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: 'rgba(244, 67, 54, 0.2)',
          borderRadius: '10px',
          border: '2px solid #f44336'
        }}>
          <div style={{ color: '#f44336', fontWeight: 'bold', marginBottom: '10px' }}>
            Player 2
          </div>
          <div>↑ ← ↓ →</div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '5px' }}>
            Move
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
      }}>
        <button
          onClick={startGame}
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            padding: '15px 30px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#45a049';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4caf50';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          START GAME
        </button>

        <button
          onClick={toggleMute}
          style={{
            fontSize: '16px',
            padding: '10px 20px',
            backgroundColor: isMuted ? '#f44336' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        fontSize: '14px',
        opacity: 0.6
      }}>
        Push your opponent around the arena to score points!
      </div>
    </div>
  );
}
