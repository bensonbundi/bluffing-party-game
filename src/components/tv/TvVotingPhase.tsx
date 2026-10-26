import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { RoomState } from '../../types/game';
import { sound } from '../../utils/sound';

interface TvVotingPhaseProps {
  roomState: RoomState;
}

export const TvVotingPhase: React.FC<TvVotingPhaseProps> = ({ roomState }) => {
  const { currentQuestion, choices, timerSecondsRemaining, players, submittedVotePlayerIds } = roomState;
  const isUrgent = timerSecondsRemaining <= 5;
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  return (
    <div className="flex-1 flex flex-col justify-between p-6 md:p-8 max-w-6xl mx-auto w-full">
      {/* Top Question & Timer with Optional Picture */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex-1 text-center md:text-left flex flex-col md:flex-row items-center gap-4">
          {currentQuestion?.imageUrl && (
            <div className="w-24 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700/60 shadow-sm hidden md:block">
              <img
                src={currentQuestion.imageUrl}
                alt="Question illustration"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Find The Truth!
              </span>
              {currentQuestion?.difficulty && (
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {currentQuestion.difficulty}
                </span>
              )}
            </div>
            <h2 className="text-lg md:text-xl font-extrabold font-display text-white mt-1">
              {currentQuestion?.prompt}
            </h2>
          </div>
        </div>

        {/* Global Hit Badge & Voting Countdown */}
        <div className="shrink-0 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <div className="flex items-end gap-0.5 h-3 w-2 px-0.5">
              <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_ease-in-out] h-full" />
              <span className="w-0.5 bg-rose-400 rounded-full animate-[bounce_0.4s_infinite_ease-in-out_0.2s] h-2/3" />
            </div>
            <span className="font-bold text-amber-300">{sound.getCurrentTrack().title}</span>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl">
            <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
            <div className="flex items-baseline gap-1 font-mono-nums">
              <span className={`text-2xl font-black ${isUrgent ? 'text-rose-400' : 'text-white'}`}>
                {timerSecondsRemaining}
              </span>
              <span className="text-xs text-slate-400 font-bold">s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Choices Grid on Big Screen */}
      <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {choices.map((choice, index) => {
          const letter = alphabet[index] || `${index + 1}`;
          return (
            <div
              key={choice.id}
              className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:border-slate-600 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 font-display font-black text-amber-400 flex items-center justify-center text-lg shrink-0">
                {letter}
              </div>
              <div className="text-base font-bold text-slate-100 leading-snug">
                {choice.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Voting Status Tracker */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <span>Votes Cast:</span>
          <span className="font-mono text-amber-400">
            {submittedVotePlayerIds.length} / {players.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {players.map((p) => {
            const hasVoted = submittedVotePlayerIds.includes(p.id);
            return (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  hasVoted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <span>{p.avatar}</span>
                <span className="truncate max-w-[90px]">{p.name}</span>
                {hasVoted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
