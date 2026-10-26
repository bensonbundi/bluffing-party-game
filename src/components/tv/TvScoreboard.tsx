import React, { useState, useEffect } from 'react';
import { Trophy, ArrowRight, Flame, Sparkles } from 'lucide-react';
import { Player, RoomState } from '../../types/game';
import { sound } from '../../utils/sound';

interface TvScoreboardProps {
  roomState: RoomState;
  onNextQuestion: () => void;
}

export const TvScoreboard: React.FC<TvScoreboardProps> = ({ roomState, onNextQuestion }) => {
  const { players, currentRound, isTieBreaker, tiedPlayerIds, timerSecondsRemaining, currentQuestionIndex, questionsPerRound } = roomState;

  // Track animated scores per player
  const [animatedScores, setAnimatedScores] = useState<{ [playerId: string]: number }>({});
  const [animationCompleted, setAnimationCompleted] = useState<boolean>(false);

  // Animate scores rolling up smoothly
  useEffect(() => {
    const initialMap: { [id: string]: number } = {};
    const targetMap: { [id: string]: number } = {};

    players.forEach(p => {
      const start = p.previousScore !== undefined ? p.previousScore : Math.max(0, p.score - p.lastRoundScoreDelta);
      initialMap[p.id] = start;
      targetMap[p.id] = p.score;
    });

    setAnimatedScores(initialMap);
    setAnimationCompleted(false);

    const startTime = performance.now();
    const duration = 1800; // 1.8 seconds animation

    let animationFrameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentValues: { [id: string]: number } = {};
      players.forEach(p => {
        const start = initialMap[p.id] || 0;
        const target = targetMap[p.id] || 0;
        const val = Math.round(start + (target - start) * eased);
        currentValues[p.id] = val;
      });

      setAnimatedScores(currentValues);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        setAnimationCompleted(true);
        sound.playLockIn();
      }
    };

    const timer = setTimeout(() => {
      animationFrameId = requestAnimationFrame(tick);
    }, 300);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [players]);

  // Sort players by their final score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...players.map(p => p.score), 10);

  const isNextQuestionNewRound = (currentQuestionIndex % questionsPerRound === 0) && currentRound < 3;

  return (
    <div className="flex-1 flex flex-col justify-between p-6 md:p-8 max-w-5xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-5 md:p-6 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-tight">
              Current Standings
            </h2>
            <p className="text-xs text-slate-400">
              Scores after question {currentQuestionIndex}
            </p>
          </div>
        </div>

        {/* Next Question Countdown or Manual Button */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Auto-advancing in {timerSecondsRemaining}s
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onNextQuestion();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-md transition-all active:scale-95"
          >
            <span>CONTINUE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Animated Leaderboard List */}
      <div className="my-5 space-y-3">
        {sortedPlayers.map((player, index) => {
          const rank = index + 1;
          const isTiedLeader = isTieBreaker && tiedPlayerIds.includes(player.id);
          const displayScore = animatedScores[player.id] !== undefined ? animatedScores[player.id] : player.score;
          const scorePercent = Math.min(100, (displayScore / maxScore) * 100);

          return (
            <div
              key={player.id}
              className={`p-4 rounded-2xl border transition-all shadow-md relative overflow-hidden ${
                rank === 1
                  ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/60 scale-[1.01]'
                  : rank === 2
                  ? 'bg-slate-900/90 border-slate-700/80'
                  : 'bg-slate-900/70 border-slate-800/80'
              }`}
            >
              {/* Subtle background score bar fill */}
              <div
                className="absolute left-0 bottom-0 top-0 opacity-10 bg-gradient-to-r from-transparent to-amber-400 transition-all duration-300"
                style={{ width: `${scorePercent}%` }}
              />

              <div className="relative z-10 flex items-center justify-between">
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm shrink-0 ${
                      rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : rank === 3
                        ? 'bg-amber-700 text-amber-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{rank}
                  </div>

                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: `${player.color}22` }}
                  >
                    {player.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-white">
                        {player.name}
                      </span>
                      {player.isBot && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                          BOT
                        </span>
                      )}
                      {isTiedLeader && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/50 font-bold uppercase tracking-wider">
                          Tied for 1st
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {player.lastRoundScoreDelta > 0
                        ? `+${player.lastRoundScoreDelta} points earned`
                        : 'No points earned this question'}
                    </span>
                  </div>
                </div>

                {/* Right: Point Delta Exploder & Animated Cumulative Score */}
                <div className="flex items-center gap-5">
                  {player.lastRoundScoreDelta > 0 && (
                    <div
                      className={`font-display font-black text-sm tracking-wide px-3 py-1 rounded-lg border transition-all ${
                        animationCompleted
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 scale-100'
                          : 'bg-amber-500/30 border-amber-400 text-amber-200 scale-110 shadow-lg shadow-amber-500/20 animate-pulse'
                      }`}
                    >
                      +{player.lastRoundScoreDelta} PTS
                    </div>
                  )}

                  <div className="text-right min-w-[80px]">
                    <div className="text-3xl font-black font-display font-mono-nums text-white transition-all">
                      {displayScore}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Points
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Announcement Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
        {isTieBreaker ? (
          <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-sm">
            <Flame className="w-4 h-4" />
            <span>Sudden death continues until tie for 1st place is broken!</span>
          </div>
        ) : isNextQuestionNewRound && currentRound === 1 ? (
          <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Coming up next: ROUND 2 · CATEGORY TWIST (DOUBLE POINTS!)</span>
          </div>
        ) : isNextQuestionNewRound && currentRound === 2 ? (
          <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-sm">
            <Flame className="w-4 h-4" />
            <span>Coming up next: ROUND 3 · TRIPLE STAKES (TRIPLE POINTS!)</span>
          </div>
        ) : (
          <div className="text-slate-400 text-xs font-medium">
            Next question starting soon... Stay alert!
          </div>
        )}
      </div>
    </div>
  );
};
