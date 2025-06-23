import { useGameState } from "../../lib/stores/useGameState";
import { useAudio } from "../../lib/stores/useAudio";

export default function Menu() {
  const { startGame } = useGameState();
  const { toggleMute, isMuted } = useAudio();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-purple-500/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-cyan-500/30 rounded-full animate-spin"></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-indigo-500/25 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-12 h-12 bg-pink-500/30 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 right-1/4 w-28 h-28 bg-teal-500/20 rounded-full animate-spin"></div>
      </div>
      
      <div className="max-w-4xl w-full text-center relative z-10">
        {/* Title with enhanced styling */}
        <h1 className="text-8xl font-bold mb-8 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse drop-shadow-2xl">
          CURSOR CLASH
        </h1>
        
        {/* Subtitle */}
        <p className="text-2xl text-cyan-200 mb-12 font-light tracking-wide">
          Medieval Arena Combat
        </p>

        {/* Start Button */}
        <button
          onClick={startGame}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-6 px-12 rounded-2xl text-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl mb-12 border-2 border-cyan-400/50 hover:border-cyan-300"
        >
          ⚔️ START BATTLE ⚔️
        </button>

        {/* Instructions */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-sm rounded-xl p-6 border border-cyan-400/30 shadow-xl">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">🛡️ Player 1</h3>
            <div className="space-y-2 text-cyan-100">
              <p><kbd className="bg-cyan-500/30 px-3 py-2 rounded-lg font-mono">W A S D</kbd> - Move</p>
              <p><kbd className="bg-cyan-500/30 px-3 py-2 rounded-lg font-mono">F</kbd> - Attack</p>
              <p className="text-sm text-cyan-200">Fight until enemy health reaches 0!</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/40 to-red-900/40 backdrop-blur-sm rounded-xl p-6 border border-purple-400/30 shadow-xl">
            <h3 className="text-2xl font-bold text-purple-300 mb-4">⚔️ Player 2</h3>
            <div className="space-y-2 text-purple-100">
              <p><kbd className="bg-purple-500/30 px-3 py-2 rounded-lg font-mono">↑ ↓ ← →</kbd> - Move</p>
              <p><kbd className="bg-purple-500/30 px-3 py-2 rounded-lg font-mono">L</kbd> - Attack</p>
              <p className="text-sm text-purple-200">Deal 20 damage per successful hit!</p>
            </div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/30 shadow-xl mb-8">
          <h3 className="text-xl font-bold text-yellow-300 mb-4">🏆 Victory Conditions</h3>
          <p className="text-yellow-100 leading-relaxed">
            Engage in medieval sword combat! Each successful attack deals 20 damage. Reduce your opponent's health to 0 to win a round. 
            Master the art of timing, positioning, and combat to claim victory in the arena!
          </p>
        </div>

        {/* Audio Toggle and Additional Controls */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleMute}
            className="bg-gray-800/50 hover:bg-gray-700/50 text-white px-6 py-3 rounded-lg border border-gray-600/50 hover:border-gray-500 transition-all duration-200"
          >
            {isMuted ? '🔇 Unmute' : '🔊 Mute'}
          </button>
          
          <div className="bg-gray-800/50 px-6 py-3 rounded-lg border border-gray-600/50 text-gray-300">
            <kbd className="bg-gray-700/50 px-2 py-1 rounded text-sm">R</kbd> - Restart Game
          </div>
        </div>
      </div>
    </div>
  );
}