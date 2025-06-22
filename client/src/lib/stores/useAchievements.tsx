import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'combat' | 'skill' | 'streak' | 'special';
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
  badge: {
    color: string;
    shape: 'shield' | 'crown' | 'sword' | 'star';
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
}

export interface TournamentStats {
  gamesPlayed: number;
  gamesWon: number;
  totalHits: number;
  totalDodges: number;
  longestWinStreak: number;
  currentWinStreak: number;
  fastestVictory: number; // in seconds
  mostConsecutiveHits: number;
  totalPlayTime: number; // in seconds
  perfectGames: number; // games won without being hit
  comebackWins: number; // games won after being behind
}

interface AchievementState {
  achievements: Achievement[];
  stats: TournamentStats;
  recentUnlocks: Achievement[];
  
  // Actions
  checkAchievements: () => void;
  updateStats: (update: Partial<TournamentStats>) => void;
  resetStats: () => void;
  markAchievementSeen: (achievementId: string) => void;
  getUnlockedAchievements: () => Achievement[];
  getTournamentRank: () => string;
}

const defaultStats: TournamentStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalHits: 0,
  totalDodges: 0,
  longestWinStreak: 0,
  currentWinStreak: 0,
  fastestVictory: Infinity,
  mostConsecutiveHits: 0,
  totalPlayTime: 0,
  perfectGames: 0,
  comebackWins: 0
};

const achievementsList: Achievement[] = [
  // Combat Achievements
  {
    id: 'first_blood',
    title: 'First Blood',
    description: 'Win your first tournament match',
    icon: '⚔️',
    category: 'combat',
    unlocked: false,
    badge: { color: '#CD7F32', shape: 'sword', tier: 'bronze' }
  },
  {
    id: 'champion',
    title: 'Tournament Champion',
    description: 'Win 10 tournament matches',
    icon: '👑',
    category: 'combat',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    badge: { color: '#FFD700', shape: 'crown', tier: 'gold' }
  },
  {
    id: 'royal_guard',
    title: 'Royal Guard',
    description: 'Win 50 tournament matches',
    icon: '🛡️',
    category: 'combat',
    unlocked: false,
    progress: 0,
    maxProgress: 50,
    badge: { color: '#E5E4E2', shape: 'shield', tier: 'platinum' }
  },
  
  // Skill Achievements
  {
    id: 'perfect_knight',
    title: 'Perfect Knight',
    description: 'Win a match without taking damage',
    icon: '✨',
    category: 'skill',
    unlocked: false,
    badge: { color: '#C0C0C0', shape: 'star', tier: 'silver' }
  },
  {
    id: 'lightning_strike',
    title: 'Lightning Strike',
    description: 'Win a match in under 30 seconds',
    icon: '⚡',
    category: 'skill',
    unlocked: false,
    badge: { color: '#FFD700', shape: 'sword', tier: 'gold' }
  },
  {
    id: 'master_dodger',
    title: 'Master Dodger',
    description: 'Successfully dodge 100 attacks',
    icon: '🏃',
    category: 'skill',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    badge: { color: '#C0C0C0', shape: 'shield', tier: 'silver' }
  },
  
  // Streak Achievements
  {
    id: 'on_fire',
    title: 'On Fire',
    description: 'Win 3 matches in a row',
    icon: '🔥',
    category: 'streak',
    unlocked: false,
    badge: { color: '#CD7F32', shape: 'star', tier: 'bronze' }
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Win 5 matches in a row',
    icon: '💪',
    category: 'streak',
    unlocked: false,
    badge: { color: '#C0C0C0', shape: 'crown', tier: 'silver' }
  },
  {
    id: 'legendary',
    title: 'Legendary',
    description: 'Win 10 matches in a row',
    icon: '🌟',
    category: 'streak',
    unlocked: false,
    badge: { color: '#FFD700', shape: 'crown', tier: 'gold' }
  },
  
  // Special Achievements
  {
    id: 'comeback_king',
    title: 'Comeback King',
    description: 'Win after being behind 0-4',
    icon: '🏆',
    category: 'special',
    unlocked: false,
    badge: { color: '#E5E4E2', shape: 'crown', tier: 'platinum' }
  },
  {
    id: 'combo_master',
    title: 'Combo Master',
    description: 'Land 5 consecutive hits',
    icon: '🎯',
    category: 'special',
    unlocked: false,
    badge: { color: '#FFD700', shape: 'sword', tier: 'gold' }
  },
  {
    id: 'tournament_veteran',
    title: 'Tournament Veteran',
    description: 'Play for 1 hour total',
    icon: '⏰',
    category: 'special',
    unlocked: false,
    progress: 0,
    maxProgress: 3600,
    badge: { color: '#C0C0C0', shape: 'shield', tier: 'silver' }
  }
];

export const useAchievements = create<AchievementState>()(
  persist(
    (set, get) => ({
      achievements: achievementsList,
      stats: defaultStats,
      recentUnlocks: [],

      checkAchievements: () => {
        const { achievements, stats } = get();
        const newUnlocks: Achievement[] = [];
        
        const updatedAchievements = achievements.map(achievement => {
          if (achievement.unlocked) return achievement;
          
          let shouldUnlock = false;
          let newProgress = achievement.progress || 0;
          
          switch (achievement.id) {
            case 'first_blood':
              shouldUnlock = stats.gamesWon >= 1;
              break;
            case 'champion':
              newProgress = stats.gamesWon;
              shouldUnlock = stats.gamesWon >= 10;
              break;
            case 'royal_guard':
              newProgress = stats.gamesWon;
              shouldUnlock = stats.gamesWon >= 50;
              break;
            case 'perfect_knight':
              shouldUnlock = stats.perfectGames >= 1;
              break;
            case 'lightning_strike':
              shouldUnlock = stats.fastestVictory <= 30;
              break;
            case 'master_dodger':
              newProgress = stats.totalDodges;
              shouldUnlock = stats.totalDodges >= 100;
              break;
            case 'on_fire':
              shouldUnlock = stats.longestWinStreak >= 3;
              break;
            case 'unstoppable':
              shouldUnlock = stats.longestWinStreak >= 5;
              break;
            case 'legendary':
              shouldUnlock = stats.longestWinStreak >= 10;
              break;
            case 'comeback_king':
              shouldUnlock = stats.comebackWins >= 1;
              break;
            case 'combo_master':
              shouldUnlock = stats.mostConsecutiveHits >= 5;
              break;
            case 'tournament_veteran':
              newProgress = stats.totalPlayTime;
              shouldUnlock = stats.totalPlayTime >= 3600;
              break;
          }
          
          if (shouldUnlock && !achievement.unlocked) {
            const unlockedAchievement = {
              ...achievement,
              unlocked: true,
              unlockedAt: Date.now(),
              progress: newProgress
            };
            newUnlocks.push(unlockedAchievement);
            return unlockedAchievement;
          }
          
          return { ...achievement, progress: newProgress };
        });
        
        if (newUnlocks.length > 0) {
          set({ 
            achievements: updatedAchievements,
            recentUnlocks: [...get().recentUnlocks, ...newUnlocks]
          });
        } else {
          set({ achievements: updatedAchievements });
        }
      },

      updateStats: (update) => {
        const currentStats = get().stats;
        const newStats = { ...currentStats, ...update };
        
        set({ stats: newStats });
        get().checkAchievements();
      },

      resetStats: () => {
        set({ stats: defaultStats });
      },

      markAchievementSeen: (achievementId) => {
        set(state => ({
          recentUnlocks: state.recentUnlocks.filter(a => a.id !== achievementId)
        }));
      },

      getUnlockedAchievements: () => {
        return get().achievements.filter(a => a.unlocked);
      },

      getTournamentRank: () => {
        const { stats } = get();
        const winRate = stats.gamesPlayed > 0 ? stats.gamesWon / stats.gamesPlayed : 0;
        
        if (stats.gamesWon >= 50 && winRate >= 0.8) return 'Grand Champion';
        if (stats.gamesWon >= 25 && winRate >= 0.7) return 'Royal Knight';
        if (stats.gamesWon >= 10 && winRate >= 0.6) return 'Tournament Knight';
        if (stats.gamesWon >= 5) return 'Squire';
        if (stats.gamesWon >= 1) return 'Apprentice';
        return 'Novice';
      }
    }),
    {
      name: 'tournament-achievements',
      version: 1
    }
  )
);