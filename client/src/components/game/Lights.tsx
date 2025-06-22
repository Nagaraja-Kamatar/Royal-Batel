export default function Lights() {
  return (
    <>
      {/* Medieval ambient light */}
      <ambientLight intensity={0.4} color="#ffeaa7" />
      
      {/* Royal sunlight */}
      <directionalLight
        position={[15, 25, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        color="#fff8dc"
      />
      
      {/* Royal spotlight from above */}
      <spotLight
        position={[0, 20, 0]}
        target-position={[0, 0, 0]}
        angle={Math.PI / 4}
        penumbra={0.4}
        intensity={1.8}
        castShadow
        color="#ffd700"
      />
      
      {/* Castle torch lights */}
      <pointLight position={[8, 4, 8]} intensity={0.8} color="#ff6347" distance={20} />
      <pointLight position={[-8, 4, 8]} intensity={0.8} color="#ff6347" distance={20} />
      <pointLight position={[8, 4, -8]} intensity={0.8} color="#ff6347" distance={20} />
      <pointLight position={[-8, 4, -8]} intensity={0.8} color="#ff6347" distance={20} />
      
      {/* Castle wall accent lights */}
      <pointLight position={[0, 8, -18]} intensity={1.0} color="#daa520" distance={25} />
      <pointLight position={[18, 8, 0]} intensity={1.0} color="#daa520" distance={25} />
      <pointLight position={[-18, 8, 0]} intensity={1.0} color="#daa520" distance={25} />
      <pointLight position={[0, 8, 18]} intensity={1.0} color="#daa520" distance={25} />
      
      {/* Medieval atmosphere */}
      <hemisphereLight 
        args={["#4169e1", "#8b4513", 0.6]}
      />
    </>
  );
}
