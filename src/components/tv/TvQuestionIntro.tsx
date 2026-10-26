import React from 'react';
import { Sparkles, Flame, Clock, Star, HelpCircle } from 'lucide-react';
import { RoomState } from '../../types/game';

interface TvQuestionIntroProps {
  roomState: RoomState;
}

export const TvQuestionIntro: React.FC<TvQuestionIntroProps> = ({ roomState }) => {
  const { currentQuestion, currentRound, isTieBreaker, pointMultiplier, timerSecondsRemaining } = roomState;

  if (!currentQuestion) return null;

  const difficultyStars =
    currentQuestion.difficulty === 'easy'
      ? '★☆☆'
      : currentQuestion.difficulty === 'medium'
      ? '★★☆'
      : '★★★';

  const difficultyColor =
    currentQuestion.difficulty === 'easy'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : currentQuestion.difficulty === 'medium'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 max-w-5xl mx-auto w-full text-center">
      {/* Top Badges Row */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        {isTieBreaker ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-bold uppercase tracking-widest text-xs animate-pulse">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Sudden Death Tie-Breaker · 3x Points</span>
          </div>
        ) : currentRound === 2 ? (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-extrabold uppercase tracking-widest text-sm shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
            <span>Round 2 · Category Twist! · Double Points (2x)</span>
          </div>
        ) : currentRound === 3 ? (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-300 font-extrabold uppercase tracking-widest text-sm shadow-lg shadow-rose-500/20">
            <Flame className="w-5 h-5 text-rose-400" />
            <span>Round 3 · Triple Points (3x)</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold uppercase tracking-widest text-xs">
            <span>Round 1 · Normal Stakes (1x Point)</span>
          </div>
        )}

        {/* Difficulty Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${difficultyColor}`}>
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Difficulty: {currentQuestion.difficulty} ({difficultyStars})</span>
        </div>

        {currentQuestion.isCustom && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/40 bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <span>Player Question</span>
          </div>
        )}
      </div>

      {/* Category Pill */}
      <div className="text-amber-400 font-bold tracking-widest uppercase text-sm md:text-base mb-4 flex items-center justify-center gap-2">
        <span>Category:</span>
        <span className="text-white underline decoration-amber-500 decoration-2 underline-offset-4">
          {currentQuestion.category}
        </span>
      </div>

      {/* Main Question Card with Optional Picture Above */}
      <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500" />

        {/* Question Picture Feature (when available) */}
        {currentQuestion.imageUrl && (
          <div className="w-full max-w-xl max-h-64 mb-6 rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl relative bg-slate-950">
            <img
              src={currentQuestion.imageUrl}
              alt="Question illustration"
              referrerPolicy="no-referrer"
              className="w-full h-48 md:h-60 object-cover rounded-2xl transition-transform hover:scale-105 duration-700"
              onError={(e) => {
                // If broken image URL, hide frame cleanly
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <h2 className="text-2xl md:text-4xl lg:text-5xl font-black font-display text-white leading-tight tracking-tight max-w-4xl mx-auto">
          {currentQuestion.prompt}
        </h2>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-6 text-slate-400 text-sm">
          <div className="flex items-center gap-2 text-amber-400 font-semibold">
            <Clock className="w-4 h-4" />
            <span>Get ready to bluff in {timerSecondsRemaining}s...</span>
          </div>
          <span>·</span>
          <span>1 Correct Answer + Player Lies</span>
        </div>
      </div>
    </div>
  );
};
