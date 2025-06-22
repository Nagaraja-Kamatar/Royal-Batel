import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "playing" | "ended";

interface Player {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  score: number;
  color: string;
  name: string;
}

interface GameState {
  gamePhase: GamePhase;
  players: Record<number, Player>;
  winScore: number;
  winner: number | null;
  lastCollision: number;
  dodgeEffects: Record<number, { active: boolean; time: number; direction: [number, number, number] }>;
  
  // Actions
  startGame: () => void;
  endGame: (winnerId: number) => void;
  resetGame: () => void;
  showMenu: () => void;
  updatePlayerPosition: (playerId: number, position: [number, number, number]) => void;
  updatePlayerVelocity: (playerId: number, velocity: [number, number, number]) => void;
  incrementScore: (playerId: number) => void;
  setLastCollision: (time: number) => void;
  triggerDodgeEffect: (playerId: number, direction: [number, number, number]) => void;
}

const initialPlayers: Record<number, Player> = {
  1: {
    id: 1,
    position: [-3, 0.5, 0],
    velocity: [0, 0, 0],
    score: 0,
    color: "#4caf50",
    name: "Player 1"
  },
  2: {
    id: 2,
    position: [3, 0.5, 0],
    velocity: [0, 0, 0],
    score: 0,
    color: "#f44336",
    name: "Player 2"
  }
};

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    gamePhase: "menu",
    players: initialPlayers,
    winScore: 5,
    winner: null,
    lastCollision: 0,
    dodgeEffects: {
      1: { active: false, time: 0, direction: [0, 0, 0] },
      2: { active: false, time: 0, direction: [0, 0, 0] }
    },
    
    startGame: () => {
      set({
        gamePhase: "playing",
        players: initialPlayers,
        winner: null,
        lastCollision: 0
      });
    },
    
    endGame: (winnerId: number) => {
      set({
        gamePhase: "ended",
        winner: winnerId
      });
    },
    
    resetGame: () => {
      set({
        gamePhase: "playing",
        players: initialPlayers,
        winner: null,
        lastCollision: 0
      });
    },
    
    showMenu: () => {
      set({
        gamePhase: "menu",
        players: initialPlayers,
        winner: null,
        lastCollision: 0
      });
    },
    
    updatePlayerPosition: (playerId: number, position: [number, number, number]) => {
      set((state) => ({
        players: {
          ...state.players,
          [playerId]: {
            ...state.players[playerId],
            position
          }
        }
      }));
    },
    
    updatePlayerVelocity: (playerId: number, velocity: [number, number, number]) => {
      set((state) => ({
        players: {
          ...state.players,
          [playerId]: {
            ...state.players[playerId],
            velocity
          }
        }
      }));
    },
    
    incrementScore: (playerId: number) => {
      const state = get();
      const newScore = state.players[playerId].score + 1;
      
      set((state) => ({
        players: {
          ...state.players,
          [playerId]: {
            ...state.players[playerId],
            score: newScore
          }
        }
      }));
      
      // Check for win condition
      if (newScore >= state.winScore) {
        state.endGame(playerId);
      }
    },
    
    setLastCollision: (time: number) => {
      set({ lastCollision: time });
    },
    
    triggerDodgeEffect: (playerId: number, direction: [number, number, number]) => {
      set((state) => ({
        dodgeEffects: {
          ...state.dodgeEffects,
          [playerId]: {
            active: true,
            time: Date.now(),
            direction
          }
        }
      }));
      
      // Auto-deactivate after 500ms
      setTimeout(() => {
        set((state) => ({
          dodgeEffects: {
            ...state.dodgeEffects,
            [playerId]: {
              ...state.dodgeEffects[playerId],
              active: false
            }
          }
        }));
      }, 500);
    }
  }))
);
