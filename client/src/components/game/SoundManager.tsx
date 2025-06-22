import { useEffect, useRef } from "react";
import { useAudio } from "../../lib/stores/useAudio";
import { useGameState } from "../../lib/stores/useGameState";

export default function SoundManager() {
  const { setHitSound, setSuccessSound, setDodgeSound, setBackgroundMusic } = useAudio();
  const { gamePhase, players } = useGameState();
  const crowdSoundRef = useRef<HTMLAudioElement | null>(null);
  const clappingSoundRef = useRef<HTMLAudioElement | null>(null);
  const lastScoreRef = useRef({ p1: 0, p2: 0 });
  const lastClappingTime = useRef(0);

  useEffect(() => {
    // Load main royal battle theme
    const backgroundAudio = new Audio("/sounds/royal_battle_theme.mp3");
    backgroundAudio.preload = "auto";
    backgroundAudio.volume = 0.5;
    backgroundAudio.loop = true;
    setBackgroundMusic(backgroundAudio);

    // Load bass layer for epic effect
    const bassAudio = new Audio("/sounds/royal_battle_bass.mp3");
    bassAudio.preload = "auto";
    bassAudio.volume = 0.4;
    bassAudio.loop = true;
    // Attach to window for mute management
    window.royalBattleBass = bassAudio;

    // Load hit sound
    const hitAudio = new Audio("/sounds/hit.mp3");
    hitAudio.preload = "auto";
    hitAudio.volume = 0.4;
    setHitSound(hitAudio);

    // Load success sound
    const successAudio = new Audio("/sounds/success.mp3");
    successAudio.preload = "auto";
    successAudio.volume = 0.6;
    setSuccessSound(successAudio);

    // Create dodge sound programmatically (swoosh effect)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dodgeBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
    const data = dodgeBuffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / audioContext.sampleRate;
      data[i] = Math.sin(440 * 2 * Math.PI * t * (1 - t * 5)) * Math.exp(-t * 15) * 0.3;
    }
    
    const createDodgeSound = () => {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      source.buffer = dodgeBuffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      return { play: () => source.start() };
    };

    const dodgeAudio = {
      currentTime: 0,
      volume: 0.5,
      play: () => Promise.resolve(createDodgeSound().play())
    } as HTMLAudioElement;

    setDodgeSound(dodgeAudio);

    // Create crowd cheering sound programmatically
    const createCrowdCheer = () => {
      const crowdContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 3.0;
      const crowdBuffer = crowdContext.createBuffer(1, crowdContext.sampleRate * duration, crowdContext.sampleRate);
      const data = crowdBuffer.getChannelData(0);
      
      // Generate crowd noise with multiple frequency layers
      for (let i = 0; i < data.length; i++) {
        const t = i / crowdContext.sampleRate;
        const noise = (Math.random() - 0.5) * 2;
        const cheer = Math.sin(200 * 2 * Math.PI * t) * Math.exp(-t * 2) * 0.3;
        const applause = noise * Math.exp(-t * 1.5) * 0.2;
        data[i] = (cheer + applause) * (1 - t / duration) * 0.4;
      }
      
      return crowdBuffer;
    };

    const crowdBuffer = createCrowdCheer();
    const crowdAudio = {
      currentTime: 0,
      volume: 0.6,
      play: () => {
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        source.buffer = crowdBuffer;
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
        source.start();
        return Promise.resolve();
      }
    } as HTMLAudioElement;

    crowdSoundRef.current = crowdAudio;

    // Create clapping sound programmatically
    const createClappingSound = () => {
      const clappingContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 2.5;
      const clappingBuffer = clappingContext.createBuffer(1, clappingContext.sampleRate * duration, clappingContext.sampleRate);
      const data = clappingBuffer.getChannelData(0);
      
      // Generate rhythmic clapping with multiple layers
      for (let i = 0; i < data.length; i++) {
        const t = i / clappingContext.sampleRate;
        const noise = (Math.random() - 0.5) * 2;
        
        // Create clapping rhythm pattern
        const clapTiming = Math.floor(t * 8) % 2; // 4 claps per second
        const clapIntensity = clapTiming === 0 ? 1 : 0.3;
        
        const clap = noise * Math.exp(-((t % 0.25) * 20)) * clapIntensity * 0.4;
        const reverb = clap * 0.3 * Math.exp(-t * 0.5);
        
        data[i] = (clap + reverb) * (1 - t / duration) * 0.5;
      }
      
      return clappingBuffer;
    };

    const clappingBuffer = createClappingSound();
    const clappingAudio = {
      currentTime: 0,
      volume: 0.7,
      play: () => {
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        source.buffer = clappingBuffer;
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);
        source.start();
        return Promise.resolve();
      }
    } as HTMLAudioElement;

    clappingSoundRef.current = clappingAudio;

    console.log("Sound effects loaded");
  }, [setHitSound, setSuccessSound, setDodgeSound, setBackgroundMusic]);

  // Handle background music based on game phase
  useEffect(() => {
    const { backgroundMusic } = useAudio.getState();
    const bassAudio = window.royalBattleBass;
    if (backgroundMusic) {
      if (gamePhase === 'playing') {
        backgroundMusic.play().catch(e => console.log("Background music autoplay blocked"));
        if (bassAudio) bassAudio.play().catch(e => {});
      } else {
        backgroundMusic.pause();
        if (bassAudio) bassAudio.pause();
      }
    }
  }, [gamePhase]);

  // Play crowd reactions when scores change and periodic clapping
  useEffect(() => {
    const currentScores = { p1: players[1].score, p2: players[2].score };
    const currentTime = Date.now();
    
    if (gamePhase === 'playing') {
      // Check if score increased
      if (currentScores.p1 > lastScoreRef.current.p1 || currentScores.p2 > lastScoreRef.current.p2) {
        if (crowdSoundRef.current) {
          crowdSoundRef.current.play().catch(e => console.log("Crowd sound blocked"));
        }
        // Play clapping after scoring
        if (clappingSoundRef.current) {
          setTimeout(() => {
            clappingSoundRef.current?.play().catch(e => console.log("Clapping sound blocked"));
          }, 500);
        }
      }
      
      // Play periodic clapping during gameplay
      if (currentTime - lastClappingTime.current > 8000 && clappingSoundRef.current) {
        clappingSoundRef.current.play().catch(e => console.log("Periodic clapping blocked"));
        lastClappingTime.current = currentTime;
      }
    }
    
    lastScoreRef.current = currentScores;
  }, [players, gamePhase]);

  return null;
}
