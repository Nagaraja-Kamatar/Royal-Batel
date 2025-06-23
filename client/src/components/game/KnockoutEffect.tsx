import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface KnockoutEffectProps {
  position: [number, number, number];
  playerId: number;
  onComplete: () => void;
}

export default function KnockoutEffect({ position, playerId, onComplete }: KnockoutEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const effectTimer = useRef(0);
  const particlesRef = useRef<THREE.Points>(null);
  
  // Create particles for dramatic effect
  const particleCount = 50;
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  
  useEffect(() => {
    // Initialize particle positions and velocities
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 1] = Math.random() * 0.05 + 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const deltaTime = state.clock.getDelta();
    effectTimer.current += deltaTime;
    
    // Text animation
    if (textRef.current) {
      const scaleProgress = Math.min(effectTimer.current * 2, 1);
      const scale = 1 + Math.sin(effectTimer.current * 15) * 0.1;
      textRef.current.scale.setScalar(scaleProgress * scale);
      
      // Text color flash
      if (textRef.current.material instanceof THREE.MeshBasicMaterial) {
        const flashIntensity = Math.abs(Math.sin(effectTimer.current * 20));
        textRef.current.material.color.setRGB(1, flashIntensity, flashIntensity);
      }
      
      // Text rise
      textRef.current.position.y = effectTimer.current * 2;
    }
    
    // Particle animation
    if (particlesRef.current) {
      const positionsArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        positionsArray[i * 3] += velocities[i * 3];
        positionsArray[i * 3 + 1] += velocities[i * 3 + 1];
        positionsArray[i * 3 + 2] += velocities[i * 3 + 2];
        
        // Apply gravity to particles
        velocities[i * 3 + 1] -= 0.001;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Shake effect for drama
    if (groupRef.current) {
      const shakeIntensity = Math.max(0, 1 - effectTimer.current * 0.5);
      groupRef.current.position.x = position[0] + (Math.random() - 0.5) * shakeIntensity * 0.1;
      groupRef.current.position.z = position[2] + (Math.random() - 0.5) * shakeIntensity * 0.1;
    }
    
    // Complete effect after 3 seconds
    if (effectTimer.current > 3) {
      onComplete();
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* KNOCKOUT Text */}
      <mesh ref={textRef} position={[0, 2, 0]}>
        <planeGeometry args={[4, 1]} />
        <meshBasicMaterial 
          color="#ff0000" 
          transparent 
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Text outline */}
      <mesh position={[0, 2, -0.01]}>
        <planeGeometry args={[4.2, 1.2]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Explosion particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#ff4444"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
      
      {/* Impact rings */}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[0, 0.1, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[(1 + i) * 2, (1 + i) * 2, 1]}
        >
          <ringGeometry args={[1, 1.2, 32]} />
          <meshBasicMaterial 
            color={playerId === 1 ? "#22c55e" : "#ef4444"} 
            transparent 
            opacity={Math.max(0, 0.6 - effectTimer.current * 0.3 - i * 0.1)}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      
      {/* Flash effect */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={Math.max(0, 0.3 - effectTimer.current * 0.2)}
        />
      </mesh>
      
      {/* Lightning-style effects */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 2;
        const z = Math.sin(angle) * 2;
        
        return (
          <mesh key={i} position={[x, 1, z]} rotation={[0, angle, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 3]} />
            <meshBasicMaterial 
              color="#ffff00" 
              transparent 
              opacity={Math.max(0, 0.8 - effectTimer.current * 0.4)}
            />
          </mesh>
        );
      })}
    </group>
  );
}