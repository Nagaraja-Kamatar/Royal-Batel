import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";

interface ColosseumAudienceProps {
  position: [number, number, number];
  sectionId: string;
  tierLevel: number;
}

export default function ColosseumAudience({ 
  position, 
  sectionId,
  tierLevel 
}: ColosseumAudienceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene: audienceMember } = useGLTF("/models/seated_audience_member.glb");
  const { gamePhase, players } = useGameState();
  
  // Calculate position to face arena center
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
    armWaveOffset: Math.random() * Math.PI,
    flagWavePhase: Math.random() * Math.PI,
    clapPhase: Math.random() * Math.PI * 2
  });

  useGLTF.preload("/models/seated_audience_member.glb");

  useEffect(() => {
    const currentScores = { p1: players[1].score, p2: players[2].score };
    
    if (currentScores.p1 > animationState.current.lastScore.p1 || 
        currentScores.p2 > animationState.current.lastScore.p2) {
      // Intense colosseum crowd reaction
      animationState.current.targetCheerIntensity = 2.5;
      animationState.current.bouncePhase = 0;
    }
    
    animationState.current.lastScore = currentScores;
  }, [players]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const deltaTime = state.clock.getDelta();
    
    // Update cheer intensity
    animationState.current.cheerIntensity = THREE.MathUtils.lerp(
      animationState.current.cheerIntensity,
      animationState.current.targetCheerIntensity,
      deltaTime * 3
    );
    
    if (animationState.current.cheerIntensity > 0.1) {
      animationState.current.targetCheerIntensity *= 0.98;
    }
    
    // Colosseum-style crowd movements
    const baseWave = Math.sin(time * 0.6 + animationState.current.wavePhase) * 0.02;
    const baseSway = Math.sin(time * 0.4 + animationState.current.armWaveOffset) * 0.015;
    
    // Intense cheering for colosseum atmosphere
    const cheerBounce = animationState.current.cheerIntensity > 0.3 ? 
      Math.sin(time * 18 + animationState.current.bouncePhase) * animationState.current.cheerIntensity * 0.2 : 0;
    
    const cheerSway = animationState.current.cheerIntensity > 0.3 ?
      Math.sin(time * 12 + animationState.current.wavePhase) * animationState.current.cheerIntensity * 0.12 : 0;
    
    // Clapping motion
    const clapMotion = animationState.current.cheerIntensity > 0.5 ?
      Math.sin(time * 25 + animationState.current.clapPhase) * animationState.current.cheerIntensity * 0.08 : 0;
    
    // Stadium wave effect across tiers
    const tierWaveOffset = Math.sin(time * 2 + animationState.current.wavePhase + (tierLevel * 0.5)) * 0.03;
    
    // Apply enhanced movements
    groupRef.current.position.set(
      position[0] + baseSway + cheerSway,
      animationState.current.baseHeight + baseWave + cheerBounce + tierWaveOffset + clapMotion,
      position[2]
    );
    
    // Dynamic rotation for enthusiastic crowd
    const cheerRotationY = animationState.current.cheerIntensity > 0.4 ?
      Math.sin(time * 20 + animationState.current.armWaveOffset) * animationState.current.cheerIntensity * 0.03 : 0;
    
    const cheerRotationX = animationState.current.cheerIntensity > 0.6 ?
      Math.sin(time * 25) * animationState.current.cheerIntensity * 0.025 : 0;
    
    groupRef.current.rotation.set(
      cheerRotationX + baseSway * 0.4,
      faceTowardArena + cheerRotationY,
      baseSway * 0.3
    );
    
    // Scale changes for excitement
    const scaleMultiplier = 1 + (animationState.current.cheerIntensity * 0.1);
    groupRef.current.scale.set(
      scaleMultiplier,
      scaleMultiplier,
      scaleMultiplier
    );
  });

  // Clone and enhance the audience model
  const clonedAudience = audienceMember.clone();
  
  clonedAudience.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      
      if (child.material) {
        const material = child.material.clone();
        if (material instanceof THREE.MeshStandardMaterial) {
          material.emissiveIntensity = animationState.current.cheerIntensity * 0.08;
          // Diverse crowd colors
          const colorVariation = new THREE.Color().setHSL(
            Math.random(),
            0.4 + Math.random() * 0.5,
            0.3 + Math.random() * 0.4
          );
          material.color.lerp(colorVariation, 0.4);
        }
        child.material = material;
      }
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
      rotation={[0, faceTowardArena, 0]}
      userData={{ sectionId, tierLevel }}
    >
      {/* Colosseum stone seating */}
      <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.3, 1.2]} />
        <meshStandardMaterial 
          color="#a0907a" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Audience member */}
      <primitive object={clonedAudience} position={[0, -0.2, 0]} />
      
      {/* Individual colored flags for some audience members */}
      {Math.random() > 0.7 && (
        <group position={[0.8, 1, 0]}>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 2]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0.3, 1.5, 0]}>
            <planeGeometry args={[0.6, 0.4]} />
            <meshStandardMaterial 
              color={Math.random() > 0.5 ? (Math.random() > 0.5 ? "#ff0000" : "#0000ff") : "#ffff00"}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      )}
      
      {/* Enhanced enthusiasm particles */}
      {animationState.current.cheerIntensity > 1.0 && (
        <group position={[0, 2, 0]}>
          {Array.from({ length: 15 }).map((_, i) => (
            <mesh key={i} position={[
              (Math.random() - 0.5) * 3,
              Math.random() * 3,
              (Math.random() - 0.5) * 3
            ]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial 
                color={["#ffd700", "#ff6b6b", "#4169e1", "#32cd32"][Math.floor(Math.random() * 4)]} 
                transparent 
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Dust particles around feet during intense cheering */}
      {animationState.current.cheerIntensity > 1.5 && (
        <group position={[0, 0, 0]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[
              (Math.random() - 0.5) * 2,
              Math.random() * 0.5,
              (Math.random() - 0.5) * 2
            ]}>
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshBasicMaterial 
                color="#d2b48c" 
                transparent 
                opacity={0.4}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}