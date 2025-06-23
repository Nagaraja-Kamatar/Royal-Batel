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
  const bodyRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const swordRef = useRef<THREE.Mesh>(null);
  
  const walkCycle = useRef(0);
  const attackCycle = useRef(0);
  const hitReaction = useRef(0);
  
  const playerColor = playerId === 1 ? "#22c55e" : "#ef4444"; // Green or Red

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const deltaTime = state.clock.getDelta();
    
    // Calculate movement speed for walk animation
    const movementSpeed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
    const isWalking = movementSpeed > 0.01;
    
    // Face the other player
    const direction = otherPlayerPosition.clone().sub(position).normalize();
    const faceAngle = Math.atan2(direction.x, direction.z);
    groupRef.current.rotation.y = faceAngle;
    
    // Walk animation
    if (isWalking) {
      walkCycle.current += deltaTime * 8;
      
      // Leg movement for walking
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(walkCycle.current) * 0.5;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = Math.sin(walkCycle.current + Math.PI) * 0.5;
      }
      
      // Arm swing during walking (when not attacking)
      if (!isAttacking) {
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(walkCycle.current + Math.PI) * 0.3;
        }
        if (rightArmRef.current && !swordRef.current) {
          rightArmRef.current.rotation.x = Math.sin(walkCycle.current) * 0.3;
        }
      }
      
      // Body bob during walking
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(walkCycle.current * 2) * 0.05;
      }
    } else {
      // Reset to idle position
      walkCycle.current = 0;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (bodyRef.current) bodyRef.current.position.y = 0;
    }
    
    // Attack animation
    if (isAttacking) {
      attackCycle.current += deltaTime * 15;
      
      if (attackCycle.current < Math.PI) {
        // Wind up and strike
        const attackProgress = Math.sin(attackCycle.current);
        
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -Math.PI / 4 - attackProgress * Math.PI / 2;
          rightArmRef.current.rotation.z = attackProgress * Math.PI / 4;
        }
        
        if (swordRef.current) {
          swordRef.current.rotation.z = attackProgress * Math.PI / 6;
        }
        
        // Body lean into attack
        if (bodyRef.current) {
          bodyRef.current.rotation.x = attackProgress * 0.2;
        }
      } else {
        attackCycle.current = 0;
      }
    } else {
      attackCycle.current = 0;
      // Reset attack pose
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -Math.PI / 6, deltaTime * 5);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0, deltaTime * 5);
      }
      if (bodyRef.current) {
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, deltaTime * 5);
      }
    }
    
    // Hit reaction animation
    if (isHit) {
      hitReaction.current += deltaTime * 12;
      
      if (hitReaction.current < Math.PI) {
        const hitProgress = Math.sin(hitReaction.current);
        
        // Recoil animation
        if (bodyRef.current) {
          bodyRef.current.rotation.x = -hitProgress * 0.3;
          bodyRef.current.position.x = Math.sin(hitReaction.current * 3) * 0.1;
        }
        
        // Arms flail
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = hitProgress * Math.PI / 3;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = hitProgress * Math.PI / 4;
        }
      } else {
        hitReaction.current = 0;
      }
    } else {
      hitReaction.current = 0;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 1.2]} />
        <meshStandardMaterial color={playerColor} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color={playerColor} />
      </mesh>
      
      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.5, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8]} />
        <meshStandardMaterial color={playerColor} />
      </mesh>
      
      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.5, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8]} />
        <meshStandardMaterial color={playerColor} />
      </mesh>
      
      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.2, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.6]} />
        <meshStandardMaterial color={playerColor} />
      </mesh>
      
      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.2, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.6]} />
        <meshStandardMaterial color={playerColor} />
      </mesh>
      
      {/* Sword */}
      <mesh ref={swordRef} position={[0.7, 1.4, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.2]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Sword Guard */}
      <mesh position={[0.7, 1.4, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Shield (optional visual element) */}
      <mesh position={[-0.7, 1.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  );
}