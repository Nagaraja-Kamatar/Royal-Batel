import { useRef, Suspense, useCallback } from "react";
import { useTexture, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import WarpEffect from "./WarpEffect";
import EnvironmentEffects from "./EnvironmentEffects";
import AnimatedCrowd from "./AnimatedCrowd";
import RealisticAudience from "./RealisticAudience";
import CrowdSynchronizer from "./CrowdSynchronizer";
import CrowdReactionManager from "./CrowdReactionManager";
import CrowdWave from "./CrowdWave";
import Stadium from "./Stadium";

export default function Arena() {
  const meshRef = useRef<THREE.Mesh>(null);
  const asphaltTexture = useTexture("/textures/asphalt.png");
  const sandTexture = useTexture("/textures/sand.jpg");
  const grassTexture = useTexture("/textures/grass.png");
  
  const handleCrowdSync = useCallback((crowdId: string, syncData: {
    intensity: number;
    wavePhase: number;
    bounceAmplitude: number;
    colorIntensity: number;
  }) => {
    // Sync data will be handled by individual AnimatedCrowd components
    // This callback ensures the synchronizer can communicate with crowds
  }, []);

  const handleReactionTrigger = useCallback((reaction: {
    type: 'cheer' | 'gasp' | 'wave' | 'stomp';
    intensity: number;
    duration: number;
    crowdSections: string[];
  }) => {
    // Broadcast reaction to all specified crowd sections
    console.log(`Crowd reaction: ${reaction.type} with intensity ${reaction.intensity}`);
  }, []);

  // Define crowd positions for wave effects - Enhanced with more audience
  const crowdPositions = [
    // Main Arena Stands - Closest to battle ground (Multiple rows)
    { position: [0, 2, -12] as [number, number, number], crowdId: 'north-main-close' },
    { position: [3, 2, -12] as [number, number, number], crowdId: 'north-main-close-right' },
    { position: [-3, 2, -12] as [number, number, number], crowdId: 'north-main-close-left' },
    { position: [12, 2, 0] as [number, number, number], crowdId: 'east-main-close' },
    { position: [12, 2, 3] as [number, number, number], crowdId: 'east-main-close-right' },
    { position: [12, 2, -3] as [number, number, number], crowdId: 'east-main-close-left' },
    { position: [-12, 2, 0] as [number, number, number], crowdId: 'west-main-close' },
    { position: [-12, 2, 3] as [number, number, number], crowdId: 'west-main-close-right' },
    { position: [-12, 2, -3] as [number, number, number], crowdId: 'west-main-close-left' },
    { position: [0, 2, 12] as [number, number, number], crowdId: 'south-main-close' },
    { position: [3, 2, 12] as [number, number, number], crowdId: 'south-main-close-right' },
    { position: [-3, 2, 12] as [number, number, number], crowdId: 'south-main-close-left' },
    
    // Second Row - Behind first row
    { position: [0, 3.5, -15] as [number, number, number], crowdId: 'north-second-row' },
    { position: [4, 3.5, -15] as [number, number, number], crowdId: 'north-second-row-right' },
    { position: [-4, 3.5, -15] as [number, number, number], crowdId: 'north-second-row-left' },
    { position: [15, 3.5, 0] as [number, number, number], crowdId: 'east-second-row' },
    { position: [15, 3.5, 4] as [number, number, number], crowdId: 'east-second-row-right' },
    { position: [15, 3.5, -4] as [number, number, number], crowdId: 'east-second-row-left' },
    { position: [-15, 3.5, 0] as [number, number, number], crowdId: 'west-second-row' },
    { position: [-15, 3.5, 4] as [number, number, number], crowdId: 'west-second-row-right' },
    { position: [-15, 3.5, -4] as [number, number, number], crowdId: 'west-second-row-left' },
    { position: [0, 3.5, 15] as [number, number, number], crowdId: 'south-second-row' },
    { position: [4, 3.5, 15] as [number, number, number], crowdId: 'south-second-row-right' },
    { position: [-4, 3.5, 15] as [number, number, number], crowdId: 'south-second-row-left' },
    
    // Third Row - Upper tier
    { position: [0, 5, -18] as [number, number, number], crowdId: 'north-third-row' },
    { position: [5, 5, -18] as [number, number, number], crowdId: 'north-third-row-right' },
    { position: [-5, 5, -18] as [number, number, number], crowdId: 'north-third-row-left' },
    { position: [18, 5, 0] as [number, number, number], crowdId: 'east-third-row' },
    { position: [18, 5, 5] as [number, number, number], crowdId: 'east-third-row-right' },
    { position: [18, 5, -5] as [number, number, number], crowdId: 'east-third-row-left' },
    { position: [-18, 5, 0] as [number, number, number], crowdId: 'west-third-row' },
    { position: [-18, 5, 5] as [number, number, number], crowdId: 'west-third-row-right' },
    { position: [-18, 5, -5] as [number, number, number], crowdId: 'west-third-row-left' },
    { position: [0, 5, 18] as [number, number, number], crowdId: 'south-third-row' },
    { position: [5, 5, 18] as [number, number, number], crowdId: 'south-third-row-right' },
    { position: [-5, 5, 18] as [number, number, number], crowdId: 'south-third-row-left' },
    
    // Corner Sections - Multiple positions
    { position: [13, 3, -13] as [number, number, number], crowdId: 'northeast-corner' },
    { position: [16, 4, -16] as [number, number, number], crowdId: 'northeast-corner-upper' },
    { position: [-13, 3, -13] as [number, number, number], crowdId: 'northwest-corner' },
    { position: [-16, 4, -16] as [number, number, number], crowdId: 'northwest-corner-upper' },
    { position: [13, 3, 13] as [number, number, number], crowdId: 'southeast-corner' },
    { position: [16, 4, 16] as [number, number, number], crowdId: 'southeast-corner-upper' },
    { position: [-13, 3, 13] as [number, number, number], crowdId: 'southwest-corner' },
    { position: [-16, 4, 16] as [number, number, number], crowdId: 'southwest-corner-upper' },
    
    // VIP Sections - Premium viewing areas with more seats
    { position: [8, 4, -10] as [number, number, number], crowdId: 'north-vip-left' },
    { position: [-8, 4, -10] as [number, number, number], crowdId: 'north-vip-right' },
    { position: [10, 4, 8] as [number, number, number], crowdId: 'south-vip-left' },
    { position: [-10, 4, 8] as [number, number, number], crowdId: 'south-vip-right' },
    { position: [6, 4, -8] as [number, number, number], crowdId: 'north-vip-center-left' },
    { position: [-6, 4, -8] as [number, number, number], crowdId: 'north-vip-center-right' },
    
    // Distant Stadium Crowds - Background atmosphere
    { position: [0, 1.5, -25] as [number, number, number], crowdId: 'north-distant' },
    { position: [25, 1.5, 0] as [number, number, number], crowdId: 'east-distant' },
    { position: [-25, 1.5, 0] as [number, number, number], crowdId: 'west-distant' },
    { position: [0, 1.5, 25] as [number, number, number], crowdId: 'south-distant' }
  ];
  
  // Load royal battle arena models
  const { scene: arenaFloor } = useGLTF("/models/royal_arena_floor.glb");
  const { scene: castleWalls } = useGLTF("/models/castle_walls.glb");
  
  // Load additional royal battle models
  const { scene: tournamentPavilions } = useGLTF("/models/tournament_pavilions.glb");
  const { scene: cheeringCrowd } = useGLTF("/models/cheering_crowd.glb");
  const { scene: stadiumCrowd } = useGLTF("/models/stadium_crowd.glb");
  
  // Preload models for better performance
  useGLTF.preload("/models/royal_arena_floor.glb");
  useGLTF.preload("/models/castle_walls.glb");
  useGLTF.preload("/models/tournament_pavilions.glb");
  useGLTF.preload("/models/cheering_crowd.glb");
  useGLTF.preload("/models/stadium_crowd.glb");
  
  // Configure arena floor texture
  asphaltTexture.wrapS = asphaltTexture.wrapT = THREE.RepeatWrapping;
  asphaltTexture.repeat.set(4, 4);
  
  // Configure ground textures
  sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
  sandTexture.repeat.set(8, 8);
  
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(12, 12);

  return (
    <group>
      {/* Stadium Structure */}
      <Stadium />

      {/* Large medieval countryside extending beyond arena */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial map={grassTexture} color="#3a5f3a" />
      </mesh>
      
      {/* Royal tournament ground around arena */}
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[35, 35, 0.02]} />
        <meshStandardMaterial map={sandTexture} color="#c19a6b" />
      </mesh>
      
      {/* Royal Arena Floor */}
      <Suspense fallback={
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <boxGeometry args={[16, 16, 0.2]} />
          <meshStandardMaterial map={asphaltTexture} />
        </mesh>
      }>
        <primitive 
          object={arenaFloor.clone()} 
          scale={[5, 2, 5]} 
          position={[0, 0, 0]}
          receiveShadow
          castShadow
        />
      </Suspense>
      
      {/* Arena wall (invisible collision boundary) */}
      <mesh position={[0, 2, 0]} visible={false}>
        <boxGeometry args={[16, 4, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Visible arena boundary walls */}
      {/* North wall */}
      <mesh position={[0, 0.5, 8]} castShadow receiveShadow>
        <boxGeometry args={[16.2, 1, 0.2]} />
        <meshStandardMaterial 
          color="#666666" 
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      {/* South wall */}
      <mesh position={[0, 0.5, -8]} castShadow receiveShadow>
        <boxGeometry args={[16.2, 1, 0.2]} />
        <meshStandardMaterial 
          color="#666666" 
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      {/* East wall */}
      <mesh position={[8, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 1, 16]} />
        <meshStandardMaterial 
          color="#666666" 
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      {/* West wall */}
      <mesh position={[-8, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 1, 16]} />
        <meshStandardMaterial 
          color="#666666" 
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* Arena boundary lines - outer square */}
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.8, 8.2, 4]} />
        <meshStandardMaterial 
          color="#ff4444" 
          emissive="#ff2222"
          emissiveIntensity={0.3}
          transparent 
          opacity={0.8} 
        />
      </mesh>
      
      {/* Warning zone lines - inner square */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.0, 7.6, 4]} />
        <meshStandardMaterial 
          color="#ffaa00" 
          emissive="#ff8800"
          emissiveIntensity={0.2}
          transparent 
          opacity={0.4} 
        />
      </mesh>
      
      {/* Center square */}
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[2, 2, 0.01]} />
        <meshStandardMaterial 
          color="#00ff00" 
          emissive="#00aa00"
          emissiveIntensity={0.3}
          transparent 
          opacity={0.6} 
        />
      </mesh>
      
      {/* Medieval sky dome for royal battle atmosphere */}
      <mesh position={[0, 0, 0]} scale={[50, 50, 50]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial 
          color="#4169e1" 
          side={THREE.BackSide}
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Castle Walls Background - Larger and More Visible */}
      <Suspense fallback={null}>
        <primitive 
          object={castleWalls.clone()} 
          scale={[6, 6, 6]} 
          position={[0, 0, -25]}
          castShadow
        />
      </Suspense>
      
      {/* Additional castle walls around the arena */}
      <Suspense fallback={null}>
        <primitive 
          object={castleWalls.clone()} 
          scale={[6, 6, 6]} 
          position={[25, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          castShadow
        />
      </Suspense>
      
      <Suspense fallback={null}>
        <primitive 
          object={castleWalls.clone()} 
          scale={[6, 6, 6]} 
          position={[-25, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          castShadow
        />
      </Suspense>
      
      <Suspense fallback={null}>
        <primitive 
          object={castleWalls.clone()} 
          scale={[6, 6, 6]} 
          position={[0, 0, 25]}
          rotation={[0, Math.PI, 0]}
          castShadow
        />
      </Suspense>

      {/* Tournament Pavilions - Larger and More Prominent */}
      <Suspense fallback={null}>
        <primitive 
          object={tournamentPavilions.clone()} 
          scale={[4, 4, 4]} 
          position={[18, 0, 18]}
          castShadow
        />
      </Suspense>
      
      <Suspense fallback={null}>
        <primitive 
          object={tournamentPavilions.clone()} 
          scale={[4, 4, 4]} 
          position={[-18, 0, 18]}
          rotation={[0, -Math.PI / 2, 0]}
          castShadow
        />
      </Suspense>
      
      <Suspense fallback={null}>
        <primitive 
          object={tournamentPavilions.clone()} 
          scale={[4, 4, 4]} 
          position={[18, 0, -18]}
          rotation={[0, Math.PI / 2, 0]}
          castShadow
        />
      </Suspense>
      
      <Suspense fallback={null}>
        <primitive 
          object={tournamentPavilions.clone()} 
          scale={[4, 4, 4]} 
          position={[-18, 0, -18]}
          rotation={[0, Math.PI, 0]}
          castShadow
        />
      </Suspense>

      {/* Crowd positioned on stadium tiers */}
      {/* Tier 1 */}
      {/*
      <Suspense fallback={null}>
        <AnimatedCrowd position={[0, 2.5, -14]} rotation={[0, 0, 0]} scale={[15, 15, 15]} crowdId="tier1-north" />
        <AnimatedCrowd position={[0, 2.5, 14]} rotation={[0, Math.PI, 0]} scale={[15, 15, 15]} crowdId="tier1-south" />
        <AnimatedCrowd position={[-14, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} scale={[15, 15, 15]} crowdId="tier1-west" />
        <AnimatedCrowd position={[14, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[15, 15, 15]} crowdId="tier1-east" />
      </Suspense>
      */}

      {/* Tier 2 */}
      {/*
      <Suspense fallback={null}>
        <AnimatedCrowd position={[0, 5, -18]} rotation={[0, 0, 0]} scale={[12, 12, 12]} crowdId="tier2-north" />
        <AnimatedCrowd position={[0, 5, 18]} rotation={[0, Math.PI, 0]} scale={[12, 12, 12]} crowdId="tier2-south" />
        <AnimatedCrowd position={[-18, 5, 0]} rotation={[0, Math.PI / 2, 0]} scale={[12, 12, 12]} crowdId="tier2-west" />
        <AnimatedCrowd position={[18, 5, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[12, 12, 12]} crowdId="tier2-east" />
      </Suspense>
      */}

      {/* Tier 3 */}
      {/*
      <Suspense fallback={null}>
        <AnimatedCrowd position={[0, 7.5, -22]} rotation={[0, 0, 0]} scale={[10, 10, 10]} crowdId="tier3-north" />
        <AnimatedCrowd position={[0, 7.5, 22]} rotation={[0, Math.PI, 0]} scale={[10, 10, 10]} crowdId="tier3-south" />
        <AnimatedCrowd position={[-22, 7.5, 0]} rotation={[0, Math.PI / 2, 0]} scale={[10, 10, 10]} crowdId="tier3-west" />
        <AnimatedCrowd position={[22, 7.5, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[10, 10, 10]} crowdId="tier3-east" />
      </Suspense>
      */}

      {/* Tier 4 */}
      {/*
      <Suspense fallback={null}>
        <AnimatedCrowd position={[0, 10, -26]} rotation={[0, 0, 0]} scale={[8, 8, 8]} crowdId="tier4-north" />
        <AnimatedCrowd position={[0, 10, 26]} rotation={[0, Math.PI, 0]} scale={[8, 8, 8]} crowdId="tier4-south" />
        <AnimatedCrowd position={[-26, 10, 0]} rotation={[0, Math.PI / 2, 0]} scale={[8, 8, 8]} crowdId="tier4-west" />
        <AnimatedCrowd position={[26, 10, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 8, 8]} crowdId="tier4-east" />
      </Suspense>
      */}
      
      {/* Multiple Crowd Sections - Realistic Tournament Atmosphere */}
      <Suspense fallback={null}>
        {crowdPositions.map((crowd, index) => (
          <RealisticAudience 
            key={crowd.crowdId}
            position={crowd.position}
            rotation={[0, 0, 0]} // Rotation handled internally to face arena
            scale={[
              1.2 + Math.random() * 0.4, 
              1.2 + Math.random() * 0.4, 
              1.2 + Math.random() * 0.4
            ]}
            crowdId={crowd.crowdId}
          />
        ))}
      </Suspense>
      
      {/* Royal tournament banners at corners - Larger and More Visible */}
      {[
        [15, 15], [-15, 15], [15, -15], [-15, -15]
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Banner pole */}
          <mesh position={[0, 6, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.2, 12]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Royal banner */}
          <mesh position={[1, 9, 0]} castShadow>
            <planeGeometry args={[3, 4]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#4169e1" : "#dc143c"} 
              transparent 
              opacity={0.9}
            />
          </mesh>
          {/* Banner decoration */}
          <mesh position={[1, 9, 0.1]} castShadow>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial 
              color="#ffd700" 
              transparent 
              opacity={0.8}
            />
          </mesh>
        </group>
      ))}
      
      {/* Royal Battle Banners Along Arena Sides */}
      {[
        // North side banners
        [-6, 1.5, 9], [0, 1.5, 9], [6, 1.5, 9],
        // South side banners
        [-6, 1.5, -9], [0, 1.5, -9], [6, 1.5, -9],
        // East side banners
        [9, 1.5, -6], [9, 1.5, 0], [9, 1.5, 6],
        // West side banners
        [-9, 1.5, -6], [-9, 1.5, 0], [-9, 1.5, 6]
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          {/* Banner pole */}
          <mesh position={[0, 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.05, 0.05, 4]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Royal banner */}
          <mesh position={[0.3, 3, 0]} castShadow>
            <planeGeometry args={[0.8, 1.2]} />
            <meshStandardMaterial 
              color={i % 3 === 0 ? "#4169e1" : i % 3 === 1 ? "#dc143c" : "#ffd700"} 
              transparent 
              opacity={0.9}
            />
          </mesh>
          {/* Royal crest */}
          <mesh position={[0.3, 3, 0.05]} castShadow>
            <planeGeometry args={[0.3, 0.3]} />
            <meshStandardMaterial 
              color="#ffd700" 
              transparent 
              opacity={0.8}
            />
          </mesh>
          {/* Torch light */}
          <pointLight
            position={[0, 4, 0]}
            intensity={0.8}
            color="#ff6347"
            distance={8}
          />
        </group>
      ))}

      {/* Large Royal Flags at Arena Entrance */}
      <group position={[0, 0, -12]}>
        {/* Left entrance flag */}
        <group position={[-4, 0, 0]}>
          <mesh position={[0, 5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.15, 0.15, 10]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[1, 7, 0]} castShadow>
            <planeGeometry args={[3, 4]} />
            <meshStandardMaterial color="#4169e1" transparent opacity={0.9} />
          </mesh>
          <mesh position={[1, 7, 0.1]} castShadow>
            <planeGeometry args={[1.5, 1.5]} />
            <meshStandardMaterial color="#ffd700" transparent opacity={0.8} />
          </mesh>
        </group>
        
        {/* Right entrance flag */}
        <group position={[4, 0, 0]}>
          <mesh position={[0, 5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.15, 0.15, 10]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[-1, 7, 0]} castShadow>
            <planeGeometry args={[3, 4]} />
            <meshStandardMaterial color="#dc143c" transparent opacity={0.9} />
          </mesh>
          <mesh position={[-1, 7, 0.1]} castShadow>
            <planeGeometry args={[1.5, 1.5]} />
            <meshStandardMaterial color="#ffd700" transparent opacity={0.8} />
          </mesh>
        </group>
      </group>
      
      {/* Crowd Synchronization System */}
      <CrowdSynchronizer onCrowdSync={handleCrowdSync} />
      
      {/* Crowd Reaction Management */}
      <CrowdReactionManager onReactionTrigger={handleReactionTrigger} />
      
      {/* Crowd Wave Effects */}
      <CrowdWave crowdPositions={crowdPositions} />
      
      {/* Background warp effect */}
      <WarpEffect />
      
      {/* Environment effects */}
      <EnvironmentEffects />
    </group>
  );
}
