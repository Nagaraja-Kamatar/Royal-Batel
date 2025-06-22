import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DodgeEffectProps {
  playerId: number;
  active: boolean;
  direction: [number, number, number];
  playerPosition: [number, number, number];
  playerColor: string;
}

export default function DodgeEffect({ playerId, active, direction, playerPosition, playerColor }: DodgeEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef<number>(0);
  const particles = useRef<THREE.Vector3[]>([]);
  const particleVelocities = useRef<THREE.Vector3[]>([]);
  
  useEffect(() => {
    if (active) {
      startTime.current = Date.now();
      
      // Create particle positions and velocities
      particles.current = [];
      particleVelocities.current = [];
      
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 0.5 + Math.random() * 0.5;
        
        particles.current.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          0.2 + Math.random() * 0.4,
          Math.sin(angle) * radius
        ));
        
        particleVelocities.current.push(new THREE.Vector3(
          Math.cos(angle) * (3 + Math.random() * 2) + direction[0] * 2,
          1 + Math.random() * 2,
          Math.sin(angle) * (3 + Math.random() * 2) + direction[2] * 2
        ));
      }
    }
  }, [active, direction]);

  useFrame((state) => {
    if (!groupRef.current || !active) return;
    
    const elapsed = Date.now() - startTime.current;
    const progress = elapsed / 500; // 500ms effect duration
    
    if (progress >= 1) return;
    
    // Update group position to follow player
    groupRef.current.position.set(...playerPosition);
    
    // Update particle positions
    groupRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && particles.current[index] && particleVelocities.current[index]) {
        const particle = particles.current[index];
        const velocity = particleVelocities.current[index];
        
        // Update particle position
        particle.add(velocity.clone().multiplyScalar(0.016)); // ~60fps
        
        // Apply gravity and air resistance
        velocity.y -= 0.05;
        velocity.multiplyScalar(0.98);
        
        // Update mesh position
        child.position.copy(particle);
        
        // Fade out over time with sparkle effect
        const material = child.material as THREE.MeshStandardMaterial;
        const sparkle = 0.5 + Math.sin(progress * 20) * 0.5;
        material.opacity = Math.max(0, (1 - progress * 2) * sparkle);
        material.emissiveIntensity = sparkle;
        
        // Scale down over time with pulsing
        const pulse = 1 + Math.sin(progress * 15) * 0.3;
        const scale = Math.max(0.1, (1 - progress) * pulse);
        child.scale.setScalar(scale);
      }
    });
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={playerPosition}>
      {/* Speed lines effect */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const length = 2 + Math.random();
        return (
          <mesh key={`line-${i}`} position={[
            Math.cos(angle) * 0.3,
            0.5,
            Math.sin(angle) * 0.3
          ]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.05, 0.1, length]} />
            <meshStandardMaterial 
              color={playerColor}
              emissive={playerColor}
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
        );
      })}
      
      {/* Particle burst */}
      {particles.current.map((_, i) => (
        <mesh key={`particle-${i}`} position={[0, 0, 0]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial 
            color={playerColor}
            emissive={playerColor}
            emissiveIntensity={0.6}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
      
      {/* Ring effect */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.2, 16]} />
        <meshStandardMaterial 
          color={playerColor}
          emissive={playerColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Shockwave */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 2.0, 32]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}