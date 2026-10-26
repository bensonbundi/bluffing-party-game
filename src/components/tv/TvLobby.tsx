import React from 'react';
import { Users, Bot, Play, Sparkles, Check, Plus, Trash2, Eye, ShieldCheck, Flame } from 'lucide-react';
import { Category, GameDifficultyMode, RoomState } from '../../types/game';
import { CATEGORIES_LIST } from '../../data/questions';
import { QrCodeView } from '../common/QrCodeView';
import { sound } from '../../utils/sound';

interface TvLobbyProps {
  roomState: RoomState;
  onStartGame: () => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateDifficultyMode: (mode: GameDifficultyMode) => void;
  onOpenCustomQuestions: () => void;
}

export const TvLobby: React.FC<TvLobbyProps> = ({
  roomState,
  onStartGame,
  onAddBot,
  onRemoveBot,
  onUpdateCategories,
  onUpdateDifficultyMode,
  onOpenCustomQuestions
}) => {
  const currentHost = typeof window !== 'undefined' ? window.location.origin : '';
  const joinUrl = `${currentHost}?room=${roomState.roomCode}`;

  const toggleCategory = (cat: Category) => {
    sound.playClick();
    const current = roomState.selectedCategories;
    let next: Category[];
    if (current.includes(cat)) {
      if (current.length <= 1) return;
      next = current.filter(c => c !== cat);
    } else {
      next = [...current, cat];
    }
    onUpdateCategories(next);
  };

  const handleDifficultyChange = (mode: GameDifficultyMode) => {
    sound.playClick();
    onUpdateDifficultyMode(mode);
  };

  const handleStartGame = () => {
    sound.playClick();
    sound.playLockIn();
    onStartGame();
  };

  const handleAddBot = () => {
    sound.playClick();
    onAddBot();
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Top Banner: Big Room Code & Connection Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">
        <div className="lg:col-span-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          {/* QR Code */}
          <div className="shrink-0 flex flex-col items-center">
            <QrCodeView url={joinUrl} size={150} />
            <span className="text-[11px] text-slate-400 mt-2 font-medium">Scan with phone camera</span>
          </div>

          {/* Join Instructions */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              Join with your smartphone
            </div>
            <div className="text-slate-300 text-sm font-medium">
              Open your phone browser and go to:
              <div className="font-mono text-sm md:text-base font-semibold text-white mt-1 break-all bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 inline-block">
                {joinUrl.replace(/^https?:\/\//, '')}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">
                Or enter Room Code on phone:
              </span>
              <div className="text-5xl md:text-6xl font-black font-display tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-amber-200 mt-0.5">
                {roomState.roomCode}
              </div>
            </div>
          </div>
        </div>

        {/* Start Game Action Card */}
        <div className="lg:col-span-4 flex flex-col justify-center items-center lg:items-end border-t lg:border-t-0 lg:border-l border-slate-800 pt-6 lg:pt-0 lg:pl-8">
          <div className="text-center lg:text-right mb-4">
            <div className="flex items-center justify-center lg:justify-end gap-2 text-slate-300 font-semibold text-sm">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{roomState.players.length} / 8 Players Joined</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {roomState.players.length < 2
                ? 'Need at least 2 players to start'
                : 'Ready to play!'}
            </p>
          </div>

          <div className="flex flex-col gap-2.5 w-full max-w-xs">
            <button
              onClick={handleStartGame}
              disabled={roomState.players.length < 2}
              className={`w-full py-4 px-6 rounded-2xl font-display font-black text-base tracking-wide flex items-center justify-center gap-3 shadow-lg transition-all ${
                roomState.players.length >= 2
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START GAME</span>
            </button>

            {roomState.players.length < 8 && (
              <button
                onClick={handleAddBot}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors flex items-center justify-center gap-2"
                title="Add simulated AI player for quick testing"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Add AI Test Player</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onOpenCustomQuestions();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center justify-center gap-2"
              title="View question pool for each category or add custom questions"
            >
              <Eye className="w-4 h-4" />
              <span>View Category Pools & Add ({roomState.customQuestionCount || 0} Custom)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Middle Section: Connected Players Grid */}
      <div className="my-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-200 tracking-wide flex items-center gap-2">
            <span>Connected Players</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 font-mono">
              {roomState.players.length}
            </span>
          </h2>
          <span className="text-xs text-slate-400">
            Players join from mobile devices
          </span>
        </div>

        {roomState.players.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
            <p className="text-sm font-medium">Waiting for players to connect...</p>
            <p className="text-xs mt-1 text-slate-400">
              Scan the QR code or visit the link above on your phone!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {roomState.players.map((player) => (
              <div
                key={player.id}
                className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col items-center text-center shadow-lg hover:border-slate-700 transition-all group"
                style={{ borderTop: `4px solid ${player.color}` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner mb-2"
                  style={{ backgroundColor: `${player.color}22` }}
                >
                  {player.avatar}
                </div>
                <div className="font-bold text-white text-xs truncate w-full">
                  {player.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {player.isBot ? (
                    <span className="text-cyan-400 font-medium">AI Bot</span>
                  ) : (
                    <span>Ready</span>
                  )}
                </div>

                {player.isBot && (
                  <button
                    onClick={() => onRemoveBot(player.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-opacity"
                    title="Remove Bot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pregame Difficulty Mode Selector & Categories */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
        {/* Pregame Difficulty Mode Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Pregame Difficulty Mode:</span>
            </span>
            <p className="text-[11px] text-slate-400">
              General knowledge calibrated for high school education level & news
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => handleDifficultyChange('easy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roomState.difficultyMode === 'easy'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ★ Casual (Easy)
            </button>

            <button
              onClick={() => handleDifficultyChange('standard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roomState.difficultyMode === 'standard' || !roomState.difficultyMode
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ★★ Standard (Progressive)
            </button>

            <button
              onClick={() => handleDifficultyChange('hard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                roomState.difficultyMode === 'hard'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ★★★ Challenger (Hard)
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-2.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Game Categories</span>
              <span className="text-[11px] text-amber-400 font-normal lowercase">
                (21 trivia categories)
              </span>
            </h3>

            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                <strong>Round 2:</strong> Category Twist picks surprise topics!
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES_LIST.map((cat) => {
              const isSelected = roomState.selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[10px] ${
                      isSelected
                        ? 'bg-amber-400 border-amber-400 text-slate-950'
                        : 'border-slate-600 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
