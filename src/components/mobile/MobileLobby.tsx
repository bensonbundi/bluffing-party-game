import React from 'react';
import { Users, Clock } from 'lucide-react';
import { Player, RoomState } from '../../types/game';

interface MobileLobbyProps {
  roomState: RoomState;
  currentPlayer: Player;
}

export const MobileLobby: React.FC<MobileLobbyProps> = ({ roomState, currentPlayer }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 max-w-md mx-auto text-center">
      {/* Top Header */}
      <div className="pt-4">
        <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
          Room {roomState.roomCode}
        </span>
        <h1 className="text-xl font-black font-display text-white mt-1">
          Connected to TV
        </h1>
      </div>

      {/* Player Profile Card */}
      <div className="my-auto py-8">
        <div
          className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-5xl mb-4 border-2 shadow-xl"
          style={{
            borderColor: currentPlayer.color,
            backgroundColor: `${currentPlayer.color}22`
          }}
        >
          {currentPlayer.avatar}
        </div>

        <h2 className="text-2xl font-black font-display text-white">
          {currentPlayer.name}
        </h2>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold mt-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Ready to Bamboozle</span>
        </div>

        <div className="mt-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-left">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-semibold">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Players in Lobby:</span>
            </span>
            <span>{roomState.players.length} / 8</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {roomState.players.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium"
              >
                <span>{p.avatar}</span>
                <span>{p.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions footer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-3 text-slate-400 text-xs">
        <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
        <span>Look up at the TV! The game will begin shortly.</span>
      </div>
    </div>
  );
};
