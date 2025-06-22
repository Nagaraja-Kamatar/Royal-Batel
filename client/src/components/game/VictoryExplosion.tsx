import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface VictoryExplosionProps {
  position: [number, number, number];
  active: boolean;
  color: string;
}

export default function VictoryExplosion({ position, active, color }: VictoryExplosionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef<number>(0);
  const particles = useRef<Array<{
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
    size: number;
  }>>([]);
  const meshes = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (active) {
      startTime.current = Date.now();
      
      if (!groupRef.current) return;

      // Clear existing meshes
      meshes.current.forEach(mesh => {
        groupRef.current?.remove(mesh);
      });
      meshes.current = [];

      // Create explosion particles
      const particleCount = 50;
      particles.current = [];
      
      for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 1,
          transparent: true
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        groupRef.current.add(mesh);
        meshes.current.push(mesh);

        // Random explosion direction
        const angle = (i / particleCount) * Math.PI * 2;
        const elevation = (Math.random() - 0.5) * Math.PI;
        const speed = 5 + Math.random() * 10;
        
        particles.current.push({
          position: new THREE.Vector3(position[0], position[1], position[2]),
          velocity: new THREE.Vector3(
            Math.cos(angle) * Math.cos(elevation) * speed,
            Math.sin(elevation) * speed,
            Math.sin(angle) * Math.cos(elevation) * speed
          ),
          life: 0,
          maxLife: 2 + Math.random() * 2,
          size: 0.1 + Math.random() * 0.2
        });
      }
    }
  }, [active, position, color]);

  useFrame(() => {
    if (!active || !groupRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;

    particles.current.forEach((particle, index) => {
      if (particle.life < particle.maxLife) {
        particle.life += 0.016;
        
        // Update position
        particle.position.add(particle.velocity.clone().multiplyScalar(0.016));
        
        // Apply gravity and air resistance
        particle.velocity.y -= 0.2;
        particle.velocity.multiplyScalar(0.98);

        const mesh = meshes.current[index];
        if (mesh) {
          mesh.position.copy(particle.position);
          
          // Fade and scale
          const progress = particle.life / particle.maxLife;
          const alpha = Math.max(0, 1 - progress);
          const scale = particle.size * (1 + progress * 2);
          
          (mesh.material as THREE.MeshStandardMaterial).opacity = alpha;
          mesh.scale.setScalar(scale);
        }
      }
    });
  });

  return <group ref={groupRef} />;
}