import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGameState } from "../../lib/stores/useGameState";
import * as THREE from "three";

export default function CameraEffects() {
  const { camera } = useThree();
  const { gamePhase, lastCollision, players } = useGameState();
  const originalPosition = useRef(new THREE.Vector3(0, 12, 15));
  const shakeIntensity = useRef(0);
  const shakeDecay = useRef(0);

  useEffect(() => {
    // Trigger camera shake on collision
    const timeSinceCollision = Date.now() - lastCollision;
    if (timeSinceCollision < 100) {
      shakeIntensity.current = 0.5;
      shakeDecay.current = 0.95;
    }
  }, [lastCollision]);

  useFrame(({ clock }) => {
    if (gamePhase !== 'playing') return;

    const time = clock.getElapsedTime();
    
    // Apply camera shake
    if (shakeIntensity.current > 0.01) {
      const shakeX = (Math.random() - 0.5) * shakeIntensity.current;
      const shakeY = (Math.random() - 0.5) * shakeIntensity.current;
      const shakeZ = (Math.random() - 0.5) * shakeIntensity.current;
      
      camera.position.set(
        originalPosition.current.x + shakeX,
        originalPosition.current.y + shakeY,
        originalPosition.current.z + shakeZ
      );
      
      shakeIntensity.current *= shakeDecay.current;
    } else {
      // Smooth camera follow
      const player1Pos = new THREE.Vector3(...players[1].position);
      const player2Pos = new THREE.Vector3(...players[2].position);
      const centerPoint = player1Pos.clone().add(player2Pos).multiplyScalar(0.5);
      
      // Dynamic camera positioning based on player positions
      const distance = player1Pos.distanceTo(player2Pos);
      const targetY = 8 + distance * 0.5;
      const targetZ = 12 + distance * 0.3;
      
      camera.position.lerp(
        new THREE.Vector3(centerPoint.x, targetY, targetZ),
        0.02
      );
      camera.lookAt(centerPoint);
    }
  });

  return null;
}