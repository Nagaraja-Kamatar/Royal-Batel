import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGameState } from "../../lib/stores/useGameState";
import * as THREE from "three";

export default function ScreenEffects() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gamePhase, lastCollision } = useGameState();

  useFrame(({ clock }) => {
    if (!meshRef.current || gamePhase !== 'playing') return;

    const time = clock.getElapsedTime();
    const timeSinceCollision = Date.now() - lastCollision;
    
    // Screen flash effect on collision
    if (timeSinceCollision < 200) {
      const intensity = Math.max(0, 1 - (timeSinceCollision / 200));
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = intensity * 0.3;
    } else {
      // Subtle breathing effect
      const breathe = 0.05 + Math.sin(time * 0.5) * 0.02;
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = breathe;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 14.9]}>
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial 
        color="#ff4444" 
        transparent 
        opacity={0}
      />
    </mesh>
  );
}