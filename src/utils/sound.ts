/**
 * Web Audio API synthesized party game sound effects & Popular Global Hits background music.
 * 100% self-contained, zero external mp3 files required.
 */

export interface GlobalHitTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  genre: string;
  year: string;
}

export const POPULAR_GLOBAL_HITS: GlobalHitTrack[] = [
  {
    id: 'billie-jean',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    bpm: 117,
    genre: 'Pop / Funk',
    year: '1982'
  },
  {
    id: 'blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    bpm: 171,
    genre: 'Synth-Pop',
    year: '2019'
  },
  {
    id: 'calm-down',
    title: 'Calm Down',
    artist: 'Rema',
    bpm: 107,
    genre: 'Afrobeats',
    year: '2022'
  },
  {
    id: 'shape-of-you',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    bpm: 96,
    genre: 'Dancehall Pop',
    year: '2017'
  },
  {
    id: 'stayin-alive',
    title: "Stayin' Alive",
    artist: 'Bee Gees',
    bpm: 104,
    genre: 'Disco Classic',
    year: '1977'
  },
  {
    id: 'uptown-funk',
    title: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    bpm: 115,
    genre: 'Funk / Pop',
    year: '2014'
  },
  {
    id: 'despacito',
    title: 'Despacito',
    artist: 'Luis Fonsi',
    bpm: 89,
    genre: 'Latin Pop / Reggaeton',
    year: '2017'
  }
];

export type SoundEvent =
  | 'timer_tick'
  | 'timer_urgent_tick'
  | 'timer_buzzer'
  | 'bluff_reveal'
  | 'answer_reveal'
  | 'point_gain'
  | 'lock_in'
  | 'vote_cast'
  | 'category_twist'
  | 'tie_breaker'
  | 'victory_fanfare'
  | 'click';

class SoundEffects {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: ReturnType<typeof setInterval> | null = null;
  private isBgmPlaying: boolean = false;
  private bgmGainNode: GainNode | null = null;
  private bgmStep: number = 0;
  private currentTrackIndex: number = 0;
  private listeners: Array<() => void> = [];

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch {
        // Ignored
      }
    });
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted) {
      this.stopBackgroundMusic();
    }
    this.notify();
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBackgroundMusic();
    }
    this.notify();
    return this.isMuted;
  }

  public getAvailableTracks(): GlobalHitTrack[] {
    return POPULAR_GLOBAL_HITS;
  }

  public getCurrentTrack(): GlobalHitTrack {
    return POPULAR_GLOBAL_HITS[this.currentTrackIndex] || POPULAR_GLOBAL_HITS[0];
  }

  public setTrack(trackId: string) {
    const idx = POPULAR_GLOBAL_HITS.findIndex((t) => t.id === trackId);
    if (idx !== -1) {
      this.currentTrackIndex = idx;
      this.notify();
      if (this.isBgmPlaying) {
        this.stopBackgroundMusic();
        this.startBackgroundMusic();
      }
    }
  }

  public nextTrack(): GlobalHitTrack {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % POPULAR_GLOBAL_HITS.length;
    this.notify();
    if (this.isBgmPlaying) {
      this.stopBackgroundMusic();
      this.startBackgroundMusic();
    }
    return this.getCurrentTrack();
  }

  public isMusicActive(): boolean {
    return this.isBgmPlaying && !this.isMuted;
  }

  // --- Dynamic Background Music Engine (Popular Global Hits) ---
  public startBackgroundMusic(trackId?: string) {
    if (this.isMuted) return;

    if (trackId) {
      const idx = POPULAR_GLOBAL_HITS.findIndex((t) => t.id === trackId);
      if (idx !== -1) this.currentTrackIndex = idx;
    }

    if (this.isBgmPlaying) return;

    const ctx = this.initCtx();
    if (!ctx) return;

    this.isBgmPlaying = true;
    this.bgmStep = 0;
    this.notify();

    // Master BGM Gain
    this.bgmGainNode = ctx.createGain();
    this.bgmGainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    this.bgmGainNode.connect(ctx.destination);

    const track = this.getCurrentTrack();

    // Calculate step interval in milliseconds based on BPM
    // 16th note steps for high precision
    // 16th step duration = (60 / bpm) / 4 * 1000 ms
    const sixteenthDurationMs = Math.round(((60 / track.bpm) / 4) * 1000);
    // Use an eighth-note or sixteenth-note step duration appropriate for the groove
    const stepDurationMs = track.bpm > 140 ? sixteenthDurationMs * 2 : sixteenthDurationMs;

    this.bgmInterval = setInterval(() => {
      if (!this.isBgmPlaying || this.isMuted || !this.ctx || !this.bgmGainNode) return;
      const now = this.ctx.currentTime;
      const step = this.bgmStep;

      try {
        switch (track.id) {
          case 'billie-jean':
            this.playBillieJeanStep(now, step % 32);
            break;
          case 'blinding-lights':
            this.playBlindingLightsStep(now, step % 32);
            break;
          case 'calm-down':
            this.playCalmDownStep(now, step % 32);
            break;
          case 'shape-of-you':
            this.playShapeOfYouStep(now, step % 32);
            break;
          case 'stayin-alive':
            this.playStayinAliveStep(now, step % 32);
            break;
          case 'uptown-funk':
            this.playUptownFunkStep(now, step % 32);
            break;
          case 'despacito':
            this.playDespacitoStep(now, step % 32);
            break;
          default:
            this.playBillieJeanStep(now, step % 32);
            break;
        }
      } catch {
        // Continue playback gracefully
      }

      this.bgmStep++;
    }, stepDurationMs);
  }

  public stopBackgroundMusic() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGainNode && this.ctx) {
      try {
        this.bgmGainNode.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
      } catch {
        // Ignored
      }
    }
    this.notify();
  }

  // --- Track 1: Michael Jackson - "Billie Jean" ---
  // F# minor bassline + iconic synth chords + crisp drum bounce
  private playBillieJeanStep(now: number, step: number) {
    if (!this.ctx || !this.bgmGainNode) return;

    // 1. Drum beat: Kick on 0, 8, 16, 24 | Snare on 4, 12, 20, 28 | Hi-hat on even steps
    if (step % 8 === 0) {
      this.synthKick(now);
    }
    if (step % 8 === 4) {
      this.synthSnare(now);
    }
    if (step % 2 === 0) {
      this.synthHiHat(now, step % 4 === 2 ? 0.018 : 0.009);
    }

    // 2. Iconic F# minor Bassline: F#2, C#3, E3, F#3, E3, C#3, B2, C#3
    const bassline = [
      92.50, 0, 138.59, 0, 164.81, 0, 185.00, 0,
      164.81, 0, 138.59, 0, 123.47, 0, 138.59, 0
    ];
    const bassNote = bassline[step % 16];
    if (bassNote > 0) {
      this.synthBass(now, bassNote, 0.16, 'triangle');
    }

    // 3. Synth string / vocal hook ("Billie Jean is not my lover...")
    // Melodic sequence on steps 0-31
    const leadNotes: { [step: number]: number } = {
      0: 554.37, // C#5
      2: 554.37, // C#5
      4: 493.88, // B4
      6: 440.00, // A4
      8: 415.30, // G#4
      10: 369.99, // F#4
      12: 440.00, // A4
      14: 415.30, // G#4
      16: 554.37, // C#5
      18: 554.37, // C#5
      20: 493.88, // B4
      22: 440.00, // A4
      24: 493.88, // B4
      26: 440.00, // A4
      28: 369.99  // F#4
    };

    if (leadNotes[step]) {
      this.synthLead(now, leadNotes[step], 0.18, 'sine', 0.08);
    }
  }

  // --- Track 2: The Weeknd - "Blinding Lights" ---
  // 80s Synthwave hook + driving synth bass
  private playBlindingLightsStep(now: number, step: number) {
    if (!this.ctx || !this.bgmGainNode) return;

    // Driving four-on-the-floor beat
    if (step % 4 === 0) {
      this.synthKick(now);
    }
    if (step % 8 === 4) {
      this.synthSnare(now);
    }
    this.synthHiHat(now, 0.012);

    // 80s Pumping Bass: F2 -> Eb2 -> Db2 -> Eb2
    const bassNotes = [87.31, 87.31, 77.78, 77.78, 69.30, 69.30, 77.78, 77.78];
    const bNote = bassNotes[Math.floor(step / 4) % bassNotes.length];
    if (step % 2 === 0) {
      this.synthBass(now, bNote, 0.14, 'sawtooth');
    }

    // Soaring 80s Synth Hook:
    // C5, C5, Ab4, Bb4, C5, Bb4, F4, G4, Ab4, G4, Eb4, F4
    const leadMap: { [s: number]: number } = {
      0: 523.25, // C5
      2: 523.25, // C5
      4: 415.30, // Ab4
      6: 466.16, // Bb4
      8: 523.25, // C5
      10: 466.16, // Bb4
      12: 349.23, // F4
      14: 392.00, // G4
      16: 415.30, // Ab4
      18: 392.00, // G4
      20: 311.13, // Eb4
      22: 349.23, // F4
      26: 523.25, // C5
      28: 466.16  // Bb4
    };

    if (leadMap[step]) {
      this.synthLead(now, leadMap[step], 0.22, 'square', 0.07);
    }
  }

  // --- Track 3: Rema - "Calm Down" (Afrobeats Smash) ---
  // Infectious bouncy log-drum / bass + sweet kalimba melody
  private playCalmDownStep(now: number, step: number) {
    if (!this.ctx || !this.bgmGainNode) return;

    // Afrobeats dembow kick/cross-stick pattern
    if (step === 0 || step === 6 || step === 16 || step === 22) {
      this.synthKick(now);
    }
    if (step === 4 || step === 12 || step === 20 || step === 28) {
      this.synthSnare(now);
    }
    if (step % 2 === 1) {
      this.synthHiHat(now, 0.015);
    }

    // Bouncy Afrobeats Bass: B2 -> G2 -> D3 -> A2
    const afrobeatsBass = [
      123.47, 0, 123.47, 0, 0, 0, 98.00, 0,
      146.83, 0, 146.83, 0, 0, 0, 110.00, 0
    ];
    const bNote = afrobeatsBass[step % 16];
    if (bNote > 0) {
      this.synthBass(now, bNote, 0.22, 'sine');
    }

    // Kalimba / Vocal melody: F#4, E4, D4, B3, D4, E4, F#4, A4...
    const melodyMap: { [s: number]: number } = {
      0: 369.99, // F#4
      2: 329.63, // E4
      4: 293.66, // D4
      6: 246.94, // B3
      8: 293.66, // D4
      10: 329.63, // E4
      12: 369.99, // F#4
      14: 440.00, // A4
      16: 369.99, // F#4
      18: 329.63, // E4
      20: 293.66, // D4
      24: 246.94, // B3
      28: 293.66  // D4
    };

    if (melodyMap[step]) {
      this.synthLead(now, melodyMap[step], 0.2, 'triangle', 0.09);
    }
  }

  // --- Track 4: Ed Sheeran - "Shape of You" ---
  // Legendary syncopated marimba pluck in C# minor
  private playShapeOfYouStep(now: number, step: number) {
    if (!this.ctx || !this.bgmGainNode) return;

    // Rhythmic snap on 4, 12, 20, 28
    if (step % 8 === 4) {
      this.synthSnare(now);
    }
    if (step % 4 === 0) {
      this.synthHiHat(now, 0.01);
    }

    // Warm sub-bass: C#2, F#2, A2, B2
    const bassline = [69.30, 92.50, 110.00, 123.47];
    const bNote = bassline[Math.floor(step / 8) % bassline.length];
    if (step % 4 === 0) {
      this.synthBass(now, bNote, 0.2, 'triangle');
    }

    // The Famous Marimba Ostinato:
    // C#4, E4, C#4, C#4, E4, C#4, D#4, B3
    const marimbaSteps: { [s: number]: number } = {
      0: 277.18, // C#4
      1: 329.63, // E4
      3: 277.18, // C#4
      4: 277.18, // C#4
      6: 329.63, // E4
      7: 277.18, // C#4
      9: 311.13, // D#4
      11: 246.94, // B3
      16: 277.18, // C#4
      17: 329.63, // E4
      19: 277.18, // C#4
      20: 277.18, // C#4
      22: 329.63, // E4
      23: 277.18, // C#4
      25: 311.13, // D#4
      27: 246.94  // B3
    };

    if (marimbaSteps[step]) {
      this.synthLead(now, marimbaSteps[step], 0.14, 'sine', 0.1);
    }
  }

  // --- Track 5: Bee Gees - "Stayin' Alive" ---
  // Disco walking bass & upbeat disco groove
  private playStayinAliveStep(now: number, step: number) {
    if (!this.ctx || !this.bgmGainNode) return;

    // Four-on-the-floor disco kick
    if (step % 4 === 0) {
      this.synthKick(now);
    }
    if (step % 8 === 4) {
      this.synthSnare(now);
    }
    // Open/closed disco hi-hat
    this.synthHiHat(now, step % 2 === 1 ? 0.022 : 0.008);

    // Walking disco bass: F2, F2, F2, Ab2, Bb2, C3, Bb2, Ab2
    const discoBass = [
      87.31, 0, 87.31, 0, 87.31, 0, 103.83, 0,
      116.54, 0, 130.81, 0, 116.54, 0, 103.83, 0
    ];
    const bNote = discoBass[step % 16];
    if (bNote > 0) {
      this.synthBass(now, bNote, 0.15, 'triangle');
    }

    // Melodic brass/falsetto hook
    const leadMap: { [s: number]: number } = {
      0: 523.25, // C5
      4: 466.16, // Bb4
      8: 415.30, // Ab4
      10: 349.23, // F4
      12: 415.30, // Ab4
      14: 466.16, // Bb4
      16: 523.25, // C5
      20: 466.16, // Bb4
      24: 415.30, // Ab4
      28: 349.23  // F4
    };

    if (leadMap[step]) {
      this.synthLead(now, leadMap[step], 0.18, 'triangle', 0.08);
    }
  }

  // --- Track 6: Bruno Mars & Mark Ronson - "Uptown Funk" ---
  // D minor funky slap bass + brass stabs
  private playUptownFunkStep(now: number, step: number) {
    if (!this.ctx || !this.bgmGainNode) return;

    if (step % 8 === 0) {
      this.synthKick(now);
    }
    if (step % 8 === 4) {
      this.synthSnare(now);
    }
    if (step % 2 === 0) {
      this.synthHiHat(now, 0.012);
    }

    // Funky bassline in D minor
    const funkBass = [
      73.42, 0, 73.42, 0, 87.31, 0, 98.00, 103.83,
      110.00, 0, 0, 130.81, 0, 0, 146.83, 0
    ];
    const bNote = funkBass[step % 16];
    if (bNote > 0) {
      this.synthBass(now, bNote, 0.14, 'sawtooth');
    }

    // Bright brass stabs
    const brassStabs: { [s: number]: number[] } = {
      0: [349.23, 440.00, 523.25], // F4, A4, C5 (Dm7)
      4: [392.00, 493.88, 587.33], // G4, B4, D5 (G)
      8: [349.23, 440.00, 523.25],
      12: [392.00, 493.88, 587.33]
    };

    if (brassStabs[step % 16]) {
      brassStabs[step % 16].forEach((f) => {
        this.synthLead(now, f, 0.12, 'sawtooth', 0.04);
      });
    }
  }

  // --- Track 7: Luis Fonsi - "Despacito" ---
  // Latin Spanish guitar arpeggio + reggaeton dembow pulse
  private playDespacitoStep(now: number, step: number) {
    if (!this.ctx || !this.bgmGainNode) return;

    // Reggaeton dembow beat
    if (step === 0 || step === 16) {
      this.synthKick(now);
    }
    if (step === 6 || step === 10 || step === 22 || step === 26) {
      this.synthSnare(now);
    }
    this.synthHiHat(now, 0.01);

    // Spanish guitar chord arpeggio in Bm
    const guitarArp = [
      246.94, 369.99, 293.66, 369.99, 196.00, 293.66, 246.94, 293.66,
      220.00, 369.99, 277.18, 369.99, 164.81, 246.94, 196.00, 246.94
    ];
    const note = guitarArp[step % 16];
    if (note) {
      this.synthLead(now, note, 0.15, 'sine', 0.07);
    }

    // Warm Latin bass
    const bassline = [61.74, 49.00, 55.00, 41.20];
    const bNote = bassline[Math.floor(step / 8) % bassline.length];
    if (step % 4 === 0) {
      this.synthBass(now, bNote, 0.22, 'triangle');
    }
  }

  // --- Audio Synthesis Building Blocks ---

  private synthKick(now: number) {
    if (!this.ctx || !this.bgmGainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.09);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.bgmGainNode);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  private synthSnare(now: number) {
    if (!this.ctx || !this.bgmGainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.bgmGainNode);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  private synthHiHat(now: number, vol: number = 0.015) {
    if (!this.ctx || !this.bgmGainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(7500, now);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.bgmGainNode);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  private synthBass(
    now: number,
    freq: number,
    duration: number = 0.18,
    type: OscillatorType = 'triangle'
  ) {
    if (!this.ctx || !this.bgmGainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGainNode);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private synthLead(
    now: number,
    freq: number,
    duration: number = 0.16,
    type: OscillatorType = 'sine',
    volume: number = 0.08
  ) {
    if (!this.ctx || !this.bgmGainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.bgmGainNode);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  // --- Sound Effects ---

  public playClick() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  public playTick(urgent: boolean = false) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = urgent ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(urgent ? 880 : 520, now);
    if (urgent) {
      osc.frequency.linearRampToValueAtTime(1100, now + 0.04);
    }

    gain.gain.setValueAtTime(urgent ? 0.16 : 0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (urgent ? 0.08 : 0.035));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + (urgent ? 0.09 : 0.045));
  }

  public playTimerBuzzer() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(130, now);
    osc2.frequency.setValueAtTime(138, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.46);
    osc2.stop(now + 0.46);
  }

  public playLockIn() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.23);
    });
  }

  public playRevealBluff() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.28);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playRevealTruth() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.07;

      osc.type = idx === chords.length - 1 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.52);
    });
  }

  public playPointGain(steps: number = 3) {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const baseFreq = 659.25;
    const count = Math.min(6, Math.max(2, steps));

    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * Math.pow(1.12, i), t);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.19);
    }
  }

  public playCategoryTwist() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.2);
    osc.frequency.linearRampToValueAtTime(450, now + 0.35);
    osc.frequency.linearRampToValueAtTime(1050, now + 0.5);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.62);
  }

  public playTieBreaker() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.18);
    osc.frequency.linearRampToValueAtTime(440, now + 0.36);
    osc.frequency.linearRampToValueAtTime(880, now + 0.54);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.75);
  }

  public playVictoryFanfare() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, dur: 0.15, delay: 0 },
      { f: 523.25, dur: 0.15, delay: 0.18 },
      { f: 523.25, dur: 0.15, delay: 0.36 },
      { f: 659.25, dur: 0.2, delay: 0.54 },
      { f: 783.99, dur: 0.45, delay: 0.78 }
    ];

    notes.forEach(({ f, dur, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + delay;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + dur + 0.05);
    });
  }

  public trigger(event: SoundEvent, options?: { urgent?: boolean; count?: number }) {
    switch (event) {
      case 'timer_tick':
        this.playTick(options?.urgent ?? false);
        break;
      case 'timer_urgent_tick':
        this.playTick(true);
        break;
      case 'timer_buzzer':
        this.playTimerBuzzer();
        break;
      case 'bluff_reveal':
        this.playRevealBluff();
        break;
      case 'answer_reveal':
        this.playRevealTruth();
        break;
      case 'point_gain':
        this.playPointGain(options?.count ?? 3);
        break;
      case 'lock_in':
        this.playLockIn();
        break;
      case 'vote_cast':
        this.playClick();
        break;
      case 'category_twist':
        this.playCategoryTwist();
        break;
      case 'tie_breaker':
        this.playTieBreaker();
        break;
      case 'victory_fanfare':
        this.playVictoryFanfare();
        break;
      case 'click':
        this.playClick();
        break;
    }
  }
}

export const sound = new SoundEffects();
