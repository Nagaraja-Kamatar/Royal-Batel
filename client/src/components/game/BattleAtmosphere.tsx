import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";

export default function BattleAtmosphere() {
  const { gamePhase, players } = useGameState();
  const dustRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  // Create dust particle system
  const dustCount = 100;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustVelocities = new Float32Array(dustCount * 3);
  
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 20;
    dustPositions[i * 3 + 1] = Math.random() * 2;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    
    dustVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
    dustVelocities[i * 3 + 1] = Math.random() * 0.01;
    dustVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
  }

  useFrame((state) => {
    if (!particlesRef.current || gamePhase !== 'playing') return;
    
    const time = state.clock.getElapsedTime();
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    // Animate dust particles
    for (let i = 0; i < dustCount; i++) {
      positions[i * 3] += dustVelocities[i * 3];
      positions[i * 3 + 1] += dustVelocities[i * 3 + 1] + Math.sin(time + i) * 0.001;
      positions[i * 3 + 2] += dustVelocities[i * 3 + 2];
      
      // Reset particles that go too far
      if (Math.abs(positions[i * 3]) > 15 || Math.abs(positions[i * 3 + 2]) > 15) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = Math.random() * 2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* Floating dust particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dustCount}
            array={dustPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#d2b48c"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
      
      {/* Battle impact particles */}
      {players[1].velocity.some(v => Math.abs(v) > 0.1) && (
        <group position={players[1].position}>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[
              (Math.random() - 0.5) * 2,
              Math.random(),
              (Math.random() - 0.5) * 2
            ]}>
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshBasicMaterial 
                color="#d2b48c" 
                transparent 
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {players[2].velocity.some(v => Math.abs(v) > 0.1) && (
        <group position={players[2].position}>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[
              (Math.random() - 0.5) * 2,
              Math.random(),
              (Math.random() - 0.5) * 2
            ]}>
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshBasicMaterial 
                color="#d2b48c" 
                transparent 
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}