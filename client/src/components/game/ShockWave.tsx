import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ShockWaveProps {
  position: [number, number, number];
  active: boolean;
  color?: string;
  maxRadius?: number;
  duration?: number;
}

export default function ShockWave({ 
  position, 
  active, 
  color = "#00ffff", 
  maxRadius = 4,
  duration = 0.8 
}: ShockWaveProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef<number>(0);

  useEffect(() => {
    if (active) {
      startTime.current = Date.now();
    }
  }, [active]);

  useFrame(() => {
    if (!meshRef.current || !active) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = Math.min(elapsed / duration, 1);

    if (progress >= 1) return;

    // Expand the ring
    const currentRadius = progress * maxRadius;
    meshRef.current.scale.set(currentRadius, 1, currentRadius);

    // Fade out
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.opacity = Math.max(0, 1 - progress);

    // Position the effect
    meshRef.current.position.set(position[0], position[1] + 0.1, position[2]);
  });

  if (!active) return null;

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 1, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}