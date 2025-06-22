import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";

interface CrowdSynchronizerProps {
  onCrowdSync: (crowdId: string, syncData: {
    intensity: number;
    wavePhase: number;
    bounceAmplitude: number;
    colorIntensity: number;
  }) => void;
}

export default function CrowdSynchronizer({ onCrowdSync }: CrowdSynchronizerProps) {
  const { gamePhase, players, lastCollision } = useGameState();
  
  const syncState = useRef({
    masterWavePhase: 0,
    globalExcitement: 0,
    lastScore: { p1: 0, p2: 0 },
    waveDirection: 1,
    synchronizedBeat: 0,
    crowdSections: [
      'north-main', 'east-main', 'west-main', 'south-main',
      'northeast', 'northwest', 'southeast', 'southwest',
      'north-stadium', 'east-stadium', 'west-stadium', 'south-stadium',
      'far-northeast', 'far-northwest', 'far-southeast', 'far-southwest'
    ]
  });

  useEffect(() => {
    const currentScores = { p1: players[1].score, p2: players[2].score };
    
    if (currentScores.p1 > syncState.current.lastScore.p1 || 
        currentScores.p2 > syncState.current.lastScore.p2) {
      
      // Trigger synchronized celebration
      syncState.current.globalExcitement = 2.0;
      syncState.current.waveDirection *= -1; // Change wave direction
      
      // Reset synchronization for dramatic effect
      syncState.current.masterWavePhase = 0;
    }
    
    syncState.current.lastScore = currentScores;
  }, [players]);

  useFrame((state) => {
    if (gamePhase !== 'playing') return;
    
    const time = state.clock.getElapsedTime();
    const deltaTime = state.clock.getDelta();
    
    // Update master wave phase
    syncState.current.masterWavePhase += deltaTime * 2;
    
    // Decay global excitement
    syncState.current.globalExcitement = Math.max(
      0, 
      syncState.current.globalExcitement - deltaTime * 0.8
    );
    
    // Update synchronized beat
    syncState.current.synchronizedBeat = Math.sin(time * 4) * 0.5 + 0.5;
    
    // Calculate wave patterns for different crowd sections
    syncState.current.crowdSections.forEach((crowdId, index) => {
      const sectionPhase = (index / syncState.current.crowdSections.length) * Math.PI * 2;
      const distanceFromCenter = Math.floor(index / 4) * 0.5; // Different tiers
      
      // Calculate synchronized wave
      const wavePhase = syncState.current.masterWavePhase + sectionPhase + 
                       (distanceFromCenter * syncState.current.waveDirection);
      
      // Base intensity with excitement boost
      const baseIntensity = 0.3 + (syncState.current.globalExcitement * 0.7);
      const waveIntensity = Math.sin(wavePhase) * 0.5 + 0.5;
      const finalIntensity = baseIntensity * waveIntensity;
      
      // Calculate bounce amplitude (synchronized jumping)
      const bouncePhase = time * 6 + sectionPhase;
      const bounceAmplitude = finalIntensity * Math.sin(bouncePhase) * 0.3;
      
      // Color intensity for lighting effects
      const colorIntensity = finalIntensity * syncState.current.synchronizedBeat;
      
      // Send sync data to crowd sections
      onCrowdSync(crowdId, {
        intensity: finalIntensity,
        wavePhase: wavePhase,
        bounceAmplitude: bounceAmplitude,
        colorIntensity: colorIntensity
      });
    });
  });

  return null;
}