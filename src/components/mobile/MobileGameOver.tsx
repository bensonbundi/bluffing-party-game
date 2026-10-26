import React from 'react';
import { Trophy, Crown } from 'lucide-react';
import { Player, RoomState } from '../../types/game';

interface MobileGameOverProps {
  roomState: RoomState;
  currentPlayer: Player;
}

export const MobileGameOver: React.FC<MobileGameOverProps> = ({ roomState, currentPlayer }) => {
  const sorted = [...roomState.players].sort((a, b) => b.score - a.score);
  const rank = sorted.findIndex(p => p.id === currentPlayer.id) + 1;
  const isWinner = rank === 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 max-w-md mx-auto text-center">
      <div className="pt-4">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
          Game Over
        </span>
        <h1 className="text-2xl font-black font-display text-white mt-1">
          Final Results
        </h1>
      </div>

      <div className="my-auto py-8">
        <div
          className={`w-28 h-28 rounded-3xl mx-auto flex items-center justify-center text-6xl mb-4 border-2 shadow-2xl relative ${
            isWinner ? 'border-amber-400 bg-amber-500/20' : 'border-slate-700 bg-slate-900'
          }`}
        >
          {isWinner && (
            <div className="absolute -top-4 -right-2 w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg">
              <Crown className="w-5 h-5 fill-current" />
            </div>
          )}
          {currentPlayer.avatar}
        </div>

        <h2 className="text-3xl font-black font-display text-white">
          {currentPlayer.name}
        </h2>
        
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-sm font-extrabold text-amber-400 font-display">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>You Finished #{rank}</span>
        </div>

        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
            Final Score
          </span>
          <div className="text-4xl font-black font-display font-mono-nums text-white mt-1">
            {currentPlayer.score} <span className="text-xs text-amber-400 uppercase font-sans">Points</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-400 font-medium pb-2">
        Host can start a new game from the TV screen!
      </div>
    </div>
  );
};
