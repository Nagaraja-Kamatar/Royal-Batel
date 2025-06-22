import { useRef, useEffect, useState } from "react";
import { Html } from "@react-three/drei";
import { useAchievements } from "../../lib/stores/useAchievements";
import { useGameState } from "../../lib/stores/useGameState";

export default function TournamentProgress() {
  const { stats, achievements, getTournamentRank } = useAchievements();
  const { gamePhase } = useGameState();
  const [showProgress, setShowProgress] = useState(false);

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const rank = getTournamentRank();
  const winRate = stats.gamesPlayed > 0 ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1) : '0.0';

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Grand Champion': return '#E5E4E2';
      case 'Royal Knight': return '#FFD700';
      case 'Tournament Knight': return '#C0C0C0';
      case 'Squire': return '#CD7F32';
      case 'Apprentice': return '#8B4513';
      default: return '#696969';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Grand Champion': return '👑';
      case 'Royal Knight': return '⚔️';
      case 'Tournament Knight': return '🛡️';
      case 'Squire': return '🗡️';
      case 'Apprentice': return '🎯';
      default: return '🔰';
    }
  };

  if (gamePhase === 'playing') return null;

  return (
    <group position={[-6, 3, 0]}>
      <Html
        transform
        sprite
        style={{
          pointerEvents: 'auto',
          userSelect: 'none'
        }}
      >
        <div 
          style={{
            background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.95), rgba(40, 45, 60, 0.95))',
            border: `2px solid ${getRankColor(rank)}`,
            borderRadius: '15px',
            padding: '20px',
            minWidth: '280px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            fontFamily: 'serif',
            cursor: 'pointer'
          }}
          onClick={() => setShowProgress(!showProgress)}
        >
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '15px',
            borderBottom: `1px solid ${getRankColor(rank)}40`,
            paddingBottom: '10px'
          }}>
            <div style={{
              fontSize: '18px',
              color: getRankColor(rank),
              fontWeight: 'bold',
              marginBottom: '5px'
            }}>
              Tournament Progress
            </div>
            <div style={{
              fontSize: '14px',
              color: '#CCCCCC'
            }}>
              Click to {showProgress ? 'hide' : 'show'} details
            </div>
          </div>

          {/* Rank Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '15px',
            background: `linear-gradient(45deg, ${getRankColor(rank)}20, ${getRankColor(rank)}40)`,
            padding: '10px',
            borderRadius: '10px'
          }}>
            <span style={{ fontSize: '24px' }}>{getRankIcon(rank)}</span>
            <div>
              <div style={{ 
                color: getRankColor(rank), 
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                {rank}
              </div>
              <div style={{ 
                color: '#CCCCCC', 
                fontSize: '12px'
              }}>
                Win Rate: {winRate}%
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '8px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '18px' }}>
                {stats.gamesWon}
              </div>
              <div style={{ color: '#CCCCCC', fontSize: '12px' }}>
                Victories
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '8px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#FF9800', fontWeight: 'bold', fontSize: '18px' }}>
                {stats.longestWinStreak}
              </div>
              <div style={{ color: '#CCCCCC', fontSize: '12px' }}>
                Best Streak
              </div>
            </div>
          </div>

          {/* Achievement Count */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            padding: '10px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: showProgress ? '20px' : '0'
          }}>
            <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '16px' }}>
              🏆 {unlockedAchievements.length}/{achievements.length}
            </div>
            <div style={{ color: '#CCCCCC', fontSize: '12px' }}>
              Achievements Unlocked
            </div>
          </div>

          {/* Detailed Progress (Expandable) */}
          {showProgress && (
            <div style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '15px',
              animation: 'fadeIn 0.3s ease-in-out'
            }}>
              {/* Detailed Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginBottom: '15px',
                fontSize: '12px'
              }}>
                <div style={{ color: '#CCCCCC' }}>
                  Games Played: <span style={{ color: '#FFFFFF' }}>{stats.gamesPlayed}</span>
                </div>
                <div style={{ color: '#CCCCCC' }}>
                  Total Hits: <span style={{ color: '#FFFFFF' }}>{stats.totalHits}</span>
                </div>
                <div style={{ color: '#CCCCCC' }}>
                  Total Dodges: <span style={{ color: '#FFFFFF' }}>{stats.totalDodges}</span>
                </div>
                <div style={{ color: '#CCCCCC' }}>
                  Perfect Games: <span style={{ color: '#FFFFFF' }}>{stats.perfectGames}</span>
                </div>
                <div style={{ color: '#CCCCCC' }}>
                  Current Streak: <span style={{ color: '#FFFFFF' }}>{stats.currentWinStreak}</span>
                </div>
                <div style={{ color: '#CCCCCC' }}>
                  Comeback Wins: <span style={{ color: '#FFFFFF' }}>{stats.comebackWins}</span>
                </div>
              </div>

              {/* Recent Achievements */}
              {unlockedAchievements.length > 0 && (
                <div>
                  <div style={{
                    color: '#FFD700',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                  }}>
                    Recent Achievements:
                  </div>
                  <div style={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                    gap: '5px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {unlockedAchievements.slice(-5).reverse().map(achievement => (
                      <div key={achievement.id} style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '16px' }}>{achievement.icon}</span>
                        <div>
                          <div style={{ 
                            color: achievement.badge.color, 
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {achievement.title}
                          </div>
                          <div style={{ 
                            color: '#CCCCCC',
                            fontSize: '10px'
                          }}>
                            {achievement.badge.tier} {achievement.category}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}