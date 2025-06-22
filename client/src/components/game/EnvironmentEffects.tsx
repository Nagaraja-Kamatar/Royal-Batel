import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function EnvironmentEffects() {
  const lightningRef = useRef<THREE.PointLight>(null);
  const fogRef = useRef<THREE.Fog>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Lightning effect
    if (lightningRef.current) {
      // Random lightning flashes
      if (Math.random() < 0.001) {
        lightningRef.current.intensity = 20;
        setTimeout(() => {
          if (lightningRef.current) lightningRef.current.intensity = 0;
        }, 100);
      }
    }
    
    // Dynamic fog
    if (fogRef.current) {
      fogRef.current.near = 30 + Math.sin(time * 0.5) * 5;
      fogRef.current.far = 60 + Math.sin(time * 0.3) * 10;
    }
  });

  return (
    <>
      {/* Lightning flash */}
      <pointLight
        ref={lightningRef}
        position={[0, 20, 0]}
        color="#ffffff"
        intensity={0}
        distance={50}
      />
      
      {/* Dynamic fog */}
      <fog attach="fog" args={["#1a1a2e", 30, 60]} />
      
      {/* Ambient particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(Array.from({ length: 200 }, () => [
              (Math.random() - 0.5) * 40,
              Math.random() * 20,
              (Math.random() - 0.5) * 40
            ]).flat())}
            count={200}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#4a9eff"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </>
  );
}