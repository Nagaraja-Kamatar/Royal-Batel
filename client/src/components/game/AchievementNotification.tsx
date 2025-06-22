import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { Achievement } from "../../lib/stores/useAchievements";

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onComplete: () => void;
}

export default function AchievementNotification({ achievement, onComplete }: AchievementNotificationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      setProgress(0);
      
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onComplete, 500); // Wait for fade out
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, onComplete]);

  useFrame((state, delta) => {
    if (!groupRef.current || !visible) return;
    
    // Animate progress
    setProgress(prev => Math.min(1, prev + delta * 2));
    
    // Scale animation
    const scale = visible ? 
      1 + Math.sin(state.clock.elapsedTime * 8) * 0.05 : 
      0;
    groupRef.current.scale.setScalar(scale);
    
    // Floating animation
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
  });

  if (!achievement || !visible) return null;

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#FFFFFF';
    }
  };

  const getBadgeShape = (shape: string) => {
    switch (shape) {
      case 'shield': return '🛡️';
      case 'crown': return '👑';
      case 'sword': return '⚔️';
      case 'star': return '⭐';
      default: return '🏆';
    }
  };

  return (
    <group ref={groupRef} position={[0, 4, 0]}>
      <Html
        center
        transform
        sprite
        style={{
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        <div className="achievement-notification" style={{
          background: 'linear-gradient(145deg, rgba(20, 25, 40, 0.95), rgba(40, 45, 60, 0.95))',
          border: `3px solid ${getBadgeColor(achievement.badge.tier)}`,
          borderRadius: '15px',
          padding: '20px',
          minWidth: '300px',
          textAlign: 'center',
          boxShadow: `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${getBadgeColor(achievement.badge.tier)}40`,
          transform: `scale(${progress})`,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          fontFamily: 'serif'
        }}>
          {/* Achievement Header */}
          <div style={{
            fontSize: '16px',
            color: getBadgeColor(achievement.badge.tier),
            fontWeight: 'bold',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            Achievement Unlocked!
          </div>
          
          {/* Badge and Icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div style={{
              fontSize: '40px',
              background: `linear-gradient(45deg, ${getBadgeColor(achievement.badge.tier)}, #FFFFFF)`,
              borderRadius: '50%',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 5px 15px ${getBadgeColor(achievement.badge.tier)}50`
            }}>
              {getBadgeShape(achievement.badge.shape)}
            </div>
            <div style={{ fontSize: '30px' }}>
              {achievement.icon}
            </div>
          </div>
          
          {/* Achievement Title */}
          <div style={{
            fontSize: '20px',
            color: '#FFFFFF',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            {achievement.title}
          </div>
          
          {/* Achievement Description */}
          <div style={{
            fontSize: '14px',
            color: '#CCCCCC',
            lineHeight: '1.4',
            marginBottom: '15px'
          }}>
            {achievement.description}
          </div>
          
          {/* Category Badge */}
          <div style={{
            display: 'inline-block',
            background: `linear-gradient(45deg, ${getBadgeColor(achievement.badge.tier)}20, ${getBadgeColor(achievement.badge.tier)}40)`,
            color: getBadgeColor(achievement.badge.tier),
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            border: `1px solid ${getBadgeColor(achievement.badge.tier)}60`
          }}>
            {achievement.category} · {achievement.badge.tier}
          </div>
          
          {/* Progress Bar (if applicable) */}
          {achievement.maxProgress && (
            <div style={{
              marginTop: '15px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              height: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: `linear-gradient(90deg, ${getBadgeColor(achievement.badge.tier)}, #FFFFFF)`,
                height: '100%',
                width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%`,
                borderRadius: '10px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}