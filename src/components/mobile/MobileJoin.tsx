import React, { useState } from 'react';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { PLAYER_AVATARS, PLAYER_COLORS } from '../../data/questions';
import { sound } from '../../utils/sound';

interface MobileJoinProps {
  initialRoomCode?: string;
  onJoin: (roomCode: string, name: string, avatar: string, color: string) => void;
  errorMessage?: string | null;
}

export const MobileJoin: React.FC<MobileJoinProps> = ({
  initialRoomCode = '',
  onJoin,
  errorMessage
}) => {
  const [code, setCode] = useState(initialRoomCode.toUpperCase());
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(PLAYER_AVATARS[0]);
  const [color, setColor] = useState(PLAYER_COLORS[0].hex);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanCode) {
      setLocalError('Please enter the 4-letter Room Code from the TV screen');
      return;
    }
    if (!cleanName) {
      setLocalError('Please enter a username or nickname');
      return;
    }

    setLocalError(null);
    onJoin(cleanCode, cleanName, avatar, color);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Header */}
      <div className="text-center pt-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center font-display font-black text-2xl text-slate-950 mx-auto shadow-lg shadow-amber-500/20 mb-3">
          B
        </div>
        <h1 className="text-2xl font-black font-display text-white tracking-tight">
          Bamboozle
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Mobile Controller
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 my-auto">
        {(errorMessage || localError) && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage || localError}</span>
          </div>
        )}

        {/* Room Code Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Room Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={4}
            placeholder="e.g. BLUF"
            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-center font-mono text-2xl font-black tracking-widest text-amber-400 uppercase placeholder:text-slate-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Username Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Your Nickname
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={15}
            placeholder="e.g. CleverSam"
            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-base font-bold text-white placeholder:text-slate-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Avatar Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Pick Your Avatar
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PLAYER_AVATARS.slice(0, 8).map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAvatar(emoji);
                }}
                className={`h-12 rounded-xl text-2xl flex items-center justify-center border transition-all ${
                  avatar === emoji
                    ? 'bg-slate-800 border-amber-400 scale-105 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Pick Player Color
          </label>
          <div className="flex justify-between gap-1">
            {PLAYER_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setColor(c.hex);
                }}
                className={`w-9 h-9 rounded-xl border-2 transition-transform ${
                  color === c.hex ? 'scale-110 border-white shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl font-display font-extrabold text-base tracking-wide bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <span>JOIN ROOM</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-500 pb-2">
        Game is played on the TV · Your phone is your controller
      </div>
    </div>
  );
};
