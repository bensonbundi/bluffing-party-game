export type Category =
  | 'Animals'
  | 'Brain Teasers'
  | 'Celebrities'
  | 'Entertainment'
  | 'For Children'
  | 'General'
  | 'Geography'
  | 'History'
  | 'Hobbies'
  | 'Humanities'
  | 'Literature'
  | 'Movies'
  | 'Music'
  | 'People'
  | 'Religion'
  | 'Sci / Tech'
  | 'Sports'
  | 'Television'
  | 'Video Games'
  | 'World'
  | 'K-12 Education';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type GameDifficultyMode = 'easy' | 'standard' | 'hard';

export interface Question {
  id: string;
  category: Category;
  prompt: string;
  correctAnswer: string;
  fallbackDecoys: string[]; // Used when 2 players or when timer expires
  funFact?: string; // Revealed after truth is shown
  imageUrl?: string; // Picture featured above the question prompt
  difficulty: DifficultyLevel; // Question difficulty
  isCustom?: boolean; // If added by host/players
}

export interface Player {
  id: string;
  name: string;
  avatar: string; // Emoji
  color: string; // Hex or Tailwind color class
  score: number;
  lastRoundScoreDelta: number;
  previousScore?: number; // Previous score before delta (for score rollup animations)
  isHost: boolean;
  isConnected: boolean;
  isBot?: boolean;
  isTiedForFirst?: boolean;
}

export type GamePhase =
  | 'LOBBY'
  | 'QUESTION_INTRO'
  | 'BLUFFING'
  | 'VOTING'
  | 'REVEAL_BLUFFS'
  | 'REVEAL_TRUTH'
  | 'SCOREBOARD'
  | 'TIE_BREAKER_SPLASH'
  | 'GAME_OVER';

export interface BluffSubmission {
  playerId: string;
  text: string;
}

export interface VoteSubmission {
  playerId: string;
  choiceId: string;
}

export interface ChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  authorPlayerId?: string;
  authorPlayerName?: string;
  authorPlayerIds?: string[]; // All co-author player IDs when similar bluffs are merged
  authorPlayerNames?: string[]; // All co-author player names when similar bluffs are merged
  isMerged?: boolean; // True if multiple similar bluffs were merged into this single option
  originalBluffs?: string[]; // Original bluffs that were merged
  voterIds: string[];
}

export interface QuestionResult {
  question: Question;
  choices: ChoiceOption[];
  pointsAwarded: {
    [playerId: string]: {
      correctPoints: number;
      bluffPoints: number;
      total: number;
      fooledPlayers: string[];
    };
  };
}

export interface RoomState {
  roomCode: string;
  hostId: string;
  phase: GamePhase;
  players: Player[];
  selectedCategories: Category[];
  questionsPerRound: number;
  difficultyMode: GameDifficultyMode; // Pregame difficulty mode: 'easy' | 'standard' | 'hard'
  
  // Game progress
  currentRound: number;
  totalRounds: number;
  isTieBreaker: boolean;
  tiedPlayerIds: string[];
  
  currentQuestionIndex: number;
  totalQuestionsInGame: number;
  currentQuestion?: Question;
  
  // Authoritative server timer
  timerSecondsRemaining: number;
  timerTotalSeconds: number;
  
  // Submissions tracking
  submittedBluffPlayerIds: string[];
  submittedVotePlayerIds: string[];
  
  // Voting & Results
  choices: ChoiceOption[];
  lastResult?: QuestionResult;
  revealStep: number;
  
  pointMultiplier: number;
  isCategoryTwist?: boolean;

  // Custom question pool count
  customQuestionCount: number;
  customQuestions?: Question[];
}

// Client to Server WebSocket message
export type ClientMessage =
  | { type: 'HOST_CREATE_ROOM'; payload: { hostName?: string } }
  | { type: 'JOIN_ROOM'; payload: { roomCode: string; playerName: string; avatar: string; color: string } }
  | { type: 'RECONNECT'; payload: { roomCode: string; playerId: string } }
  | { type: 'UPDATE_SETTINGS'; payload: { categories?: Category[]; questionsPerRound?: number; difficultyMode?: GameDifficultyMode } }
  | { type: 'ADD_BOT'; payload?: { name?: string } }
  | { type: 'REMOVE_BOT'; payload: { botId: string } }
  | { type: 'ADD_CUSTOM_QUESTION'; payload: Omit<Question, 'id'> }
  | { type: 'REMOVE_CUSTOM_QUESTION'; payload: { questionId: string } }
  | { type: 'START_GAME' }
  | { type: 'SUBMIT_BLUFF'; payload: { bluffText: string } }
  | { type: 'SUBMIT_VOTE'; payload: { choiceId: string } }
  | { type: 'HOST_NEXT_STEP' }
  | { type: 'RESTART_GAME' }
  | { type: 'PING' };

// Server to Client WebSocket message
export type ServerMessage =
  | { type: 'ROOM_STATE'; payload: RoomState }
  | { type: 'JOIN_SUCCESS'; payload: { playerId: string; roomCode: string; isHost: boolean } }
  | { type: 'ERROR'; payload: { message: string } }
  | { type: 'BLUFF_FEEDBACK'; payload: { valid: boolean; message?: string } }
  | { type: 'TICK'; payload: { timerSecondsRemaining: number } };
