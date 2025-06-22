import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const tierHeight = 2.5;
const tierDepth = 4;
const tierLevels = 4;

const StadiumTier = ({ level, rotationY = 0 }) => {
  const woodTexture = useTexture("/textures/wood.jpg");
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(10, 1);

  const tierWidth = 60 + level * tierDepth * 2;
  const positionY = level * tierHeight;
  const positionZ = 12 + level * tierDepth;

  return (
    <group rotation-y={rotationY}>
      <mesh
        position={[0, positionY, positionZ]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[tierWidth, tierHeight, tierDepth]} />
        <meshStandardMaterial map={woodTexture} roughness={0.7} />
      </mesh>
      <mesh
        position={[0, positionY + tierHeight / 2, positionZ + tierDepth / 2]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[tierWidth, tierHeight, 0.2]} />
        <meshStandardMaterial color="#545454" />
      </mesh>
    </group>
  );
};

const Stadium = () => {
  return (
    <group>
      {Array.from({ length: tierLevels }).map((_, i) => (
        <StadiumTier key={`tier-north-${i}`} level={i} />
      ))}
      {Array.from({ length: tierLevels }).map((_, i) => (
        <StadiumTier key={`tier-south-${i}`} level={i} rotationY={Math.PI} />
      ))}
      {Array.from({ length: tierLevels }).map((_, i) => (
        <StadiumTier key={`tier-east-${i}`} level={i} rotationY={-Math.PI / 2} />
      ))}
      {Array.from({ length: tierLevels }).map((_, i) => (
        <StadiumTier key={`tier-west-${i}`} level={i} rotationY={Math.PI / 2} />
      ))}
    </group>
  );
};

export default Stadium; 