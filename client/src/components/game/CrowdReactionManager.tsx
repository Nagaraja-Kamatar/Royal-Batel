import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";

interface CrowdReactionManagerProps {
  onReactionTrigger: (reaction: {
    type: 'cheer' | 'gasp' | 'wave' | 'stomp';
    intensity: number;
    duration: number;
    crowdSections: string[];
  }) => void;
}

export default function CrowdReactionManager({ onReactionTrigger }: CrowdReactionManagerProps) {
  const { gamePhase, players, lastCollision } = useGameState();
  
  const reactionState = useRef({
    lastScore: { p1: 0, p2: 0 },
    lastCollisionTime: 0,
    consecutiveHits: 0,
    gameStartTime: 0,
    reactionCooldown: 0
  });

  const crowdSections = [
    'north-main', 'east-main', 'west-main', 'south-main',
    'northeast', 'northwest', 'southeast', 'southwest',
    'north-stadium', 'east-stadium', 'west-stadium', 'south-stadium',
    'far-northeast', 'far-northwest', 'far-southeast', 'far-southwest'
  ];

  useEffect(() => {
    if (gamePhase === 'playing' && reactionState.current.gameStartTime === 0) {
      reactionState.current.gameStartTime = Date.now();
      
      // Game start excitement
      onReactionTrigger({
        type: 'cheer',
        intensity: 1.0,
        duration: 3000,
        crowdSections: crowdSections
      });
    }
  }, [gamePhase, onReactionTrigger]);

  useEffect(() => {
    const currentScores = { p1: players[1].score, p2: players[2].score };
    
    // Score change reactions
    if (currentScores.p1 > reactionState.current.lastScore.p1 || 
        currentScores.p2 > reactionState.current.lastScore.p2) {
      
      const scoreDiff = (currentScores.p1 + currentScores.p2) - 
                       (reactionState.current.lastScore.p1 + reactionState.current.lastScore.p2);
      
      if (scoreDiff > 0) {
        // Determine reaction intensity based on score difference and game state
        const winScore = 5; // Assuming win score is 5
        const currentMax = Math.max(currentScores.p1, currentScores.p2);
        const isGamePoint = currentMax >= winScore - 1;
        
        let intensity = 0.8;
        let reactionType: 'cheer' | 'wave' | 'stomp' = 'cheer';
        
        if (isGamePoint) {
          intensity = 1.5;
          reactionType = 'stomp';
        } else if (currentMax >= winScore / 2) {
          intensity = 1.2;
          reactionType = 'wave';
        }
        
        // Trigger score reaction
        onReactionTrigger({
          type: reactionType,
          intensity: intensity,
          duration: isGamePoint ? 4000 : 2500,
          crowdSections: crowdSections
        });
      }
    }
    
    reactionState.current.lastScore = currentScores;
  }, [players, onReactionTrigger]);

  useEffect(() => {
    // Collision reactions
    if (lastCollision > reactionState.current.lastCollisionTime) {
      const timeSinceLastHit = lastCollision - reactionState.current.lastCollisionTime;
      
      if (timeSinceLastHit < 1000) { // Quick successive hits
        reactionState.current.consecutiveHits++;
      } else {
        reactionState.current.consecutiveHits = 1;
      }
      
      // Different reactions based on hit patterns
      if (reactionState.current.consecutiveHits >= 3) {
        // Rapid consecutive hits - crowd goes wild
        onReactionTrigger({
          type: 'stomp',
          intensity: 1.3,
          duration: 2000,
          crowdSections: crowdSections
        });
      } else {
        // Regular hit reaction
        onReactionTrigger({
          type: 'gasp',
          intensity: 0.6,
          duration: 800,
          crowdSections: crowdSections.slice(0, 8) // Only main sections react
        });
      }
      
      reactionState.current.lastCollisionTime = lastCollision;
    }
  }, [lastCollision, onReactionTrigger]);

  useFrame(() => {
    if (gamePhase !== 'playing') return;
    
    const currentTime = Date.now();
    
    // Decay reaction cooldown
    if (reactionState.current.reactionCooldown > 0) {
      reactionState.current.reactionCooldown -= 16; // Approximate frame time
    }
    
    // Periodic ambient crowd reactions
    const gameTime = currentTime - reactionState.current.gameStartTime;
    
    if (gameTime > 10000 && // After 10 seconds of gameplay
        reactionState.current.reactionCooldown <= 0 &&
        Math.random() < 0.001) { // Low probability per frame
      
      // Random ambient cheer from random sections
      const randomSections = crowdSections
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 4) + 2);
      
      onReactionTrigger({
        type: 'cheer',
        intensity: 0.4 + Math.random() * 0.3,
        duration: 1500,
        crowdSections: randomSections
      });
      
      reactionState.current.reactionCooldown = 5000; // 5 second cooldown
    }
  });

  return null;
}