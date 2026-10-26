import React from 'react';
import { Award, CheckCircle2, UserCheck, Flame } from 'lucide-react';
import { Player, RoomState } from '../../types/game';

interface MobileRevealProps {
  roomState: RoomState;
  currentPlayer: Player;
}

export const MobileReveal: React.FC<MobileRevealProps> = ({ roomState, currentPlayer }) => {
  const { lastResult, isTieBreaker, tiedPlayerIds } = roomState;
  const award = lastResult?.pointsAwarded[currentPlayer.id];
  const isTied = isTieBreaker && tiedPlayerIds.includes(currentPlayer.id);

  // Find player's current rank
  const sorted = [...roomState.players].sort((a, b) => b.score - a.score);
  const currentRank = sorted.findIndex(p => p.id === currentPlayer.id) + 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 max-w-md mx-auto text-center">
      {/* Top Header */}
      <div className="pt-2">
        <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
          Question Results
        </span>
        <h1 className="text-xl font-black font-display text-white mt-0.5">
          Your Performance
        </h1>
      </div>

      {/* Center Cards */}
      <div className="my-auto py-4 space-y-4">
        {/* Points earned this question banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="text-4xl font-black font-display text-amber-400 font-mono-nums">
            +{award?.total || 0}
          </div>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block mt-1">
            Points Gained This Question
          </span>
        </div>

        {/* Breakdown */}
        <div className="space-y-2.5 text-left">
          {/* Correct answer check */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  award && award.correctPoints > 0
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Truth Discovery</div>
                <div className="text-[11px] text-slate-400">
                  {award && award.correctPoints > 0
                    ? 'You saw through the lies!'
                    : 'You fell for a bluff or missed the truth'}
                </div>
              </div>
            </div>
            <div className="font-display font-black text-sm text-white font-mono-nums">
              +{award?.correctPoints || 0}
            </div>
          </div>

          {/* Bluff check */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  award && award.bluffPoints > 0
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Bluff Bamboozles</span>
                  {lastResult?.choices.some(c => c.isMerged && (c.authorPlayerId === currentPlayer.id || (c.authorPlayerIds && c.authorPlayerIds.includes(currentPlayer.id)))) && (
                    <span className="text-[10px] text-purple-300 font-extrabold bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/40">
                      Merged
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {award && award.fooledPlayers.length > 0
                    ? `Tricked ${award.fooledPlayers.join(', ')}!`
                    : 'Nobody fell for your lie this time'}
                </div>
              </div>
            </div>
            <div className="font-display font-black text-sm text-white font-mono-nums">
              +{award?.bluffPoints || 0}
            </div>
          </div>
        </div>

        {/* Current Standing */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-xs font-bold text-white">Current Standing</div>
              <div className="text-[11px] text-slate-400">
                Rank #{currentRank} of {roomState.players.length}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-black font-mono-nums text-white">
              {currentPlayer.score}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">
              Pts
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-slate-400 font-medium pb-2">
        Look up at the TV screen for full standings!
      </div>
    </div>
  );
};
