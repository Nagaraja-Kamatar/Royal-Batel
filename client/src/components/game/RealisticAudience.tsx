import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";

interface RealisticAudienceProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  crowdId: string;
}

export default function RealisticAudience({ 
  position, 
  rotation = [0, 0, 0], 
  scale = [1.5, 1.5, 1.5],
  crowdId 
}: RealisticAudienceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene: audienceMember } = useGLTF("/models/seated_audience_member.glb");
  const { gamePhase, players } = useGameState();
  
  // Calculate rotation to face arena center
  const arenaCenter = new THREE.Vector3(0, 0, 0);
  const audiencePosition = new THREE.Vector3(...position);
  const lookDirection = arenaCenter.clone().sub(audiencePosition).normalize();
  const faceTowardArena = Math.atan2(lookDirection.x, lookDirection.z);
  
  const animationState = useRef({
    wavePhase: Math.random() * Math.PI * 2,
    cheerIntensity: 0,
    lastScore: { p1: 0, p2: 0 },
    targetCheerIntensity: 0,
    bouncePhase: 0,
    swayDirection: Math.random() > 0.5 ? 1 : -1,
    baseHeight: position[1],
    armWaveOffset: Math.random() * Math.PI
  });

  // Preload the model
  useGLTF.preload("/models/seated_audience_member.glb");

  useEffect(() => {
    // React to score changes with more enthusiasm
    const currentScores = { p1: players[1].score, p2: players[2].score };
    
    if (currentScores.p1 > animationState.current.lastScore.p1 || 
        currentScores.p2 > animationState.current.lastScore.p2) {
      // Trigger strong crowd reaction for goals
      animationState.current.targetCheerIntensity = 2.0;
      animationState.current.bouncePhase = 0;
    }
    
    animationState.current.lastScore = currentScores;
  }, [players]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const deltaTime = state.clock.getDelta();
    
    // Update cheer intensity with smoother transitions
    animationState.current.cheerIntensity = THREE.MathUtils.lerp(
      animationState.current.cheerIntensity,
      animationState.current.targetCheerIntensity,
      deltaTime * 2.5
    );
    
    if (animationState.current.cheerIntensity > 0.1) {
      animationState.current.targetCheerIntensity *= 0.985; // Gradual decay
    }
    
    // Base ambient movement (gentle swaying while seated)
    const baseWave = Math.sin(time * 0.4 + animationState.current.wavePhase) * 0.015;
    const baseSway = Math.sin(time * 0.25 + animationState.current.armWaveOffset) * 0.008;
    
    // Excited movement during cheering (more pronounced for seated audience)
    const cheerBounce = animationState.current.cheerIntensity > 0.3 ? 
      Math.sin(time * 12 + animationState.current.bouncePhase) * animationState.current.cheerIntensity * 0.08 : 0;
    
    const cheerSway = animationState.current.cheerIntensity > 0.3 ?
      Math.sin(time * 8 + animationState.current.wavePhase) * animationState.current.cheerIntensity * 0.04 : 0;
    
    // Stadium wave effect
    const waveOffset = Math.sin(time * 1.5 + animationState.current.wavePhase + (position[0] * 0.1)) * 0.02;
    
    // Apply movements (more subtle for seated audience)
    groupRef.current.position.set(
      position[0] + baseSway + cheerSway * 0.5,
      animationState.current.baseHeight + baseWave + cheerBounce + waveOffset,
      position[2]
    );
    
    // Rotation for enthusiasm (head bobbing and body leaning)
    const cheerRotationY = animationState.current.cheerIntensity > 0.4 ?
      Math.sin(time * 15 + animationState.current.armWaveOffset) * animationState.current.cheerIntensity * 0.015 : 0;
    
    const cheerRotationX = animationState.current.cheerIntensity > 0.5 ?
      Math.sin(time * 18) * animationState.current.cheerIntensity * 0.01 : 0;
    
    groupRef.current.rotation.set(
      rotation[0] + cheerRotationX + baseSway * 0.3,
      faceTowardArena + cheerRotationY,
      rotation[2] + baseSway * 0.2
    );
    
    // Subtle scale changes during excitement
    const scaleMultiplier = 1 + (animationState.current.cheerIntensity * 0.03);
    groupRef.current.scale.set(
      scale[0] * scaleMultiplier,
      scale[1] * scaleMultiplier,
      scale[2] * scaleMultiplier
    );
  });

  // Clone the model to avoid sharing between instances
  const clonedAudience = audienceMember.clone();
  
  // Setup materials and shadows
  clonedAudience.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      
      if (child.material) {
        const material = child.material.clone();
        if (material instanceof THREE.MeshStandardMaterial) {
          // Add subtle emissive glow during excitement
          material.emissiveIntensity = animationState.current.cheerIntensity * 0.05;
          // Vary audience member clothing colors slightly
          const colorVariation = new THREE.Color().setHSL(
            Math.random(),
            0.3 + Math.random() * 0.4,
            0.4 + Math.random() * 0.3
          );
          material.color.lerp(colorVariation, 0.3);
        }
        child.material = material;
      }
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      rotation={[rotation[0], faceTowardArena, rotation[2]]}
      scale={scale}
      userData={{ crowdId }}
    >
      {/* Wooden stadium stand */}
      <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.2, 1]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Seated audience member directly on stand */}
      <primitive object={clonedAudience} position={[0, -0.2, 0]} />
      
      {/* Enthusiasm particles during big moments */}
      {animationState.current.cheerIntensity > 1.2 && (
        <group position={[0, 1.5, 0]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[
              (Math.random() - 0.5) * 2,
              Math.random() * 2,
              (Math.random() - 0.5) * 2
            ]}>
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshBasicMaterial 
                color={Math.random() > 0.5 ? "#ffd700" : "#ff4444"} 
                transparent 
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Ambient sound visualization during cheering */}
      {animationState.current.cheerIntensity > 0.8 && (
        <group position={[0, 1.2, 0]}>
          <mesh>
            <ringGeometry args={[0.8, 1.2, 16]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.1 * animationState.current.cheerIntensity}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}