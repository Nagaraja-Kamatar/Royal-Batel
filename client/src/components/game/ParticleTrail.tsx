import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleTrailProps {
  playerPosition: [number, number, number];
  playerVelocity: [number, number, number];
  playerColor: string;
  active: boolean;
}

export default function ParticleTrail({ playerPosition, playerVelocity, playerColor, active }: ParticleTrailProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particles = useRef<Array<{
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
  }>>([]);
  const meshes = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (!groupRef.current) return;

    // Create particle meshes
    const particleCount = 20;
    meshes.current = [];
    
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const material = new THREE.MeshStandardMaterial({
        color: playerColor,
        emissive: playerColor,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      groupRef.current.add(mesh);
      meshes.current.push(mesh);
    }

    particles.current = Array(particleCount).fill(null).map(() => ({
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 1
    }));

  }, [playerColor]);

  useFrame(() => {
    if (!active || !groupRef.current) return;

    const speed = Math.sqrt(playerVelocity[0] ** 2 + playerVelocity[2] ** 2);
    
    // Only create trail if player is moving
    if (speed > 0.01) {
      // Add new particle
      const oldestParticle = particles.current.reduce((oldest, particle, index) => 
        particle.life > particles.current[oldest].life ? oldest : index, 0
      );

      const particle = particles.current[oldestParticle];
      particle.position.set(
        playerPosition[0] + (Math.random() - 0.5) * 0.3,
        playerPosition[1] + Math.random() * 0.2,
        playerPosition[2] + (Math.random() - 0.5) * 0.3
      );
      particle.velocity.set(
        -playerVelocity[0] * 0.5 + (Math.random() - 0.5) * 0.1,
        Math.random() * 0.05,
        -playerVelocity[2] * 0.5 + (Math.random() - 0.5) * 0.1
      );
      particle.life = 0;
      particle.maxLife = 0.8 + Math.random() * 0.4;
    }

    // Update particles
    particles.current.forEach((particle, index) => {
      if (particle.life < particle.maxLife) {
        particle.life += 0.016;
        particle.position.add(particle.velocity.clone().multiplyScalar(0.016));
        particle.velocity.multiplyScalar(0.95); // Air resistance

        const mesh = meshes.current[index];
        if (mesh) {
          mesh.position.copy(particle.position);
          const alpha = Math.max(0, 1 - (particle.life / particle.maxLife));
          (mesh.material as THREE.MeshStandardMaterial).opacity = alpha * 0.8;
          mesh.scale.setScalar(alpha);
        }
      }
    });
  });

  return <group ref={groupRef} />;
}