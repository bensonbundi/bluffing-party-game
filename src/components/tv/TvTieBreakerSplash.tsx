import React, { useEffect } from 'react';
import { Flame, Swords, ShieldAlert } from 'lucide-react';
import { RoomState } from '../../types/game';
import { sound } from '../../utils/sound';

interface TvTieBreakerSplashProps {
  roomState: RoomState;
}

export const TvTieBreakerSplash: React.FC<TvTieBreakerSplashProps> = ({ roomState }) => {
  const { tiedPlayerIds, players, timerSecondsRemaining } = roomState;

  useEffect(() => {
    sound.playTieBreaker();
  }, []);

  const tiedPlayers = players.filter(p => tiedPlayerIds.includes(p.id));

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto text-center space-y-8 animate-fadeIn">
      {/* Alert Header */}
      <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 font-black uppercase tracking-widest text-sm shadow-xl shadow-rose-500/20 animate-bounce">
        <ShieldAlert className="w-5 h-5 text-rose-400" />
        <span>TIE FOR FIRST PLACE DETECTED!</span>
      </div>

      <div className="space-y-3">
        <h2 className="text-5xl md:text-7xl font-black font-display text-white tracking-tight uppercase">
          Sudden Death
        </h2>
        <p className="text-xl md:text-2xl font-bold text-amber-400">
          The Duel to Break the Tie!
        </p>
      </div>

      {/* Tied Contenders Spotlight */}
      <div className="flex flex-wrap items-center justify-center gap-6 my-6">
        {tiedPlayers.map((player, idx) => (
          <React.Fragment key={player.id}>
            {idx > 0 && (
              <div className="text-rose-500 font-display font-black text-2xl flex items-center">
                <Swords className="w-8 h-8 animate-pulse" />
              </div>
            )}
            <div
              className="bg-slate-900 border-2 rounded-2xl p-6 flex flex-col items-center shadow-2xl min-w-[180px]"
              style={{ borderColor: player.color }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-3 shadow-inner"
                style={{ backgroundColor: `${player.color}33` }}
              >
                {player.avatar}
              </div>
              <div className="font-extrabold text-lg text-white">
                {player.name}
              </div>
              <div className="text-sm font-black font-mono-nums text-amber-400 mt-1">
                {player.score} Points
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Rules Notice */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 max-w-xl text-slate-300 text-xs md:text-sm leading-relaxed">
        <div className="font-extrabold text-rose-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-2">
          <Flame className="w-4 h-4" />
          <span>Tie-Breaker Rules</span>
        </div>
        <p>
          All players can still submit bluffs and vote to confuse the field!
          However, <strong>only the tied contenders can earn points</strong>. Play continues question-by-question until the tie is broken!
        </p>
      </div>

      <div className="text-xs text-slate-500 font-mono">
        Starting tie-breaker question in {timerSecondsRemaining}s...
      </div>
    </div>
  );
};
