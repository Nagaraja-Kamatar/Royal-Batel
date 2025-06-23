import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

interface PlayerAnimationsProps {
  playerId: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isAttacking: boolean;
  isHit: boolean;
  otherPlayerPosition: THREE.Vector3;
}

export default function PlayerAnimations({
  playerId,
  position,
  velocity,
  isAttacking,
  isHit,
  otherPlayerPosition
}: PlayerAnimationsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const characterRef = useRef<THREE.Group>(null);
  
  const walkCycle = useRef(0);
  const attackCycle = useRef(0);
  const hitReaction = useRef(0);
  
  const playerColor = playerId === 1 ? "#00ff00" : "#ff0000"; // Bright Green or Red
  
  // Load the 3D character model
  const { scene: characterModel } = useGLTF("/models/cleopatra.glb");

  useFrame((state) => {
    if (!groupRef.current || !characterRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const deltaTime = state.clock.getDelta();
    
    // Calculate movement speed for walk animation
    const movementSpeed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
    const isWalking = movementSpeed > 0.01;
    
    // Face the other player
    const direction = otherPlayerPosition.clone().sub(position).normalize();
    const faceAngle = Math.atan2(direction.x, direction.z);
    groupRef.current.rotation.y = faceAngle;
    
    // Simple walking animation - bob the character up and down
    if (isWalking) {
      walkCycle.current += deltaTime * 8;
      characterRef.current.position.y = Math.sin(walkCycle.current * 2) * 0.05;
      
      // Add slight rotation for dynamic movement
      characterRef.current.rotation.z = Math.sin(walkCycle.current) * 0.02;
    } else {
      walkCycle.current = 0;
      characterRef.current.position.y = THREE.MathUtils.lerp(characterRef.current.position.y, 0, deltaTime * 5);
      characterRef.current.rotation.z = THREE.MathUtils.lerp(characterRef.current.rotation.z, 0, deltaTime * 5);
    }
    
    // Attack animation - lean forward and scale up slightly
    if (isAttacking) {
      attackCycle.current += deltaTime * 15;
      
      if (attackCycle.current < Math.PI) {
        const attackProgress = Math.sin(attackCycle.current);
        characterRef.current.rotation.x = attackProgress * 0.3;
        characterRef.current.scale.setScalar(1 + attackProgress * 0.1);
      } else {
        attackCycle.current = 0;
      }
    } else {
      attackCycle.current = 0;
      characterRef.current.rotation.x = THREE.MathUtils.lerp(characterRef.current.rotation.x, 0, deltaTime * 5);
      characterRef.current.scale.setScalar(THREE.MathUtils.lerp(characterRef.current.scale.x, 1, deltaTime * 5));
    }
    
    // Hit reaction animation - shake and recoil
    if (isHit) {
      hitReaction.current += deltaTime * 12;
      
      if (hitReaction.current < Math.PI) {
        const hitProgress = Math.sin(hitReaction.current);
        characterRef.current.rotation.x = -hitProgress * 0.4;
        characterRef.current.position.x = Math.sin(hitReaction.current * 8) * 0.05;
        characterRef.current.position.z = Math.sin(hitReaction.current * 6) * 0.03;
      } else {
        hitReaction.current = 0;
      }
    } else {
      hitReaction.current = 0;
      characterRef.current.position.x = THREE.MathUtils.lerp(characterRef.current.position.x, 0, deltaTime * 5);
      characterRef.current.position.z = THREE.MathUtils.lerp(characterRef.current.position.z, 0, deltaTime * 5);
    }
  });

  // Clone and prepare the character model
  const clonedCharacter = characterModel.clone();
  
  // Apply player-specific coloring and enhancements
  clonedCharacter.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      
      // Apply player color tint to materials
      if (child.material) {
        const material = child.material.clone();
        if (material instanceof THREE.MeshStandardMaterial) {
          // Add player color as emissive tint
          material.emissive = new THREE.Color(playerColor);
          material.emissiveIntensity = 0.2;
          
          // Enhance material properties for better visibility
          material.metalness = Math.min(material.metalness + 0.2, 1.0);
          material.roughness = Math.max(material.roughness - 0.1, 0.1);
        }
        child.material = material;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[2.5, 2.5, 2.5]}>
      {/* Main character model */}
      <primitive 
        ref={characterRef}
        object={clonedCharacter}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      />
      
      {/* Player identification glow effect */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial 
          color={playerColor} 
          transparent 
          opacity={0.3}
          wireframe
        />
      </mesh>
      
      {/* Ground indicator */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.0, 16]} />
        <meshBasicMaterial 
          color={playerColor} 
          transparent 
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}