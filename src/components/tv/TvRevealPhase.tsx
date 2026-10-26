import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle2, UserX, Award, Sparkles, BookOpen, Layers } from 'lucide-react';
import { Player, RoomState } from '../../types/game';
import { sound } from '../../utils/sound';

interface TvRevealPhaseProps {
  roomState: RoomState;
  onNextStep: () => void;
}

export const TvRevealPhase: React.FC<TvRevealPhaseProps> = ({ roomState, onNextStep }) => {
  const { phase, choices, lastResult, pointMultiplier, isTieBreaker, tiedPlayerIds } = roomState;

  useEffect(() => {
    if (phase === 'REVEAL_BLUFFS') {
      sound.playRevealBluff();
    } else if (phase === 'REVEAL_TRUTH') {
      sound.playRevealTruth();
    }
  }, [phase]);

  if (!lastResult) return null;

  const correctChoice = choices.find(c => c.isCorrect);
  const bluffChoices = choices.filter(c => !c.isCorrect && (c.authorPlayerId || (c.authorPlayerIds && c.authorPlayerIds.length > 0)));
  const bluffsWithVotes = bluffChoices.filter(c => c.voterIds.length > 0);
  const bluffsWithNoVotes = bluffChoices.filter(c => c.voterIds.length === 0);

  const getPlayer = (id: string) => roomState.players.find(p => p.id === id);

  return (
    <div className="flex-1 flex flex-col justify-between p-8 max-w-6xl mx-auto w-full">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            {phase === 'REVEAL_BLUFFS' ? 'Stage 1 of 2: The Deceptions' : 'Stage 2 of 2: The Truth'}
          </span>
          <h2 className="text-xl md:text-2xl font-black font-display text-white mt-1">
            {lastResult.question.prompt}
          </h2>
        </div>

        <button
          onClick={onNextStep}
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-extrabold text-xs tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-md transition-all active:scale-95"
        >
          <span>{phase === 'REVEAL_BLUFFS' ? 'REVEAL THE TRUTH' : 'VIEW SCORES'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      {phase === 'REVEAL_BLUFFS' ? (
        <div className="my-8 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
              Who Was Fooled by the Clever Lies?
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Players earn +{1 * pointMultiplier} {pointMultiplier > 1 ? `(${pointMultiplier}x)` : ''} for every opponent they tricked!
            </p>
          </div>

          {bluffsWithVotes.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 max-w-md mx-auto">
              <Sparkles className="w-8 h-8 mx-auto text-amber-400 mb-2 opacity-60" />
              <p className="font-bold text-base text-slate-200">Nobody fell for the lies!</p>
              <p className="text-xs text-slate-400 mt-1">Everyone spotted the truth or chose safe bets.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bluffsWithVotes.map((bluff) => {
                const authorIds = bluff.authorPlayerIds && bluff.authorPlayerIds.length > 0
                  ? bluff.authorPlayerIds
                  : bluff.authorPlayerId
                  ? [bluff.authorPlayerId]
                  : [];
                const authors = authorIds.map(id => getPlayer(id)).filter(Boolean) as Player[];
                const pointsEarned = bluff.voterIds.length * pointMultiplier;
                const isAuthorEligible = !isTieBreaker || authors.some(a => tiedPlayerIds.includes(a.id));

                return (
                  <div
                    key={bluff.id}
                    className="bg-slate-900/90 border-2 border-rose-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="text-xs uppercase font-extrabold tracking-wider text-rose-400">
                        Bluff / Fake Answer
                      </div>
                      {bluff.isMerged && (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-extrabold text-[10px] uppercase flex items-center gap-1 shadow-sm">
                          <Layers className="w-3 h-3 text-purple-400" />
                          <span>Merged Similar Bluffs</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xl font-black text-white mb-4">
                      "{bluff.text}"
                    </div>

                    {/* Who fell for it */}
                    <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 mb-4">
                      <div className="text-[11px] font-semibold uppercase text-slate-400 mb-2">
                        Fooled {bluff.voterIds.length} Player{bluff.voterIds.length > 1 ? 's' : ''}:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {bluff.voterIds.map((voterId) => {
                          const voter = getPlayer(voterId);
                          if (!voter) return null;
                          return (
                            <span
                              key={voterId}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold"
                            >
                              <span>{voter.avatar}</span>
                              <span>{voter.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Author credit & points */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {authors.map((a) => (
                            <span key={a.id} className="text-xl bg-slate-800 rounded-full p-0.5 border border-slate-700">
                              {a.avatar}
                            </span>
                          ))}
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">
                            {bluff.isMerged ? 'Co-written by:' : 'Written by:'}
                          </span>
                          <span className="font-extrabold text-sm text-white">
                            {authors.map((a) => a.name).join(' & ') || 'Unknown'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {isAuthorEligible ? (
                          <div className="text-lg font-black font-display text-emerald-400">
                            +{pointsEarned} PTS {bluff.isMerged ? 'EACH' : ''}
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-slate-500">
                            (No pts - tie breaker)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Unvoted bluffs */}
          {bluffsWithNoVotes.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Unsuccessful Bluffs (0 Votes):
              </span>
              <div className="flex flex-wrap gap-3">
                {bluffsWithNoVotes.map((bluff) => {
                  const authorNames = bluff.authorPlayerNames?.join(' & ') ||
                    (bluff.authorPlayerId ? getPlayer(bluff.authorPlayerId)?.name : 'Decoy');
                  return (
                    <div
                      key={bluff.id}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/60 text-slate-400 text-xs flex items-center gap-2"
                    >
                      <UserX className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-medium text-slate-300">"{bluff.text}"</span>
                      <span className="text-[11px] text-slate-500">
                        ({authorNames} {bluff.isMerged ? '· Merged' : ''})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* REVEAL_TRUTH STAGE */
        <div className="my-8 flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-extrabold uppercase tracking-widest text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>The Real Truth Revealed</span>
          </div>

          {/* Correct Answer Big Card with Picture if available */}
          <div className="w-full bg-gradient-to-b from-emerald-950/40 to-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center">
            {lastResult.question.imageUrl && (
              <div className="w-full max-w-md max-h-48 mb-4 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-xl bg-slate-950">
                <img
                  src={lastResult.question.imageUrl}
                  alt="Question illustration"
                  referrerPolicy="no-referrer"
                  className="w-full h-40 md:h-44 object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="text-2xl md:text-4xl font-black font-display text-white leading-tight">
              "{correctChoice?.text}"
            </div>

            {/* Fun Fact backstory */}
            {lastResult.question.funFact && (
              <div className="mt-6 pt-6 border-t border-emerald-900/50 flex items-start justify-center gap-3 text-slate-300 text-sm max-w-2xl mx-auto text-left">
                <BookOpen className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-emerald-300">Backstory: </strong>
                  {lastResult.question.funFact}
                </p>
              </div>
            )}
          </div>

          {/* Players who got it right */}
          <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-3 flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Saw Through The Lies (+{1 * pointMultiplier} pts each):</span>
            </div>

            {correctChoice?.voterIds.length === 0 ? (
              <p className="text-sm font-semibold text-slate-400 italic">
                Nobody guessed the truth! The bluffs were too powerful!
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {correctChoice?.voterIds.map((voterId) => {
                  const voter = getPlayer(voterId);
                  if (!voter) return null;
                  const isVoterEligible = !isTieBreaker || tiedPlayerIds.includes(voterId);

                  return (
                    <div
                      key={voterId}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 font-bold text-sm shadow-md"
                    >
                      <span className="text-xl">{voter.avatar}</span>
                      <span>{voter.name}</span>
                      {isVoterEligible ? (
                        <span className="text-xs bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md font-extrabold">
                          +{1 * pointMultiplier}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          (No pts)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
