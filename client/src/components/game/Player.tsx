import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";
import { useAudio } from "../../lib/stores/useAudio";
import { useAchievements } from "../../lib/stores/useAchievements";
import { checkSphereCollision, keepInSquareBounds, resolveCollision } from "../../lib/collision";
import DodgeEffect from "./DodgeEffect";
import ParticleTrail from "./ParticleTrail";
import PowerField from "./PowerField";
import ShockWave from "./ShockWave";
import FloatingText from "./FloatingText";

interface PlayerProps {
  playerId: 1 | 2;
}

export default function Player({ playerId }: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { players, updatePlayerPosition, updatePlayerVelocity, incrementScore, lastCollision, setLastCollision, gamePhase, dodgeEffects, triggerDodgeEffect } = useGameState();
  const { playHit, playDodge } = useAudio();
  const { updateStats } = useAchievements();
  
  const gameMetrics = useRef({
    gameStartTime: 0,
    consecutiveHits: 0,
    consecutiveHitStreak: 0,
    dodgeCount: 0,
    hitCount: 0,
    perfectGame: true,
    wasBehind: false
  });
  const [subscribe, get] = useKeyboardControls();
  
  // Load the knight with sword model for both players
  const { scene } = useGLTF("/models/knight_with_sword.glb");
  
  // Preload the model for better performance
  useGLTF.preload("/models/knight_with_sword.glb");
  
  const player = players[playerId];
  const otherPlayer = players[playerId === 1 ? 2 : 1];
  
  const velocity = useRef(new THREE.Vector3(...player.velocity));
  const position = useRef(new THREE.Vector3(...player.position));
  const lastVelocity = useRef(new THREE.Vector3());
  const lastDodgeTime = useRef(0);
  const shockWaveActive = useRef(false);
  const shockWaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const floatingTextActive = useRef(false);
  const floatingTextTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastFloatingText = useRef("");
  
  // Movement parameters
  const moveSpeed = 0.15;
  const friction = 0.85;
  const arenaCenter = new THREE.Vector3(0, 0.5, 0);
  const arenaSize = 15; // Square arena size (was radius 7.5, now 15x15 square)
  const playerRadius = 0.8; // Slightly larger for avatar collision
  
  useEffect(() => {
    // Reset position when game restarts
    position.current.set(...player.position);
    velocity.current.set(...player.velocity);
    if (groupRef.current) {
      groupRef.current.position.copy(position.current);
    }
  }, [player.position, gamePhase]);

  useFrame((state) => {
    if (!groupRef.current || gamePhase !== 'playing') return;
    
    const controls = get();
    const currentTime = state.clock.getElapsedTime();
    
    // Always face the other player for combat
    const otherPosition = new THREE.Vector3(...otherPlayer.position);
    const directionToOther = otherPosition.clone().sub(position.current).normalize();
    const faceAngle = Math.atan2(directionToOther.x, directionToOther.z);
    
    // Get input based on player ID
    let moveX = 0;
    let moveZ = 0;
    
    if (playerId === 1) {
      if (controls.p1Left) moveX -= 1;
      if (controls.p1Right) moveX += 1;
      if (controls.p1Forward) moveZ -= 1;
      if (controls.p1Backward) moveZ += 1;
    } else {
      if (controls.p2Left) moveX -= 1;
      if (controls.p2Right) moveX += 1;
      if (controls.p2Forward) moveZ -= 1;
      if (controls.p2Backward) moveZ += 1;
    }
    
    // Apply movement with combat orientation
    if (moveX !== 0 || moveZ !== 0) {
      velocity.current.x += moveX * moveSpeed;
      velocity.current.z += moveZ * moveSpeed;
    } else {
      // When no input, slight movement toward opponent to maintain engagement
      if (distanceToOther > 2) {
        const autoEngage = directionToOther.clone().multiplyScalar(0.008);
        velocity.current.add(autoEngage);
      }
    }
    
    // Apply friction
    velocity.current.multiplyScalar(friction);
    
    // Update position
    position.current.add(velocity.current);
    
    // Keep player in arena bounds
    const boundsResult = keepInSquareBounds(position.current, arenaCenter, arenaSize, playerRadius);
    position.current = boundsResult.position;
    
    // Check if player went out of bounds
    if (boundsResult.outOfBounds && currentTime - lastCollision > 1) {
      const otherPlayerId = playerId === 1 ? 2 : 1;
      incrementScore(otherPlayerId);
      playHit();
      
      // Trigger shock wave effect
      shockWaveActive.current = true;
      if (shockWaveTimeout.current) clearTimeout(shockWaveTimeout.current);
      shockWaveTimeout.current = setTimeout(() => {
        shockWaveActive.current = false;
      }, 800);
      
      // Show floating text
      lastFloatingText.current = "OUT!";
      floatingTextActive.current = true;
      if (floatingTextTimeout.current) clearTimeout(floatingTextTimeout.current);
      floatingTextTimeout.current = setTimeout(() => {
        floatingTextActive.current = false;
      }, 2000);
      
      // Reset position and velocity
      const resetPos = playerId === 1 ? [3, 0.5, 0] : [-3, 0.5, 0];
      position.current.set(resetPos[0], resetPos[1], resetPos[2]);
      velocity.current.set(0, 0, 0);
      setLastCollision(currentTime);
    }
    
    // Check for dodge effect - rapid direction change or near miss
    const velocityChange = velocity.current.clone().sub(lastVelocity.current).length();
    const currentSpeed = velocity.current.length();
    
    // Check collision with other player
    const collision = checkSphereCollision(position.current, playerRadius, otherPosition, playerRadius);
    const nearMiss = checkSphereCollision(position.current, playerRadius + 1.5, otherPosition, playerRadius);
    
    // Constant combat engagement - players seek each other when too far apart
    const distanceToOther = position.current.distanceTo(otherPosition);
    if (distanceToOther > 4 && !collision.collided) {
      // Automatic combat engagement - draw players together
      const seekDirection = directionToOther.clone().multiplyScalar(0.015);
      velocity.current.add(seekDirection);
    }
    
    // Trigger dodge effect for rapid movement changes or near misses
    if ((velocityChange > 0.3 || (nearMiss.collided && !collision.collided && currentSpeed > 0.1)) && 
        currentTime - lastDodgeTime.current > 1) {
      const dodgeDirection = velocity.current.clone().normalize();
      triggerDodgeEffect(playerId, [dodgeDirection.x, dodgeDirection.y, dodgeDirection.z]);
      playDodge();
      lastDodgeTime.current = currentTime;
    }
    
    // Store velocity for next frame comparison
    lastVelocity.current.copy(velocity.current);
    
    if (collision.collided && currentTime - lastCollision > 0.5) {
      // Play hit sound
      playHit();
      
      // Trigger shock wave effect
      shockWaveActive.current = true;
      if (shockWaveTimeout.current) clearTimeout(shockWaveTimeout.current);
      shockWaveTimeout.current = setTimeout(() => {
        shockWaveActive.current = false;
      }, 800);
      
      // Show floating text for hit
      lastFloatingText.current = "HIT!";
      floatingTextActive.current = true;
      if (floatingTextTimeout.current) clearTimeout(floatingTextTimeout.current);
      floatingTextTimeout.current = setTimeout(() => {
        floatingTextActive.current = false;
      }, 1500);
      
      // Resolve collision
      const otherVelocity = new THREE.Vector3(...otherPlayer.velocity);
      const { vel1: newVel1, vel2: newVel2 } = resolveCollision(
        position.current,
        velocity.current,
        1, // mass
        otherPosition,
        otherVelocity,
        1, // mass
        0.9 // restitution
      );
      
      // Apply new velocities
      velocity.current.copy(newVel1);
      
      // Separate players to prevent overlap
      if (collision.normal && collision.penetration) {
        const separation = collision.normal.clone().multiplyScalar(collision.penetration * 0.5);
        position.current.sub(separation);
      }
      
      // Award point to the player who initiated the collision (higher velocity)
      const vel1Magnitude = velocity.current.length();
      const vel2Magnitude = otherVelocity.length();
      
      if (vel1Magnitude > vel2Magnitude + 0.1) {
        incrementScore(playerId);
      } else if (vel2Magnitude > vel1Magnitude + 0.1) {
        incrementScore(playerId === 1 ? 2 : 1);
      }
      
      // Enhanced combat engagement after collision
      if (distanceToOther > 2.5) {
        // Aggressive re-engagement after collision
        const engageDirection = directionToOther.clone().multiplyScalar(0.025);
        velocity.current.add(engageDirection);
      }
      
      setLastCollision(currentTime);
    }
    
    // Update group position and rotation to face opponent
    groupRef.current.position.copy(position.current);
    groupRef.current.rotation.y = faceAngle;
    
    // Update game state
    updatePlayerPosition(playerId, [position.current.x, position.current.y, position.current.z]);
    updatePlayerVelocity(playerId, [velocity.current.x, velocity.current.y, velocity.current.z]);
  });

  // Clone the scene to avoid sharing between instances
  const clonedScene = scene.clone();
  
  // Scale the knight character larger for better visibility
  clonedScene.scale.setScalar(4.2);
  
  // Ensure the avatar has proper materials and colors
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      
      // Apply player color tint to the materials
      if (child.material) {
        const material = child.material.clone();
        if (material instanceof THREE.MeshStandardMaterial) {
          // Tint the material with player color
          const playerColorHex = new THREE.Color(player.color);
          material.emissive = playerColorHex;
          material.emissiveIntensity = 0.3;
        }
        child.material = material;
      }
    }
  });

  // Calculate movement intensity for effects
  const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.z ** 2);
  const movementIntensity = Math.min(speed / 0.3, 1);

  return (
    <>
      <group ref={groupRef} position={player.position}>
        <primitive object={clonedScene} position={[0, 0, 0]} />
      </group>
      
      {/* Power field under player */}
      <PowerField 
        playerPosition={player.position}
        playerColor={player.color}
        intensity={movementIntensity}
      />
      
      {/* Particle trail when moving */}
      <ParticleTrail 
        playerPosition={player.position}
        playerVelocity={player.velocity}
        playerColor={player.color}
        active={gamePhase === "playing" && speed > 0.05}
      />
      
      {/* Dodge effect */}
      <DodgeEffect 
        playerId={playerId}
        active={dodgeEffects[playerId].active}
        direction={dodgeEffects[playerId].direction}
        playerPosition={player.position}
        playerColor={player.color}
      />
      
      {/* Shock wave effect */}
      <ShockWave 
        position={player.position}
        active={shockWaveActive.current}
        color={player.color}
      />
      
      {/* Floating text */}
      <FloatingText 
        text={lastFloatingText.current}
        position={[player.position[0], player.position[1] + 1, player.position[2]]}
        active={floatingTextActive.current}
        color={player.color}
        size={0.8}
      />
    </>
  );
}
