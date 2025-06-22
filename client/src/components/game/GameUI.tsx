import { useGameState } from "../../lib/stores/useGameState";
import { useAudio } from "../../lib/stores/useAudio";
import { useAchievements, Achievement } from "../../lib/stores/useAchievements";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useState } from "react";
import AchievementNotification from "./AchievementNotification";

export default function GameUI() {
  const { players, gamePhase, winner, resetGame, showMenu } = useGameState();
  const { isMuted, toggleMute, playSuccess } = useAudio();
  const { recentUnlocks, markAchievementSeen, updateStats } = useAchievements();
  const [subscribe, get] = useKeyboardControls();
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  
  useEffect(() => {
    const handleKeyPress = () => {
      const controls = get();
      if (controls.restart) {
        resetGame();
      }
      if (controls.escape) {
        showMenu();
      }
    };
    
    const unsubscribeRestart = subscribe(
      (state) => state.restart,
      (pressed) => pressed && handleKeyPress()
    );
    
    const unsubscribeEscape = subscribe(
      (state) => state.escape,
      (pressed) => pressed && handleKeyPress()
    );
    
    return () => {
      unsubscribeRestart();
      unsubscribeEscape();
    };
  }, [subscribe, get, resetGame, showMenu]);

  // Play victory sound when game ends
  useEffect(() => {
    if (gamePhase === 'ended' && winner) {
      playSuccess();
      
      // Update tournament stats on game end
      const isWinner = winner === 1 || winner === 2;
      if (isWinner) {
        updateStats({
          gamesPlayed: 1,
          gamesWon: 1,
          currentWinStreak: 1
        });
      } else {
        updateStats({
          gamesPlayed: 1,
          currentWinStreak: 0
        });
      }
    }
  }, [gamePhase, winner, playSuccess, updateStats]);

  if (gamePhase === 'menu') return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 100
    }}>
      {/* Score Display */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '40px',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        fontFamily: 'Inter, sans-serif',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '10px 20px',
        borderRadius: '10px'
      }}>
        <div style={{ color: players[1].color }}>
          {players[1].name}: {players[1].score}
        </div>
        <div style={{ color: '#ffffff' }}>vs</div>
        <div style={{ color: players[2].color }}>
          {players[2].name}: {players[2].score}
        </div>
      </div>

      {/* Controls Display */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        color: 'white',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
      }}>
        <div style={{ marginBottom: '5px' }}>
          <span style={{ color: players[1].color, fontWeight: 'bold' }}>Player 1:</span> WASD
        </div>
        <div style={{ marginBottom: '5px' }}>
          <span style={{ color: players[2].color, fontWeight: 'bold' }}>Player 2:</span> Arrow Keys
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.8 }}>
          R - Restart | ESC - Menu
        </div>
      </div>

      {/* Audio Control */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        pointerEvents: 'auto'
      }}>
        <button
          onClick={toggleMute}
          style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            border: 'none',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = 'rgba(0,0,0,0.9)';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = 'rgba(0,0,0,0.7)';
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Game Status */}
      {gamePhase === 'ended' && winner && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '48px',
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '30px',
          borderRadius: '15px',
          pointerEvents: 'auto'
        }}>
          <div style={{ color: players[winner].color, marginBottom: '20px' }}>
            {players[winner].name} Wins!
          </div>
          <div style={{ fontSize: '18px', opacity: 0.8 }}>
            Press R to restart or ESC for menu
          </div>
        </div>
      )}
    </div>
  );
}
