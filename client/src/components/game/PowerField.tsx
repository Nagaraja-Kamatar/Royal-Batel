import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PowerFieldProps {
  playerPosition: [number, number, number];
  playerColor: string;
  intensity: number;
}

export default function PowerField({ playerPosition, playerColor, intensity }: PowerFieldProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.getElapsedTime();
    
    // Pulsing effect
    const pulse = 0.8 + Math.sin(time * 4) * 0.2;
    const scale = 1 + intensity * 0.5;
    meshRef.current.scale.set(scale * pulse, 0.1, scale * pulse);

    // Rotation
    meshRef.current.rotation.y = time * 0.5;

    // Position
    meshRef.current.position.set(
      playerPosition[0], 
      playerPosition[1] - 0.3, 
      playerPosition[2]
    );

    // Material opacity based on intensity
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.opacity = intensity * 0.3;
  });

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[1, 1, 0.1, 16]} />
      <meshStandardMaterial
        color={playerColor}
        emissive={playerColor}
        emissiveIntensity={0.3}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}