import React, { useState } from 'react';
import { CheckCircle2, Clock, Ban } from 'lucide-react';
import { Player, RoomState } from '../../types/game';
import { sound } from '../../utils/sound';

interface MobileVotingProps {
  roomState: RoomState;
  currentPlayer: Player;
  onSubmitVote: (choiceId: string) => void;
}

export const MobileVoting: React.FC<MobileVotingProps> = ({
  roomState,
  currentPlayer,
  onSubmitVote
}) => {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const { choices, timerSecondsRemaining, submittedVotePlayerIds } = roomState;
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  const hasVoted = submittedVotePlayerIds.includes(currentPlayer.id) || selectedChoiceId !== null;

  const handleSelect = (choiceId: string, isOwnBluff: boolean) => {
    if (hasVoted || isOwnBluff) return;
    sound.playClick();
    sound.playLockIn();
    setSelectedChoiceId(choiceId);
    onSubmitVote(choiceId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
            Voting Phase
          </span>
          <div className="text-xs text-white font-extrabold">
            Find the Real Truth!
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono-nums">
          <Clock className={`w-3.5 h-3.5 ${timerSecondsRemaining <= 5 ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
          <span className={`text-base font-black ${timerSecondsRemaining <= 5 ? 'text-rose-400' : 'text-white'}`}>
            {timerSecondsRemaining}s
          </span>
        </div>
      </div>

      {/* Choices List */}
      <div className="my-auto py-4 space-y-3">
        {choices.map((choice, index) => {
          const letter = alphabet[index] || `${index + 1}`;
          const isOwnBluff = choice.authorPlayerId === currentPlayer.id ||
            Boolean(choice.authorPlayerIds && choice.authorPlayerIds.includes(currentPlayer.id));
          const isSelected = selectedChoiceId === choice.id;

          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice.id, isOwnBluff)}
              disabled={hasVoted || isOwnBluff}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
                isOwnBluff
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                  : isSelected
                  ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10 scale-[1.02]'
                  : hasVoted
                  ? 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-60'
                  : 'bg-slate-900 border-slate-700 hover:border-amber-400 hover:bg-slate-850 text-slate-100 active:scale-98'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm shrink-0 border ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-400'
                    : isOwnBluff
                    ? 'bg-slate-800 text-slate-500 border-slate-700'
                    : 'bg-slate-800 text-amber-400 border-slate-700'
                }`}
              >
                {letter}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold leading-snug">
                  {choice.text}
                </div>
                {isOwnBluff && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-400/80 font-bold uppercase mt-1">
                    <Ban className="w-3 h-3" />
                    {choice.isMerged ? 'Your lie (merged similar bluff)' : 'Your lie (cannot vote for yourself)'}
                  </span>
                )}
              </div>

              {isSelected && (
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="text-center text-xs text-slate-400 bg-slate-900/80 border border-slate-800 rounded-xl p-3">
        {hasVoted ? (
          <span className="text-emerald-400 font-bold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Vote locked in! Look at the TV for the reveal!
          </span>
        ) : (
          <span>Tap the answer you believe is the true historical fact</span>
        )}
      </div>
    </div>
  );
};
