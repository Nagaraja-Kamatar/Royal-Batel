import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";

export default function RoundEffects() {
  const { gamePhase, players } = useGameState();
  const roundStartRef = useRef<THREE.Group>(null);
  const combatEffectsRef = useRef<THREE.Group>(null);
  const roundTimer = useRef(0);
  const lastRoundStart = useRef(0);
  const roundNumber = useRef(1);
  
  useFrame((state) => {
    if (!roundStartRef.current || !combatEffectsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    roundTimer.current = time;
    
    // Round start effects every 30 seconds
    if (gamePhase === 'playing' && time - lastRoundStart.current > 30) {
      lastRoundStart.current = time;
      roundNumber.current++;
      
      // Flash effect for new round
      if (roundStartRef.current) {
        roundStartRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
            child.material.opacity = 1;
          }
        });
      }
    }
    
    // Fade out round start effects
    if (roundStartRef.current) {
      roundStartRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          child.material.opacity = Math.max(0, child.material.opacity - 0.02);
        }
      });
    }
    
    // Combat intensity effects based on player proximity
    const player1Pos = new THREE.Vector3(...players[1].position);
    const player2Pos = new THREE.Vector3(...players[2].position);
    const distance = player1Pos.distanceTo(player2Pos);
    const intensity = Math.max(0, 1 - (distance / 5)); // Higher intensity when closer
    
    // Dynamic lighting based on combat intensity
    combatEffectsRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.PointLight) {
        child.intensity = 0.5 + intensity * 2;
        child.color.setHSL((time * 0.5 + index * 0.3) % 1, 0.8, 0.6);
      }
      
      if (child instanceof THREE.Mesh) {
        child.rotation.y = time * (0.5 + index * 0.2);
        child.scale.setScalar(0.8 + intensity * 0.4);
      }
    });
  });

  return (
    <group>
      {/* Round start effects */}
      <group ref={roundStartRef}>
        {/* Round indicator rings */}
        <mesh position={[0, 8, 0]}>
          <ringGeometry args={[3, 4, 32]} />
          <meshBasicMaterial 
            color="#ffff00" 
            transparent 
            opacity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2, 3, 16]} />
          <meshBasicMaterial 
            color="#ff4444" 
            transparent 
            opacity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      
      {/* Combat atmosphere effects */}
      <group ref={combatEffectsRef}>
        {/* Arena corner lights */}
        {[
          [6, 6], [-6, 6], [6, -6], [-6, -6]
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <pointLight
              position={[0, 8, 0]}
              intensity={1}
              color="#ff6b6b"
              distance={15}
              decay={2}
            />
            <mesh position={[0, 4, 0]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial 
                color="#ff6b6b" 
                transparent 
                opacity={0.8}
              />
            </mesh>
          </group>
        ))}
        
        {/* Center combat energy */}
        <mesh position={[0, 1, 0]}>
          <torusGeometry args={[1, 0.1, 8, 32]} />
          <meshBasicMaterial 
            color="#4169e1" 
            transparent 
            opacity={0.6}
          />
        </mesh>
        
        {/* Floating combat particles */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 2 + Math.sin(i) * 1;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <mesh key={i} position={[x, 2 + Math.sin(i) * 0.5, z]}>
              <sphereGeometry args={[0.05, 6, 6]} />
              <meshBasicMaterial 
                color={i % 2 === 0 ? "#ff4444" : "#4444ff"} 
                transparent 
                opacity={0.7}
              />
            </mesh>
          );
        })}
      </group>
      
      {/* Round victory effects */}
      {players[1].score > 0 || players[2].score > 0 ? (
        <group position={[0, 5, 0]}>
          {/* Victory burst */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const x = Math.cos(angle) * 3;
            const z = Math.sin(angle) * 3;
            
            return (
              <mesh key={i} position={[x, 0, z]}>
                <cylinderGeometry args={[0.1, 0.1, 2]} />
                <meshBasicMaterial 
                  color="#ffd700" 
                  transparent 
                  opacity={0.8}
                />
              </mesh>
            );
          })}
          
          {/* Score display effect */}
          <mesh>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.2}
              wireframe
            />
          </mesh>
        </group>
      ) : null}
      
      {/* Dynamic arena floor effects */}
      <group position={[0, 0.05, 0]}>
        {/* Energy grid */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 16, 16, 16]} />
          <meshBasicMaterial 
            color="#00ffff" 
            transparent 
            opacity={0.1}
            wireframe
          />
        </mesh>
        
        {/* Combat zones */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3, 5, 32]} />
          <meshBasicMaterial 
            color="#ff00ff" 
            transparent 
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}