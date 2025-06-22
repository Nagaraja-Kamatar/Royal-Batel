import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";

interface CrowdWaveProps {
  crowdPositions: Array<{
    position: [number, number, number];
    crowdId: string;
  }>;
}

export default function CrowdWave({ crowdPositions }: CrowdWaveProps) {
  const { gamePhase, players, lastCollision } = useGameState();
  
  const waveState = useRef({
    activeWaves: new Map<string, {
      startTime: number;
      direction: THREE.Vector3;
      intensity: number;
      type: 'score' | 'collision' | 'victory';
    }>(),
    globalWavePhase: 0,
    lastScoreTime: 0,
    waveSpeed: 8.0,
    maxWaves: 3
  });

  const crowdMeshes = useRef<Map<string, THREE.Group>>(new Map());

  // Initialize crowd wave effects
  useEffect(() => {
    crowdPositions.forEach(({ crowdId, position }) => {
      if (!crowdMeshes.current.has(crowdId)) {
        const group = new THREE.Group();
        group.position.set(...position);
        crowdMeshes.current.set(crowdId, group);
      }
    });
  }, [crowdPositions]);

  // Trigger waves on score changes
  useEffect(() => {
    const currentTime = Date.now();
    const totalScore = players[1].score + players[2].score;
    
    if (totalScore > 0 && currentTime - waveState.current.lastScoreTime > 1000) {
      triggerScoreWave();
      waveState.current.lastScoreTime = currentTime;
    }
  }, [players]);

  // Trigger waves on collisions
  useEffect(() => {
    if (lastCollision > 0) {
      triggerCollisionWave();
    }
  }, [lastCollision]);

  const triggerScoreWave = () => {
    // Create a wave that radiates from the center outward
    const waveId = `score-${Date.now()}`;
    const centerPosition = new THREE.Vector3(0, 0, 0);
    
    waveState.current.activeWaves.set(waveId, {
      startTime: Date.now(),
      direction: new THREE.Vector3(1, 0, 0), // Radial expansion
      intensity: 1.0,
      type: 'score'
    });

    // Remove old waves if too many
    if (waveState.current.activeWaves.size > waveState.current.maxWaves) {
      const oldestWave = Array.from(waveState.current.activeWaves.keys())[0];
      waveState.current.activeWaves.delete(oldestWave);
    }
  };

  const triggerCollisionWave = () => {
    // Create a more intense, faster wave for collisions
    const waveId = `collision-${Date.now()}`;
    
    waveState.current.activeWaves.set(waveId, {
      startTime: Date.now(),
      direction: new THREE.Vector3(0, 1, 0), // Vertical wave
      intensity: 0.7,
      type: 'collision'
    });
  };

  const triggerVictoryWave = () => {
    // Create multiple overlapping waves for victory
    for (let i = 0; i < 3; i++) {
      const waveId = `victory-${Date.now()}-${i}`;
      const angle = (i / 3) * Math.PI * 2;
      const direction = new THREE.Vector3(
        Math.cos(angle),
        0,
        Math.sin(angle)
      );
      
      setTimeout(() => {
        waveState.current.activeWaves.set(waveId, {
          startTime: Date.now(),
          direction: direction,
          intensity: 1.5,
          type: 'victory'
        });
      }, i * 200);
    }
  };

  // Handle game end victory waves
  useEffect(() => {
    if (gamePhase === 'ended') {
      triggerVictoryWave();
    }
  }, [gamePhase]);

  useFrame((state) => {
    if (gamePhase !== 'playing' && gamePhase !== 'ended') return;

    const currentTime = Date.now();
    waveState.current.globalWavePhase += 0.02;

    // Update active waves
    waveState.current.activeWaves.forEach((wave, waveId) => {
      const waveAge = (currentTime - wave.startTime) / 1000; // in seconds
      const waveLifetime = wave.type === 'victory' ? 4.0 : 2.0;

      if (waveAge > waveLifetime) {
        waveState.current.activeWaves.delete(waveId);
        return;
      }

      // Calculate wave progress (0 to 1)
      const waveProgress = waveAge / waveLifetime;
      const waveRadius = waveProgress * 15; // Maximum wave radius

      // Apply wave effects to each crowd section
      crowdPositions.forEach(({ crowdId, position }) => {
        const crowdPosition = new THREE.Vector3(...position);
        const distanceFromCenter = crowdPosition.length();
        
        // Calculate if this crowd section is affected by the wave
        const waveDistance = Math.abs(distanceFromCenter - waveRadius);
        const waveWidth = 2.0; // Width of the wave effect
        
        if (waveDistance < waveWidth) {
          // Calculate wave intensity at this position
          const localIntensity = wave.intensity * 
            (1 - waveDistance / waveWidth) * 
            (1 - waveProgress); // Fade out over time

          // Apply wave effect based on type
          applyCrowdWaveEffect(crowdId, wave.type, localIntensity, waveProgress);
        }
      });
    });
  });

  const applyCrowdWaveEffect = (
    crowdId: string, 
    waveType: 'score' | 'collision' | 'victory', 
    intensity: number, 
    progress: number
  ) => {
    const crowdGroup = crowdMeshes.current.get(crowdId);
    if (!crowdGroup) return;

    switch (waveType) {
      case 'score':
        // Upward bounce wave
        crowdGroup.position.y += Math.sin(progress * Math.PI) * intensity * 0.3;
        crowdGroup.scale.setScalar(1 + intensity * 0.1);
        break;
        
      case 'collision':
        // Quick shake effect
        const shakeAmount = intensity * 0.2;
        crowdGroup.position.x += (Math.random() - 0.5) * shakeAmount;
        crowdGroup.position.z += (Math.random() - 0.5) * shakeAmount;
        break;
        
      case 'victory':
        // Dramatic celebration wave
        const celebrationHeight = Math.sin(progress * Math.PI * 2) * intensity * 0.5;
        crowdGroup.position.y += celebrationHeight;
        crowdGroup.rotation.y += intensity * 0.1;
        crowdGroup.scale.setScalar(1 + intensity * 0.15);
        break;
    }
  };

  return (
    <group>
      {/* Wave visualization effects */}
      {Array.from(waveState.current.activeWaves.entries()).map(([waveId, wave]) => {
        const waveAge = (Date.now() - wave.startTime) / 1000;
        const waveProgress = Math.min(1, waveAge / 2);
        const waveRadius = waveProgress * 15;
        
        return (
          <mesh key={waveId} position={[0, 0.1, 0]}>
            <ringGeometry args={[waveRadius - 0.5, waveRadius + 0.5, 32]} />
            <meshBasicMaterial 
              color={wave.type === 'victory' ? '#FFD700' : wave.type === 'score' ? '#4CAF50' : '#FF5722'}
              transparent
              opacity={Math.max(0, (1 - waveProgress) * wave.intensity * 0.3)}
            />
          </mesh>
        );
      })}
    </group>
  );
}