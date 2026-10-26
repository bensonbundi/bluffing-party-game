import { useEffect, useRef, useState, useCallback } from 'react';
import { GamePhase, QuestionResult } from '../types/game';
import { sound, SoundEvent, GlobalHitTrack, POPULAR_GLOBAL_HITS } from '../utils/sound';

interface UsePartySoundsOptions {
  phase?: GamePhase;
  timerSecondsRemaining?: number;
  lastResult?: QuestionResult;
  currentRound?: number;
  isTieBreaker?: boolean;
  enabled?: boolean;
}

export function usePartySounds(options: UsePartySoundsOptions = {}) {
  const {
    phase,
    timerSecondsRemaining,
    lastResult,
    currentRound,
    isTieBreaker,
    enabled = true
  } = options;

  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [currentTrack, setCurrentTrack] = useState<GlobalHitTrack>(sound.getCurrentTrack());
  const [isMusicActive, setIsMusicActive] = useState<boolean>(sound.isMusicActive());

  const prevPhaseRef = useRef<GamePhase | undefined>(undefined);
  const prevTimerRef = useRef<number | undefined>(undefined);

  // Subscribe to sound engine state updates
  useEffect(() => {
    const unsubscribe = sound.subscribe(() => {
      setIsMuted(sound.getMuted());
      setCurrentTrack(sound.getCurrentTrack());
      setIsMusicActive(sound.isMusicActive());
    });
    return unsubscribe;
  }, []);

  const triggerSound = useCallback((event: SoundEvent, opts?: { urgent?: boolean; count?: number }) => {
    if (!enabled) return;
    sound.trigger(event, opts);
  }, [enabled]);

  const toggleMute = useCallback(() => {
    const next = sound.toggleMute();
    setIsMuted(next);
    return next;
  }, []);

  const nextTrack = useCallback(() => {
    sound.playClick();
    return sound.nextTrack();
  }, []);

  const setTrack = useCallback((trackId: string) => {
    sound.playClick();
    sound.setTrack(trackId);
  }, []);

  // 1. Background Music for Answering Phases ('BLUFFING' & 'VOTING')
  useEffect(() => {
    if (!enabled) {
      sound.stopBackgroundMusic();
      return;
    }

    if (phase === 'BLUFFING' || phase === 'VOTING') {
      sound.startBackgroundMusic();
    } else {
      sound.stopBackgroundMusic();
    }

    return () => {
      sound.stopBackgroundMusic();
    };
  }, [phase, enabled]);

  // 2. Cycle to next popular global hit on each new question intro
  useEffect(() => {
    if (!enabled || !phase) return;

    if (prevPhaseRef.current !== phase) {
      if (phase === 'QUESTION_INTRO') {
        // Switch to the next global hit track for the upcoming question
        sound.nextTrack();
      }

      switch (phase) {
        case 'QUESTION_INTRO':
          if (currentRound === 2) {
            sound.trigger('category_twist');
          } else if (isTieBreaker) {
            sound.trigger('tie_breaker');
          } else {
            sound.trigger('lock_in');
          }
          break;

        case 'REVEAL_BLUFFS':
          sound.trigger('bluff_reveal');
          break;

        case 'REVEAL_TRUTH':
          sound.trigger('answer_reveal');
          break;

        case 'SCOREBOARD':
          sound.trigger('point_gain', { count: 4 });
          break;

        case 'TIE_BREAKER_SPLASH':
          sound.trigger('tie_breaker');
          break;

        case 'GAME_OVER':
          sound.trigger('victory_fanfare');
          break;
      }

      prevPhaseRef.current = phase;
    }
  }, [phase, currentRound, isTieBreaker, enabled]);

  // 3. Timer-based Sound Effects (Urgent countdown tick & time's up buzzer)
  useEffect(() => {
    if (!enabled || timerSecondsRemaining === undefined) return;

    const prev = prevTimerRef.current;
    prevTimerRef.current = timerSecondsRemaining;

    if (prev !== undefined && prev !== timerSecondsRemaining) {
      if (timerSecondsRemaining <= 5 && timerSecondsRemaining > 0) {
        sound.trigger('timer_urgent_tick');
      } else if (timerSecondsRemaining === 0 && (phase === 'BLUFFING' || phase === 'VOTING')) {
        sound.trigger('timer_buzzer');
      }
    }
  }, [timerSecondsRemaining, phase, enabled]);

  return {
    triggerSound,
    isMuted,
    toggleMute,
    currentTrack,
    availableTracks: POPULAR_GLOBAL_HITS,
    nextTrack,
    setTrack,
    isMusicActive,
    playClick: sound.playClick.bind(sound),
    playLockIn: sound.playLockIn.bind(sound),
    playBuzzer: sound.playTimerBuzzer.bind(sound),
    playAnswerReveal: sound.playRevealTruth.bind(sound),
    playBluffReveal: sound.playRevealBluff.bind(sound),
    playPointGain: sound.playPointGain.bind(sound),
    playVictory: sound.playVictoryFanfare.bind(sound)
  };
}
