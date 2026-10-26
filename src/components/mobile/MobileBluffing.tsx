import React, { useState } from 'react';
import { Send, Lock, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { Player, RoomState } from '../../types/game';
import { sound } from '../../utils/sound';

interface MobileBluffingProps {
  roomState: RoomState;
  currentPlayer: Player;
  onSubmitBluff: (text: string) => void;
  bluffFeedback: { valid: boolean; message?: string } | null;
}

export const MobileBluffing: React.FC<MobileBluffingProps> = ({
  roomState,
  currentPlayer,
  onSubmitBluff,
  bluffFeedback
}) => {
  const [bluffText, setBluffText] = useState('');
  const [hasSubmittedLocally, setHasSubmittedLocally] = useState(false);

  const { currentQuestion, timerSecondsRemaining, submittedBluffPlayerIds, players, currentRound } = roomState;
  const isLockedIn = submittedBluffPlayerIds.includes(currentPlayer.id) || hasSubmittedLocally;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = bluffText.trim();
    if (!clean) return;

    sound.playClick();
    sound.playLockIn();
    onSubmitBluff(clean);
    setHasSubmittedLocally(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Header & 30s Timer */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
            {currentRound === 2 ? 'Round 2 · Category Twist' : `Round ${currentRound}`}
          </span>
          <div className="text-xs text-slate-400 font-medium">
            Category: {currentQuestion?.category}
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono-nums">
          <Clock className={`w-3.5 h-3.5 ${timerSecondsRemaining <= 8 ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
          <span className={`text-base font-black ${timerSecondsRemaining <= 8 ? 'text-rose-400' : 'text-white'}`}>
            {timerSecondsRemaining}s
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="my-auto py-4 space-y-5">
        {/* Question Prompt */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-1">
            Question
          </p>
          <h2 className="text-base font-extrabold text-white leading-snug">
            {currentQuestion?.prompt}
          </h2>
        </div>

        {/* Feedback / Error message */}
        {bluffFeedback && !bluffFeedback.valid && bluffFeedback.message && (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="font-semibold">{bluffFeedback.message}</span>
          </div>
        )}

        {isLockedIn ? (
          /* Submitted State */
          <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black font-display text-white">
              Lie Locked In!
            </h3>
            <p className="text-xs text-slate-300 italic">
              "{bluffText || 'Your submitted bluff'}"
            </p>
            <div className="pt-2 text-xs text-slate-400 font-medium">
              Waiting for other players ({submittedBluffPlayerIds.length}/{players.length})...
            </div>
          </div>
        ) : (
          /* Form to type lie */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Write Your Bluff</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {bluffText.length}/60
                </span>
              </div>

              <textarea
                value={bluffText}
                onChange={(e) => setBluffText(e.target.value)}
                maxLength={60}
                rows={3}
                placeholder="Make up a convincing lie that sounds true..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-3.5 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none resize-none transition-colors"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!bluffText.trim()}
              className={`w-full py-3.5 rounded-xl font-display font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all ${
                bluffText.trim()
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 hover:from-amber-400 hover:to-rose-400 active:scale-98 shadow-amber-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              <span>SUBMIT BLUFF</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Tip footer */}
      <div className="text-center text-[11px] text-slate-500 pt-2">
        Tip: A good bluff sounds just believable enough to trick friends!
      </div>
    </div>
  );
};
