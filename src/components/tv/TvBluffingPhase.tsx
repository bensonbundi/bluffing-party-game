import React from 'react';
import { Lock, Edit3, Clock, Star } from 'lucide-react';
import { RoomState } from '../../types/game';
import { sound } from '../../utils/sound';

interface TvBluffingPhaseProps {
  roomState: RoomState;
}

export const TvBluffingPhase: React.FC<TvBluffingPhaseProps> = ({ roomState }) => {
  const { currentQuestion, timerSecondsRemaining, timerTotalSeconds, players, submittedBluffPlayerIds } = roomState;
  
  const total = timerTotalSeconds || 30;
  const progressPercent = Math.max(0, Math.min(100, (timerSecondsRemaining / total) * 100));
  const isUrgent = timerSecondsRemaining <= 8;

  return (
    <div className="flex-1 flex flex-col justify-between p-6 md:p-8 max-w-6xl mx-auto w-full">
      {/* Top Question Recap with Optional Picture */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center backdrop-blur-sm flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
            Category: {currentQuestion?.category}
          </span>
          {currentQuestion?.difficulty && (
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {currentQuestion.difficulty}
            </span>
          )}
        </div>

        {currentQuestion?.imageUrl && (
          <div className="w-full max-w-md max-h-40 mb-3 rounded-xl overflow-hidden border border-slate-700/60 shadow-md">
            <img
              src={currentQuestion.imageUrl}
              alt="Question illustration"
              referrerPolicy="no-referrer"
              className="w-full h-32 md:h-36 object-cover rounded-xl"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <h2 className="text-xl md:text-2xl font-extrabold font-display text-white max-w-4xl mx-auto leading-snug">
          {currentQuestion?.prompt}
        </h2>
      </div>

      {/* Center 30s Countdown Timer */}
      <div className="my-6 flex flex-col items-center justify-center">
        <div className="text-center mb-2">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold flex items-center justify-center gap-1.5">
            <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
            <span>Time to Write Your Bluff</span>
          </span>
        </div>

        {/* Big Authoritative Countdown Number */}
        <div className="relative flex items-center justify-center">
          <div
            className={`text-6xl md:text-8xl font-black font-mono-nums tracking-tighter ${
              isUrgent ? 'text-rose-500 scale-110 animate-pulse' : 'text-amber-400'
            } transition-all duration-300`}
          >
            {timerSecondsRemaining}
          </div>
          <span className="text-2xl font-bold text-slate-500 ml-2">s</span>
        </div>

        {/* Timer Bar */}
        <div className="w-full max-w-md h-3.5 bg-slate-800 rounded-full overflow-hidden mt-3 p-0.5 border border-slate-700/60 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              isUrgent
                ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                : 'bg-gradient-to-r from-amber-400 to-emerald-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-xs text-slate-400 mt-2 font-medium">
          Type a convincing lie on your phone to trick other players!
        </p>

        {/* Global Hit Now Playing Badge */}
        <div className="flex items-center gap-2 mt-3 px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/70 text-xs shadow-sm">
          <div className="flex items-end gap-0.5 h-3 w-2.5 px-0.5">
            <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_ease-in-out] h-full" />
            <span className="w-0.5 bg-rose-400 rounded-full animate-[bounce_0.4s_infinite_ease-in-out_0.2s] h-2/3" />
            <span className="w-0.5 bg-amber-300 rounded-full animate-[bounce_0.8s_infinite_ease-in-out_0.1s] h-4/5" />
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Beat:</span>
          <span className="font-bold text-amber-300 text-xs">{sound.getCurrentTrack().title}</span>
          <span className="text-slate-400 text-[11px]">· {sound.getCurrentTrack().artist}</span>
        </div>
      </div>

      {/* Bottom Submissions Grid */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Player Submissions ({submittedBluffPlayerIds.length} / {players.length})
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {submittedBluffPlayerIds.length === players.length ? 'All lies submitted!' : 'Awaiting bluffs...'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {players.map((player) => {
            const hasSubmitted = submittedBluffPlayerIds.includes(player.id);
            return (
              <div
                key={player.id}
                className={`rounded-2xl p-3 flex flex-col items-center text-center border transition-all ${
                  hasSubmitted
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400'
                }`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-1.5"
                  style={{ backgroundColor: `${player.color}22` }}
                >
                  {player.avatar}
                </div>
                <div className="font-bold text-xs truncate w-full text-white">
                  {player.name}
                </div>

                <div className="mt-1.5 text-[10px] font-semibold flex items-center gap-1">
                  {hasSubmitted ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked In
                    </span>
                  ) : (
                    <span className="text-amber-400/80 flex items-center gap-1 animate-pulse">
                      <Edit3 className="w-3 h-3" />
                      Typing...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
