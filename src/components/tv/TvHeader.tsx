import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Flame, Tv, PlusCircle, Music, SkipForward, ChevronDown, Check } from 'lucide-react';
import { RoomState } from '../../types/game';
import { sound, POPULAR_GLOBAL_HITS, GlobalHitTrack } from '../../utils/sound';

interface TvHeaderProps {
  roomState: RoomState;
  onOpenMobileTester?: () => void;
  onOpenCustomQuestions?: () => void;
}

export const TvHeader: React.FC<TvHeaderProps> = ({
  roomState,
  onOpenMobileTester,
  onOpenCustomQuestions
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [currentTrack, setCurrentTrack] = useState<GlobalHitTrack>(sound.getCurrentTrack());
  const [isMusicActive, setIsMusicActive] = useState<boolean>(sound.isMusicActive());
  const [isTrackMenuOpen, setIsTrackMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = sound.subscribe(() => {
      setIsMuted(sound.getMuted());
      setCurrentTrack(sound.getCurrentTrack());
      setIsMusicActive(sound.isMusicActive());
    });

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsTrackMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsub();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleSound = () => {
    sound.toggleMute();
  };

  const handleNextTrack = () => {
    sound.playClick();
    sound.nextTrack();
  };

  const handleSelectTrack = (trackId: string) => {
    sound.playClick();
    sound.setTrack(trackId);
    setIsTrackMenuOpen(false);
  };

  const getRoundLabel = () => {
    if (roomState.isTieBreaker) {
      return (
        <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-xs">
          <Flame className="w-4 h-4 text-amber-400" />
          Sudden Death Tie-Breaker
        </span>
      );
    }
    if (roomState.currentRound === 2) {
      return (
        <span className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-xs">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Round 2 · Category Twist! (2x Points)
        </span>
      );
    }
    if (roomState.currentRound === 3) {
      return (
        <span className="flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-wider text-xs">
          <Flame className="w-4 h-4 text-rose-400" />
          Round 3 · Triple Stakes (3x Points)
        </span>
      );
    }
    return (
      <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">
        Round 1 · Normal Stakes (1x Points)
      </span>
    );
  };

  return (
    <header className="w-full flex items-center justify-between px-6 md:px-8 py-3.5 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md z-30">
      {/* Brand & Room Info */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20 font-extrabold text-slate-950 text-xl font-display">
            B
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white font-display leading-tight">
              Bamboozle
            </h1>
            <span className="text-[11px] text-slate-400">TV Display</span>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800" />

        {/* Room Code Badge */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1">
          <span className="text-xs text-slate-400">Room:</span>
          <span className="font-mono-nums font-extrabold text-amber-400 tracking-wider text-sm">
            {roomState.roomCode}
          </span>
        </div>

        {/* Round Status */}
        {roomState.phase !== 'LOBBY' && (
          <div className="hidden md:flex items-center gap-2 bg-slate-800/50 border border-slate-700/40 rounded-lg px-3 py-1">
            {getRoundLabel()}
          </div>
        )}
      </div>

      {/* Controls & Popular Global Hits Audio Bar */}
      <div className="flex items-center gap-2.5">
        {/* Popular Global Hits Track Pill & Selector */}
        <div className="relative" ref={menuRef}>
          <div className="flex items-center bg-slate-800/90 border border-slate-700/70 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setIsTrackMenuOpen(!isTrackMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700/60 transition-colors"
              title="Change Global Hit Track"
            >
              {/* Equalizer animation bars if playing, or music note */}
              {isMusicActive ? (
                <div className="flex items-end gap-0.5 h-3.5 w-3 px-0.5">
                  <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_ease-in-out] h-full" />
                  <span className="w-0.5 bg-rose-400 rounded-full animate-[bounce_0.4s_infinite_ease-in-out_0.2s] h-2/3" />
                  <span className="w-0.5 bg-amber-300 rounded-full animate-[bounce_0.8s_infinite_ease-in-out_0.1s] h-4/5" />
                </div>
              ) : (
                <Music className="w-3.5 h-3.5 text-amber-400" />
              )}

              <div className="flex items-center gap-1.5 text-left">
                <span className="text-amber-300 font-bold truncate max-w-[100px] sm:max-w-[150px]">
                  {currentTrack.title}
                </span>
                <span className="text-slate-400 text-[10px] hidden md:inline truncate max-w-[90px]">
                  · {currentTrack.artist}
                </span>
              </div>

              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isTrackMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Next Track Skip Button */}
            <button
              onClick={handleNextTrack}
              className="px-2 py-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-700/60 transition-colors border-l border-slate-700/60"
              title="Next Global Hit (Skip Track)"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Track Selection Dropdown Menu */}
          {isTrackMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                <span>Popular Global Hits</span>
                <span className="text-[10px] text-slate-500 font-normal">Synthesized BGM</span>
              </div>

              <div className="py-1 max-h-64 overflow-y-auto space-y-1">
                {POPULAR_GLOBAL_HITS.map((track) => {
                  const isCurrent = track.id === currentTrack.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleSelectTrack(track.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors text-xs ${
                        isCurrent
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="truncate font-semibold">{track.title}</span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {track.artist} · <span className="text-slate-500">{track.genre}</span>
                        </span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {onOpenCustomQuestions && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenCustomQuestions();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Add or view custom questions in the game pool"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Question Pool</span>
            {roomState.customQuestionCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                {roomState.customQuestionCount}
              </span>
            )}
          </button>
        )}

        {onOpenMobileTester && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenMobileTester();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Open a simulated phone controller to test locally"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span>Test Phone</span>
          </button>
        )}

        <button
          onClick={handleToggleSound}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};
