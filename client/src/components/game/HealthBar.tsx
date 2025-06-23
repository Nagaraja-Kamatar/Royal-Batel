import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HealthBarProps {
  position: [number, number, number];
  health: number;
  maxHealth: number;
  playerColor: string;
}

export default function HealthBar({ position, health, maxHealth, playerColor }: HealthBarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const healthBarRef = useRef<THREE.Mesh>(null);
  
  const healthPercentage = health / maxHealth;
  const barWidth = 2;
  const barHeight = 0.2;
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    // Always face the camera
    groupRef.current.lookAt(0, 15, 15);
    
    // Update health bar width
    if (healthBarRef.current) {
      healthBarRef.current.scale.x = healthPercentage;
      
      // Change color based on health
      if (healthBarRef.current.material instanceof THREE.MeshBasicMaterial) {
        if (healthPercentage > 0.6) {
          healthBarRef.current.material.color.setHex(0x00ff00); // Green
        } else if (healthPercentage > 0.3) {
          healthBarRef.current.material.color.setHex(0xffff00); // Yellow
        } else {
          healthBarRef.current.material.color.setHex(0xff0000); // Red
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[position[0], position[1] + 3, position[2]]}>
      {/* Health bar background */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[barWidth, barHeight]} />
        <meshBasicMaterial color="#333333" transparent opacity={0.8} />
      </mesh>
      
      {/* Health bar fill */}
      <mesh ref={healthBarRef} position={[-barWidth / 2 * (1 - healthPercentage), 0, 0.01]}>
        <planeGeometry args={[barWidth, barHeight]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.9} />
      </mesh>
      
      {/* Health bar border */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[barWidth + 0.1, barHeight + 0.1]} />
        <meshBasicMaterial color={playerColor} transparent opacity={0.6} wireframe />
      </mesh>
      
      {/* Health text */}
      <mesh position={[0, 0.4, 0]}>
        <planeGeometry args={[1, 0.3]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}