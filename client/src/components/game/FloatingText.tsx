import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface FloatingTextProps {
  text: string;
  position: [number, number, number];
  active: boolean;
  color?: string;
  size?: number;
  duration?: number;
}

export default function FloatingText({ 
  text, 
  position, 
  active, 
  color = "#ffffff",
  size = 1,
  duration = 2
}: FloatingTextProps) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef<number>(0);

  useEffect(() => {
    if (active) {
      startTime.current = Date.now();
    }
  }, [active]);

  useFrame(({ camera }) => {
    if (!groupRef.current || !active) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = Math.min(elapsed / duration, 1);

    if (progress >= 1) return;

    // Float upward
    const currentY = position[1] + progress * 3;
    groupRef.current.position.set(position[0], currentY, position[2]);

    // Scale effect
    const scale = Math.max(0.1, 1 + Math.sin(progress * Math.PI) * 0.3);
    groupRef.current.scale.setScalar(scale);

    // Always face camera
    groupRef.current.lookAt(camera.position);
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      <Text
        fontSize={size}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {text}
      </Text>
    </group>
  );
}