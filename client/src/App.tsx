import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import { useGameState } from "./lib/stores/useGameState";
import "@fontsource/inter";

// Import our game components
import Arena from "./components/game/Arena";
import Player from "./components/game/Player";
import GameUI from "./components/game/GameUI";
import Menu from "./components/game/Menu";
import Lights from "./components/game/Lights";
import SoundManager from "./components/game/SoundManager";
import DynamicSoundManager from "./components/game/DynamicSoundManager";
import CameraEffects from "./components/game/CameraEffects";
import VictoryExplosion from "./components/game/VictoryExplosion";
import ScreenEffects from "./components/game/ScreenEffects";
import AchievementNotification from "./components/game/AchievementNotification";
import TournamentProgress from "./components/game/TournamentProgress";
import { useAchievements } from "./lib/stores/useAchievements";

// Define control keys for the game
enum Controls {
  // Player 1 (WASD)
  p1Forward = 'p1Forward',
  p1Backward = 'p1Backward',
  p1Left = 'p1Left',
  p1Right = 'p1Right',
  // Player 2 (Arrow keys)
  p2Forward = 'p2Forward',
  p2Backward = 'p2Backward',
  p2Left = 'p2Left',
  p2Right = 'p2Right',
  // Game controls
  restart = 'restart',
  escape = 'escape'
}

const keyMap = [
  // Player 1 controls
  { name: Controls.p1Forward, keys: ['KeyW'] },
  { name: Controls.p1Backward, keys: ['KeyS'] },
  { name: Controls.p1Left, keys: ['KeyA'] },
  { name: Controls.p1Right, keys: ['KeyD'] },
  // Player 2 controls
  { name: Controls.p2Forward, keys: ['ArrowUp'] },
  { name: Controls.p2Backward, keys: ['ArrowDown'] },
  { name: Controls.p2Left, keys: ['ArrowLeft'] },
  { name: Controls.p2Right, keys: ['ArrowRight'] },
  // Game controls
  { name: Controls.restart, keys: ['KeyR'] },
  { name: Controls.escape, keys: ['Escape'] },
];

// Main App component
function App() {
  const { gamePhase } = useGameState();
  const { recentUnlocks, markAchievementSeen } = useAchievements();
  const [currentNotification, setCurrentNotification] = useState<any>(null);

  useEffect(() => {
    if (recentUnlocks.length > 0 && !currentNotification) {
      setCurrentNotification(recentUnlocks[0]);
    }
  }, [recentUnlocks, currentNotification]);

  const handleNotificationComplete = () => {
    if (currentNotification) {
      markAchievementSeen(currentNotification.id);
      setCurrentNotification(null);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={keyMap}>
        {gamePhase === 'menu' && <Menu />}

        {(gamePhase === 'playing' || gamePhase === 'ended') && (
          <>
            <Canvas
              shadows
              camera={{
                position: [0, 12, 15],
                fov: 50,
                near: 0.1,
                far: 1000
              }}
              gl={{
                antialias: true,
                powerPreference: "default"
              }}
            >
              <color attach="background" args={["#87ceeb"]} />

              {/* Lighting */}
              <Lights />

              <Suspense fallback={null}>
                {/* Camera effects */}
                <CameraEffects />
                
                {/* Game Arena */}
                <Arena />
                
                {/* Players */}
                <Player playerId={1} />
                <Player playerId={2} />
                
                {/* Victory explosion effect */}
                {gamePhase === 'ended' && (
                  <VictoryExplosion 
                    position={[0, 3, 0]}
                    active={true}
                    color="#ffaa00"
                  />
                )}
                
                {/* Dynamic Sound Management */}
                <DynamicSoundManager />
                
                {/* Screen effects overlay */}
                <ScreenEffects />

                {/* Achievement Notification inside Canvas */}
                <AchievementNotification 
                  achievement={currentNotification}
                  onComplete={handleNotificationComplete}
                />

                {/* Tournament Progress inside Canvas */}
                <TournamentProgress />
              </Suspense>
            </Canvas>
            <GameUI />
          </>
        )}

        <SoundManager />
      </KeyboardControls>
    </div>
  );
}

export default App;
