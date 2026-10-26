import React, { useState, useEffect } from 'react';
import { Tv, Smartphone, Sparkles, Flame, RefreshCw } from 'lucide-react';
import { useGameSocket } from './hooks/useGameSocket';
import { TvHeader } from './components/tv/TvHeader';
import { TvLobby } from './components/tv/TvLobby';
import { TvQuestionIntro } from './components/tv/TvQuestionIntro';
import { TvBluffingPhase } from './components/tv/TvBluffingPhase';
import { TvVotingPhase } from './components/tv/TvVotingPhase';
import { TvRevealPhase } from './components/tv/TvRevealPhase';
import { TvScoreboard } from './components/tv/TvScoreboard';
import { TvTieBreakerSplash } from './components/tv/TvTieBreakerSplash';
import { TvGameOver } from './components/tv/TvGameOver';
import { CustomQuestionsModal } from './components/common/CustomQuestionsModal';
import { MobileJoin } from './components/mobile/MobileJoin';
import { MobileLobby } from './components/mobile/MobileLobby';
import { MobileBluffing } from './components/mobile/MobileBluffing';
import { MobileVoting } from './components/mobile/MobileVoting';
import { MobileReveal } from './components/mobile/MobileReveal';
import { MobileGameOver } from './components/mobile/MobileGameOver';
import { usePartySounds } from './hooks/usePartySounds';
import { sound } from './utils/sound';

export default function App() {
  const {
    roomState,
    playerId,
    isHost,
    isConnected,
    errorMessage,
    bluffFeedback,
    createRoom,
    joinRoom,
    updateSettings,
    addBot,
    removeBot,
    addCustomQuestion,
    removeCustomQuestion,
    startGame,
    submitBluff,
    submitVote,
    nextStep,
    restartGame
  } = useGameSocket();

  // Mode: 'LANDING' | 'TV' | 'MOBILE'
  const [mode, setMode] = useState<'LANDING' | 'TV' | 'MOBILE'>('LANDING');
  const [showMobileTester, setShowMobileTester] = useState<boolean>(false);
  const [isCustomQuestionsOpen, setIsCustomQuestionsOpen] = useState<boolean>(false);
  const [prefilledRoomCode, setPrefilledRoomCode] = useState<string>('');

  // Hook up party sound effects to room state events
  usePartySounds({
    phase: roomState?.phase,
    timerSecondsRemaining: roomState?.timerSecondsRemaining,
    lastResult: roomState?.lastResult,
    currentRound: roomState?.currentRound,
    isTieBreaker: roomState?.isTieBreaker,
    enabled: mode === 'TV'
  });

  // Auto-detect room code in URL query string (e.g. ?room=ABCD or ?join=ABCD)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room') || params.get('join') || params.get('code');
    if (code) {
      setPrefilledRoomCode(code.toUpperCase());
      setMode('MOBILE');
    }
  }, []);

  const handleStartHosting = () => {
    sound.playClick();
    createRoom();
    setMode('TV');
  };

  const handleChooseMobile = () => {
    sound.playClick();
    setMode('MOBILE');
  };

  // Find current player in roomState if in mobile mode
  const currentPlayer = roomState && playerId ? roomState.players.find(p => p.id === playerId) : null;

  // --- LANDING SCREEN (Choose TV or Phone) ---
  if (mode === 'LANDING' && !roomState) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-tv-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top wordmark */}
        <header className="flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center font-display font-black text-slate-950 text-2xl shadow-lg shadow-amber-500/20">
              B
            </div>
            <span className="text-xl font-black font-display tracking-tight text-white">
              Bamboozle
            </span>
          </div>

          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            2–8 Players Party Game
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-4xl mx-auto w-full text-center my-auto py-12 z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-extrabold uppercase tracking-widest text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Trivia with High-Stakes Deception</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-display text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Fool Your Friends With Clever Lies.
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Played on your TV using smartphones as controllers. Make up believable fake answers to real trivia questions, trick your friends, and sniff out the truth!
          </p>

          {/* 3 Rounds & Features pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-300">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-semibold">
              Round 1: Normal Points
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Round 2: Category Twist! (2x Points)
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              Round 3: Triple Points (3x)
            </span>
          </div>

          {/* Action Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-8">
            {/* TV Screen Button */}
            <button
              onClick={handleStartHosting}
              className="bg-slate-900 hover:bg-slate-850 border-2 border-amber-500/40 hover:border-amber-400 rounded-3xl p-8 text-left transition-all hover:scale-[1.02] shadow-xl group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Tv className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black font-display text-white">
                  Host on TV
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Put this on the big TV or main screen. Displays the room code, QR code, timer, and dramatic answer reveals.
                </p>
              </div>
              <div className="mt-6 font-display font-extrabold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <span>CREATE ROOM</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>

            {/* Mobile Device Button */}
            <button
              onClick={handleChooseMobile}
              className="bg-slate-900 hover:bg-slate-850 border-2 border-slate-700/80 hover:border-slate-500 rounded-3xl p-8 text-left transition-all hover:scale-[1.02] shadow-xl group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black font-display text-white">
                  Join on Phone
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Enter a room code and nickname to use this device as your private buzzer and bluff-typing controller.
                </p>
              </div>
              <div className="mt-6 font-display font-extrabold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <span>JOIN GAME</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-500 py-2 z-10">
          Bamboozle Party Game · 2–8 Players · TV Display + Mobile Devices
        </footer>
      </div>
    );
  }

  // --- MOBILE CONTROLLER VIEW ---
  if (mode === 'MOBILE') {
    if (!roomState || !currentPlayer) {
      return (
        <MobileJoin
          initialRoomCode={prefilledRoomCode}
          onJoin={(code, name, avatar, color) => {
            joinRoom(code, name, avatar, color);
          }}
          errorMessage={errorMessage}
        />
      );
    }

    // Mobile Game Phase Router
    switch (roomState.phase) {
      case 'LOBBY':
      case 'QUESTION_INTRO':
      case 'TIE_BREAKER_SPLASH':
        return <MobileLobby roomState={roomState} currentPlayer={currentPlayer} />;
      case 'BLUFFING':
        return (
          <MobileBluffing
            roomState={roomState}
            currentPlayer={currentPlayer}
            onSubmitBluff={submitBluff}
            bluffFeedback={bluffFeedback}
          />
        );
      case 'VOTING':
        return (
          <MobileVoting
            roomState={roomState}
            currentPlayer={currentPlayer}
            onSubmitVote={submitVote}
          />
        );
      case 'REVEAL_BLUFFS':
      case 'REVEAL_TRUTH':
      case 'SCOREBOARD':
        return <MobileReveal roomState={roomState} currentPlayer={currentPlayer} />;
      case 'GAME_OVER':
        return <MobileGameOver roomState={roomState} currentPlayer={currentPlayer} />;
      default:
        return <MobileLobby roomState={roomState} currentPlayer={currentPlayer} />;
    }
  }

  // --- TV DISPLAY VIEW ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      {/* Background Party Glow */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none animate-tv-glow" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[140px] pointer-events-none" />

      {roomState && (
        <TvHeader
          roomState={roomState}
          onOpenMobileTester={() => setShowMobileTester(!showMobileTester)}
          onOpenCustomQuestions={() => setIsCustomQuestionsOpen(true)}
        />
      )}

      {/* Main TV Phase Router */}
      <main className="flex-1 flex flex-col z-10">
        {!roomState ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-4" />
            <h2 className="text-xl font-bold font-display text-white">
              Connecting to Game Server...
            </h2>
            <p className="text-xs text-slate-400 mt-1">Initializing room session</p>
          </div>
        ) : roomState.phase === 'LOBBY' ? (
          <TvLobby
            roomState={roomState}
            onStartGame={startGame}
            onAddBot={() => addBot()}
            onRemoveBot={(id) => removeBot(id)}
            onUpdateCategories={(cats) => updateSettings({ categories: cats })}
            onUpdateDifficultyMode={(diffMode) => updateSettings({ difficultyMode: diffMode })}
            onOpenCustomQuestions={() => setIsCustomQuestionsOpen(true)}
          />
        ) : roomState.phase === 'QUESTION_INTRO' ? (
          <TvQuestionIntro roomState={roomState} />
        ) : roomState.phase === 'BLUFFING' ? (
          <TvBluffingPhase roomState={roomState} />
        ) : roomState.phase === 'VOTING' ? (
          <TvVotingPhase roomState={roomState} />
        ) : roomState.phase === 'REVEAL_BLUFFS' || roomState.phase === 'REVEAL_TRUTH' ? (
          <TvRevealPhase roomState={roomState} onNextStep={nextStep} />
        ) : roomState.phase === 'SCOREBOARD' ? (
          <TvScoreboard roomState={roomState} onNextQuestion={nextStep} />
        ) : roomState.phase === 'TIE_BREAKER_SPLASH' ? (
          <TvTieBreakerSplash roomState={roomState} />
        ) : roomState.phase === 'GAME_OVER' ? (
          <TvGameOver roomState={roomState} onRestart={restartGame} />
        ) : null}
      </main>

      {/* TV Bottom Footer bar */}
      <footer className="w-full px-8 py-3 bg-slate-950/80 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500 z-20">
        <div>
          Bamboozle Party Game · TV Screen
        </div>
        <div className="flex items-center gap-4">
          {roomState && (
            <span>
              Players: <strong className="text-slate-300">{roomState.players.length}</strong> / 8
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>{isConnected ? 'Server Connected' : 'Connecting...'}</span>
          </span>
        </div>
      </footer>

      {/* Optional Side-by-Side Mobile Controller Simulator Drawer (for seamless single-screen testing) */}
      {showMobileTester && roomState && (
        <aside className="fixed inset-y-0 right-0 w-96 bg-slate-950 border-l border-slate-800 shadow-2xl z-50 flex flex-col">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone Preview</span>
            </span>
            <button
              onClick={() => setShowMobileTester(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* If host player or not joined in simulator */}
            {!currentPlayer ? (
              <MobileJoin
                initialRoomCode={roomState.roomCode}
                onJoin={(c, n, a, col) => joinRoom(c, n, a, col)}
                errorMessage={errorMessage}
              />
            ) : roomState.phase === 'BLUFFING' ? (
              <MobileBluffing
                roomState={roomState}
                currentPlayer={currentPlayer}
                onSubmitBluff={submitBluff}
                bluffFeedback={bluffFeedback}
              />
            ) : roomState.phase === 'VOTING' ? (
              <MobileVoting
                roomState={roomState}
                currentPlayer={currentPlayer}
                onSubmitVote={submitVote}
              />
            ) : roomState.phase === 'REVEAL_BLUFFS' || roomState.phase === 'REVEAL_TRUTH' || roomState.phase === 'SCOREBOARD' ? (
              <MobileReveal
                roomState={roomState}
                currentPlayer={currentPlayer}
              />
            ) : roomState.phase === 'GAME_OVER' ? (
              <MobileGameOver
                roomState={roomState}
                currentPlayer={currentPlayer}
              />
            ) : (
              <MobileLobby
                roomState={roomState}
                currentPlayer={currentPlayer}
              />
            )}
          </div>
        </aside>
      )}

      {/* Custom Questions Pool Modal */}
      <CustomQuestionsModal
        isOpen={isCustomQuestionsOpen}
        onClose={() => setIsCustomQuestionsOpen(false)}
        customQuestions={roomState?.customQuestions}
        onAddQuestion={addCustomQuestion}
        onRemoveQuestion={removeCustomQuestion}
      />
    </div>
  );
}
