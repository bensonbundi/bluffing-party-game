import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Crown, RotateCcw, Award } from 'lucide-react';
import { RoomState } from '../../types/game';
import { sound } from '../../utils/sound';

interface TvGameOverProps {
  roomState: RoomState;
  onRestart: () => void;
}

export const TvGameOver: React.FC<TvGameOverProps> = ({ roomState, onRestart }) => {
  const { players } = roomState;
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  useEffect(() => {
    sound.playRevealTruth();

    // Trigger celebratory confetti burst
    const end = Date.now() + 3.5 * 1000;
    const colors = ['#f59e0b', '#ec4899', '#06b6d4', '#10b981', '#8b5cf6'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between items-center p-8 max-w-5xl mx-auto w-full text-center">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold uppercase tracking-widest text-xs">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Game Complete</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black font-display text-white tracking-tight">
          The Ultimate Bamboozler!
        </h2>
      </div>

      {/* Podium Area */}
      <div className="my-8 flex flex-col items-center">
        {winner && (
          <div className="relative bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-900 border-2 border-amber-400 rounded-3xl p-8 md:p-10 shadow-2xl shadow-amber-500/20 flex flex-col items-center max-w-md w-full scale-105">
            <div className="absolute -top-7">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/40">
                <Crown className="w-8 h-8 fill-current" />
              </div>
            </div>

            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-6xl my-4 shadow-inner"
              style={{ backgroundColor: `${winner.color}33` }}
            >
              {winner.avatar}
            </div>

            <h3 className="text-3xl font-black font-display text-white">
              {winner.name}
            </h3>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-extrabold mt-1">
              Champion
            </span>

            <div className="text-4xl font-black font-mono-nums text-white mt-3 bg-slate-950/70 px-6 py-2 rounded-xl border border-amber-500/30">
              {winner.score} <span className="text-xs text-amber-400 font-sans uppercase font-bold">Points</span>
            </div>
          </div>
        )}

        {/* 2nd and 3rd place */}
        {sorted.length > 1 && (
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {sorted.slice(1, 4).map((player, idx) => (
              <div
                key={player.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-md"
              >
                <span className="font-display font-black text-slate-400 text-sm">
                  #{idx + 2}
                </span>
                <span className="text-xl">{player.avatar}</span>
                <span className="font-bold text-sm text-slate-200">{player.name}</span>
                <span className="font-mono-nums font-black text-amber-400 text-sm">
                  {player.score} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restart Button */}
      <div className="pt-4">
        <button
          onClick={onRestart}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl font-display font-extrabold text-base tracking-wide bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
          <span>PLAY AGAIN</span>
        </button>
      </div>
    </div>
  );
};
