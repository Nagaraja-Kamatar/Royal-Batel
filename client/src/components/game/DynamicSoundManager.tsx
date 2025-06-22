import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";
import { useAudio } from "../../lib/stores/useAudio";

interface SoundContext {
  gamePhase: 'menu' | 'playing' | 'ended';
  score: { p1: number; p2: number };
  intensity: number;
  crowdExcitement: number;
  combatTension: number;
}

export default function DynamicSoundManager() {
  const { gamePhase, players, lastCollision } = useGameState();
  const { isMuted } = useAudio();
  
  const soundContext = useRef<SoundContext>({
    gamePhase: 'menu',
    score: { p1: 0, p2: 0 },
    intensity: 0,
    crowdExcitement: 0,
    combatTension: 0
  });

  const audioElements = useRef({
    ambientCrowd: null as HTMLAudioElement | null,
    tensionDrums: null as HTMLAudioElement | null,
    victoryFanfare: null as HTMLAudioElement | null,
    combatIntensity: null as HTMLAudioElement | null,
    medievalHorns: null as HTMLAudioElement | null
  });

  const contextualSounds = useRef({
    lastCollisionTime: 0,
    combatIntensity: 0,
    crowdBuildUp: 0,
    tensionLevel: 0,
    victoryMoment: false
  });

  // Initialize contextual audio elements
  useEffect(() => {
    const initializeAudio = () => {
      try {
        // Ambient crowd chatter
        audioElements.current.ambientCrowd = new Audio();
        audioElements.current.ambientCrowd.loop = true;
        audioElements.current.ambientCrowd.volume = 0.3;
        
        // Tension building drums
        audioElements.current.tensionDrums = new Audio();
        audioElements.current.tensionDrums.loop = true;
        audioElements.current.tensionDrums.volume = 0;
        
        // Victory fanfare
        audioElements.current.victoryFanfare = new Audio();
        audioElements.current.victoryFanfare.volume = 0.6;
        
        // Combat intensity layer
        audioElements.current.combatIntensity = new Audio();
        audioElements.current.combatIntensity.loop = true;
        audioElements.current.combatIntensity.volume = 0;
        
        // Medieval horns for dramatic moments
        audioElements.current.medievalHorns = new Audio();
        audioElements.current.medievalHorns.volume = 0.5;
        
        console.log("Dynamic sound system initialized");
      } catch (error) {
        console.log("Audio context not available:", error);
      }
    };

    initializeAudio();

    return () => {
      // Cleanup audio elements
      Object.values(audioElements.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  // Update sound context based on game state
  useEffect(() => {
    const newScore = { p1: players[1].score, p2: players[2].score };
    const scoreSum = newScore.p1 + newScore.p2;
    const maxScore = Math.max(newScore.p1, newScore.p2);
    const scoreDifference = Math.abs(newScore.p1 - newScore.p2);
    
    // Calculate game intensity (0-1)
    const gameIntensity = Math.min(1, scoreSum / 8); // Builds up as scores increase
    
    // Calculate crowd excitement (0-1)
    const crowdExcitement = Math.min(1, (scoreSum * 0.2) + (maxScore >= 4 ? 0.5 : 0));
    
    // Calculate combat tension (0-1) - higher when scores are close
    const combatTension = scoreDifference <= 1 && scoreSum >= 4 ? 
      Math.min(1, (scoreSum - 4) * 0.3 + 0.4) : 0;

    soundContext.current = {
      gamePhase,
      score: newScore,
      intensity: gameIntensity,
      crowdExcitement,
      combatTension
    };
  }, [gamePhase, players]);

  // Handle collision-based audio effects
  useEffect(() => {
    if (lastCollision > contextualSounds.current.lastCollisionTime) {
      const timeSinceLastHit = lastCollision - contextualSounds.current.lastCollisionTime;
      
      if (timeSinceLastHit < 1000) {
        // Rapid successive hits - increase combat intensity
        contextualSounds.current.combatIntensity = Math.min(1, 
          contextualSounds.current.combatIntensity + 0.3);
      } else {
        // Single hit - moderate intensity boost
        contextualSounds.current.combatIntensity = Math.min(1, 
          contextualSounds.current.combatIntensity + 0.1);
      }
      
      contextualSounds.current.lastCollisionTime = lastCollision;
      
      // Trigger contextual sound effect
      if (!isMuted) {
        playContextualHitSound(contextualSounds.current.combatIntensity);
      }
    }
  }, [lastCollision, isMuted]);

  const playContextualHitSound = (intensity: number) => {
    try {
      // Play different hit sounds based on intensity
      if (intensity > 0.7) {
        // High intensity - dramatic horn blast
        if (audioElements.current.medievalHorns) {
          audioElements.current.medievalHorns.currentTime = 0;
          audioElements.current.medievalHorns.volume = 0.6 * intensity;
          audioElements.current.medievalHorns.play().catch(() => {});
        }
      }
      
      // Increase tension drums volume
      if (audioElements.current.tensionDrums) {
        audioElements.current.tensionDrums.volume = Math.min(0.4, intensity * 0.5);
      }
    } catch (error) {
      console.log("Contextual hit sound failed:", error);
    }
  };

  const adjustAmbientAudio = (context: SoundContext) => {
    if (isMuted) return;

    try {
      // Ambient crowd volume based on excitement
      if (audioElements.current.ambientCrowd) {
        const targetVolume = context.gamePhase === 'playing' ? 
          0.2 + (context.crowdExcitement * 0.3) : 0.1;
        audioElements.current.ambientCrowd.volume = targetVolume;
        
        if (context.gamePhase === 'playing' && audioElements.current.ambientCrowd.paused) {
          audioElements.current.ambientCrowd.play().catch(() => {});
        }
      }

      // Tension drums based on combat tension
      if (audioElements.current.tensionDrums) {
        const targetVolume = context.combatTension * 0.4;
        audioElements.current.tensionDrums.volume = targetVolume;
        
        if (targetVolume > 0.1 && audioElements.current.tensionDrums.paused) {
          audioElements.current.tensionDrums.play().catch(() => {});
        } else if (targetVolume <= 0.1) {
          audioElements.current.tensionDrums.pause();
        }
      }

      // Combat intensity layer
      if (audioElements.current.combatIntensity) {
        const targetVolume = context.intensity * contextualSounds.current.combatIntensity * 0.3;
        audioElements.current.combatIntensity.volume = targetVolume;
        
        if (targetVolume > 0.1 && audioElements.current.combatIntensity.paused) {
          audioElements.current.combatIntensity.play().catch(() => {});
        } else if (targetVolume <= 0.1) {
          audioElements.current.combatIntensity.pause();
        }
      }
    } catch (error) {
      console.log("Ambient audio adjustment failed:", error);
    }
  };

  // Handle victory audio
  useEffect(() => {
    if (gamePhase === 'ended' && !contextualSounds.current.victoryMoment) {
      contextualSounds.current.victoryMoment = true;
      
      if (!isMuted && audioElements.current.victoryFanfare) {
        // Stop other sounds
        Object.values(audioElements.current).forEach(audio => {
          if (audio && audio !== audioElements.current.victoryFanfare) {
            audio.pause();
          }
        });
        
        // Play victory fanfare
        audioElements.current.victoryFanfare.currentTime = 0;
        audioElements.current.victoryFanfare.play().catch(() => {});
      }
    } else if (gamePhase !== 'ended') {
      contextualSounds.current.victoryMoment = false;
    }
  }, [gamePhase, isMuted]);

  // Real-time audio adjustments
  useFrame((state, delta) => {
    if (gamePhase !== 'playing') return;

    // Decay combat intensity over time
    contextualSounds.current.combatIntensity = Math.max(0, 
      contextualSounds.current.combatIntensity - delta * 0.5);

    // Adjust ambient audio based on current context
    adjustAmbientAudio(soundContext.current);

    // Dynamic crowd buildup based on score proximity
    const scoreSum = soundContext.current.score.p1 + soundContext.current.score.p2;
    const maxScore = Math.max(soundContext.current.score.p1, soundContext.current.score.p2);
    
    if (maxScore >= 4) {
      contextualSounds.current.crowdBuildUp = Math.min(1, 
        contextualSounds.current.crowdBuildUp + delta * 0.3);
    } else {
      contextualSounds.current.crowdBuildUp = Math.max(0, 
        contextualSounds.current.crowdBuildUp - delta * 0.2);
    }

    // Update tension level based on game state
    contextualSounds.current.tensionLevel = 
      (soundContext.current.combatTension * 0.7) + 
      (contextualSounds.current.crowdBuildUp * 0.3);
  });

  // Mute/unmute handling
  useEffect(() => {
    Object.values(audioElements.current).forEach(audio => {
      if (audio) {
        if (isMuted) {
          audio.pause();
        }
      }
    });
  }, [isMuted]);

  return null;
}