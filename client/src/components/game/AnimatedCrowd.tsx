import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";

interface AnimatedCrowdProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  crowdId: string;
}

export default function AnimatedCrowd({ 
  position, 
  rotation = [0, 0, 0], 
  scale = [3, 3, 3],
  crowdId 
}: AnimatedCrowdProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene: cheeringCrowd } = useGLTF("/models/cheering_crowd.glb");
  const { gamePhase, players, lastCollision } = useGameState();
  
  const animationState = useRef({
    wavePhase: Math.random() * Math.PI * 2,
    cheerIntensity: 0,
    lastScore: { p1: 0, p2: 0 },
    targetCheerIntensity: 0,
    bouncePhase: 0,
    swayDirection: Math.random() > 0.5 ? 1 : -1
  });

  // Preload the crowd model
  useGLTF.preload("/models/cheering_crowd.glb");

  useEffect(() => {
    // Update animation state based on score changes
    const currentScores = { p1: players[1].score, p2: players[2].score };
    
    if (currentScores.p1 > animationState.current.lastScore.p1 || 
        currentScores.p2 > animationState.current.lastScore.p2) {
      // Trigger excited crowd reaction
      animationState.current.targetCheerIntensity = 1.5;
      animationState.current.bouncePhase = 0;
    }
    
    animationState.current.lastScore = currentScores;
  }, [players]);

  useFrame((state) => {
    if (!groupRef.current || gamePhase !== 'playing') return;
    
    const time = state.clock.getElapsedTime();
    const deltaTime = state.clock.getDelta();
    
    // Update cheer intensity (decay over time)
    animationState.current.cheerIntensity = THREE.MathUtils.lerp(
      animationState.current.cheerIntensity,
      animationState.current.targetCheerIntensity,
      deltaTime * 3
    );
    
    if (animationState.current.cheerIntensity > 0.1) {
      animationState.current.targetCheerIntensity *= 0.98; // Gradual decay
    }
    
    // Base crowd movement (gentle swaying)
    const baseWave = Math.sin(time * 0.5 + animationState.current.wavePhase) * 0.02;
    const baseSway = Math.sin(time * 0.3) * 0.01 * animationState.current.swayDirection;
    
    // Excited movement during cheering
    const cheerBounce = animationState.current.cheerIntensity > 0.2 ? 
      Math.sin(time * 8) * animationState.current.cheerIntensity * 0.1 : 0;
    
    const cheerSway = animationState.current.cheerIntensity > 0.2 ?
      Math.sin(time * 6 + animationState.current.wavePhase) * animationState.current.cheerIntensity * 0.05 : 0;
    
    // Wave effect across different crowd sections
    const waveOffset = Math.sin(time * 2 + animationState.current.wavePhase) * 0.03;
    
    // Apply combined movements
    groupRef.current.position.set(
      position[0] + baseSway + cheerSway,
      position[1] + baseWave + cheerBounce + waveOffset,
      position[2]
    );
    
    // Rotation for dramatic effect during big cheers
    const cheerRotation = animationState.current.cheerIntensity > 0.5 ?
      Math.sin(time * 10) * animationState.current.cheerIntensity * 0.02 : 0;
    
    groupRef.current.rotation.set(
      rotation[0] + cheerRotation,
      rotation[1],
      rotation[2] + baseSway * 0.5
    );
    
    // Scale pulsing during excitement
    const scaleMultiplier = 1 + (animationState.current.cheerIntensity * 0.05);
    groupRef.current.scale.set(
      scale[0] * scaleMultiplier,
      scale[1] * scaleMultiplier,
      scale[2] * scaleMultiplier
    );
  });

  // Clone the scene to avoid sharing between instances
  const clonedScene = cheeringCrowd.clone();
  
  // Ensure proper materials and lighting
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      
      if (child.material) {
        const material = child.material.clone();
        if (material instanceof THREE.MeshStandardMaterial) {
          // Add slight emissive glow during excitement
          material.emissiveIntensity = animationState.current.cheerIntensity * 0.1;
        }
        child.material = material;
      }
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      rotation={rotation}
      scale={scale}
      userData={{ crowdId }}
    >
      <primitive object={clonedScene} />
      
      {/* Add particle effects during excitement */}
      {animationState.current.cheerIntensity > 0.8 && (
        <group position={[0, 2, 0]}>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh key={i} position={[
              (Math.random() - 0.5) * 6,
              Math.random() * 3,
              (Math.random() - 0.5) * 6
            ]}>
              <sphereGeometry args={[0.05, 4, 4]} />
              <meshBasicMaterial 
                color={Math.random() > 0.5 ? "#ffd700" : "#ff6b6b"} 
                transparent 
                opacity={0.7}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}