import { WebSocket } from 'ws';
import {
  Category,
  ChoiceOption,
  DifficultyLevel,
  GamePhase,
  Player,
  Question,
  QuestionResult,
  RoomState,
  ServerMessage
} from '../src/types/game';
import { BOT_NAMES, BOT_AVATARS, CATEGORIES_LIST } from '../src/data/questions';
import { generateQuestions, getRandomCategory } from './questionMaster';
import { areBluffsSimilar, pickBestMergedText } from './similarity';

interface InternalPlayer extends Player {
  ws?: WebSocket;
  currentBluff?: string;
  currentVoteChoiceId?: string;
}

export class GameRoom {
  public roomCode: string;
  public hostId: string;
  public hostWs?: WebSocket;
  public phase: GamePhase = 'LOBBY';
  public players: Map<string, InternalPlayer> = new Map();
  public selectedCategories: Category[] = [...CATEGORIES_LIST];
  public questionsPerRound: number = 2;
  public difficultyMode: 'easy' | 'standard' | 'hard' = 'standard';

  public currentRound: number = 1;
  public totalRounds: number = 3;
  public isTieBreaker: boolean = false;
  public tiedPlayerIds: string[] = [];

  public currentQuestionIndex: number = 0;
  public totalQuestionsInGame: number = 6;
  public currentQuestion?: Question;

  public timerSecondsRemaining: number = 0;
  public timerTotalSeconds: number = 0;
  private timerInterval?: NodeJS.Timeout;

  public choices: ChoiceOption[] = [];
  public lastResult?: QuestionResult;
  public revealStep: number = 0;
  public pointMultiplier: number = 1;
  public isCategoryTwist: boolean = false;

  // Custom question pool created by users
  public customQuestions: Question[] = [];
  public usedCustomQuestionIds: Set<string> = new Set();

  private botTimeouts: NodeJS.Timeout[] = [];

  constructor(roomCode: string, hostId: string, hostWs: WebSocket) {
    this.roomCode = roomCode;
    this.hostId = hostId;
    this.hostWs = hostWs;
  }

  // --- WebSocket Broadcast ---
  public broadcast(message: ServerMessage) {
    const payload = JSON.stringify(message);
    if (this.hostWs && this.hostWs.readyState === WebSocket.OPEN) {
      this.hostWs.send(payload);
    }
    for (const player of this.players.values()) {
      if (player.ws && player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(payload);
      }
    }
  }

  public sendToPlayer(playerId: string, message: ServerMessage) {
    const player = this.players.get(playerId);
    if (player?.ws && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify(message));
    }
  }

  public getPublicState(): RoomState {
    const playerList: Player[] = Array.from(this.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      score: p.score,
      lastRoundScoreDelta: p.lastRoundScoreDelta,
      previousScore: p.previousScore,
      isHost: p.isHost,
      isConnected: p.isConnected,
      isBot: p.isBot,
      isTiedForFirst: this.tiedPlayerIds.includes(p.id)
    }));

    const sanitizedChoices: ChoiceOption[] = this.choices.map(c => {
      if (this.phase === 'VOTING' || this.phase === 'BLUFFING') {
        return {
          id: c.id,
          text: c.text,
          isCorrect: false,
          voterIds: [],
          authorPlayerId: c.authorPlayerId,
          authorPlayerIds: c.authorPlayerIds,
          isMerged: c.isMerged,
          authorPlayerName: undefined,
          authorPlayerNames: undefined
        };
      }
      return c;
    });

    const submittedBluffPlayerIds: string[] = [];
    const submittedVotePlayerIds: string[] = [];
    for (const p of this.players.values()) {
      if (p.currentBluff) submittedBluffPlayerIds.push(p.id);
      if (p.currentVoteChoiceId) submittedVotePlayerIds.push(p.id);
    }

    return {
      roomCode: this.roomCode,
      hostId: this.hostId,
      phase: this.phase,
      players: playerList,
      selectedCategories: this.selectedCategories,
      questionsPerRound: this.questionsPerRound,
      difficultyMode: this.difficultyMode,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      isTieBreaker: this.isTieBreaker,
      tiedPlayerIds: this.tiedPlayerIds,
      currentQuestionIndex: this.currentQuestionIndex,
      totalQuestionsInGame: this.totalQuestionsInGame,
      currentQuestion: this.currentQuestion ? {
        id: this.currentQuestion.id,
        category: this.currentQuestion.category,
        prompt: this.currentQuestion.prompt,
        correctAnswer: (this.phase === 'REVEAL_TRUTH' || this.phase === 'SCOREBOARD' || this.phase === 'GAME_OVER')
          ? this.currentQuestion.correctAnswer
          : '',
        fallbackDecoys: [],
        funFact: (this.phase === 'REVEAL_TRUTH' || this.phase === 'SCOREBOARD' || this.phase === 'GAME_OVER')
          ? this.currentQuestion.funFact
          : undefined,
        imageUrl: this.currentQuestion.imageUrl,
        difficulty: this.currentQuestion.difficulty,
        isCustom: this.currentQuestion.isCustom
      } : undefined,
      timerSecondsRemaining: this.timerSecondsRemaining,
      timerTotalSeconds: this.timerTotalSeconds,
      submittedBluffPlayerIds,
      submittedVotePlayerIds,
      choices: sanitizedChoices,
      lastResult: this.lastResult,
      revealStep: this.revealStep,
      pointMultiplier: this.pointMultiplier,
      isCategoryTwist: this.isCategoryTwist,
      customQuestionCount: this.customQuestions.length,
      customQuestions: this.customQuestions
    };
  }

  public broadcastState() {
    this.broadcast({
      type: 'ROOM_STATE',
      payload: this.getPublicState()
    });
  }

  // --- Custom Questions Management ---
  public addCustomQuestion(q: Omit<Question, 'id'>) {
    const newQuestion: Question = {
      ...q,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fallbackDecoys: q.fallbackDecoys && q.fallbackDecoys.length >= 2 ? q.fallbackDecoys : [
        'A hilarious misunderstanding',
        'A secret royal prank',
        'A bet between rivals',
        'An ancient family superstition'
      ],
      difficulty: q.difficulty || 'medium',
      isCustom: true
    };
    this.customQuestions.push(newQuestion);
    this.broadcastState();
  }

  public removeCustomQuestion(questionId: string) {
    this.customQuestions = this.customQuestions.filter(q => q.id !== questionId);
    this.usedCustomQuestionIds.delete(questionId);
    this.broadcastState();
  }

  // --- Player Management ---
  public addPlayer(player: { id: string; name: string; avatar: string; color: string; ws?: WebSocket; isHost?: boolean; isBot?: boolean }) {
    if (this.players.size >= 8) {
      throw new Error('Room is full (maximum 8 players)');
    }
    const newPlayer: InternalPlayer = {
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      color: player.color,
      score: 0,
      lastRoundScoreDelta: 0,
      previousScore: 0,
      isHost: !!player.isHost,
      isConnected: true,
      isBot: !!player.isBot,
      ws: player.ws
    };
    this.players.set(player.id, newPlayer);
    this.broadcastState();
  }

  public removePlayer(playerId: string) {
    this.players.delete(playerId);
    this.broadcastState();
  }

  public addBot(name?: string) {
    if (this.players.size >= 8) return;
    const botIndex = this.players.size % BOT_NAMES.length;
    const botName = name || BOT_NAMES[botIndex] || `Bot ${this.players.size + 1}`;
    const botAvatar = BOT_AVATARS[botIndex % BOT_AVATARS.length];
    const botId = `bot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    this.addPlayer({
      id: botId,
      name: botName,
      avatar: botAvatar.avatar,
      color: botAvatar.color,
      isBot: true
    });
  }

  public removeBot(botId: string) {
    const player = this.players.get(botId);
    if (player && player.isBot) {
      this.players.delete(botId);
      this.broadcastState();
    }
  }

  // --- Timer Management ---
  private startTimer(seconds: number, onComplete: () => void) {
    this.clearTimer();
    this.timerSecondsRemaining = seconds;
    this.timerTotalSeconds = seconds;

    this.timerInterval = setInterval(() => {
      this.timerSecondsRemaining--;
      if (this.timerSecondsRemaining <= 0) {
        this.clearTimer();
        onComplete();
      } else {
        this.broadcast({
          type: 'TICK',
          payload: { timerSecondsRemaining: this.timerSecondsRemaining }
        });
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  private clearBotTimeouts() {
    for (const timeout of this.botTimeouts) {
      clearTimeout(timeout);
    }
    this.botTimeouts = [];
  }

  // --- Game Lifecycle ---
  public async startGame() {
    if (this.players.size < 2) {
      throw new Error('At least 2 players required to start the game');
    }

    this.currentRound = 1;
    this.isTieBreaker = false;
    this.tiedPlayerIds = [];
    this.currentQuestionIndex = 0;
    this.totalQuestionsInGame = this.totalRounds * this.questionsPerRound;
    this.usedCustomQuestionIds.clear();

    for (const player of this.players.values()) {
      player.score = 0;
      player.previousScore = 0;
      player.lastRoundScoreDelta = 0;
    }

    await this.startNextQuestion();
  }

  public async startNextQuestion() {
    this.clearTimer();
    this.clearBotTimeouts();

    for (const p of this.players.values()) {
      p.currentBluff = undefined;
      p.currentVoteChoiceId = undefined;
      p.previousScore = p.score;
      p.lastRoundScoreDelta = 0;
    }
    this.choices = [];
    this.lastResult = undefined;
    this.revealStep = 0;

    // Multipliers
    if (this.isTieBreaker) {
      this.pointMultiplier = 3;
      this.isCategoryTwist = true;
    } else if (this.currentRound === 1) {
      this.pointMultiplier = 1;
      this.isCategoryTwist = false;
    } else if (this.currentRound === 2) {
      this.pointMultiplier = 2;
      this.isCategoryTwist = true; // Special Category Twist round!
    } else {
      this.pointMultiplier = 3;
      this.isCategoryTwist = false;
    }

    // Category selection
    let chosenCategory: Category;
    if (this.isCategoryTwist) {
      chosenCategory = getRandomCategory();
    } else {
      const available = this.selectedCategories.length > 0 ? this.selectedCategories : CATEGORIES_LIST;
      const index = Math.floor(Math.random() * available.length);
      chosenCategory = available[index];
    }

    // Check if we have an unused custom question in pool
    const unusedCustom = this.customQuestions.filter(q => !this.usedCustomQuestionIds.has(q.id));
    const matchingCustom = unusedCustom.find(q => q.category === chosenCategory) || unusedCustom[0];

    if (matchingCustom && Math.random() < 0.6) {
      // Use custom question!
      this.usedCustomQuestionIds.add(matchingCustom.id);
      this.currentQuestion = matchingCustom;
    } else {
      // Generate question with AI Question Master
      const generated = await generateQuestions({
        category: chosenCategory,
        roundNumber: this.currentRound,
        isCategoryTwist: this.isCategoryTwist,
        difficultyMode: this.difficultyMode,
        count: 1
      });
      this.currentQuestion = generated[0];
    }

    this.phase = 'QUESTION_INTRO';
    this.broadcastState();

    this.startTimer(5, () => {
      this.startBluffingPhase();
    });
  }

  private startBluffingPhase() {
    this.phase = 'BLUFFING';
    this.broadcastState();

    this.scheduleBotBluffs();

    this.startTimer(30, () => {
      this.endBluffingPhase();
    });
  }

  private scheduleBotBluffs() {
    const bots = Array.from(this.players.values()).filter(p => p.isBot);
    const decoys = [...(this.currentQuestion?.fallbackDecoys || ['A funny misunderstanding', 'A strange royal decree', 'A lost bet', 'A secret spy trick'])];

    bots.forEach((bot, index) => {
      const delayMs = 4000 + Math.random() * 12000;
      const timeout = setTimeout(() => {
        if (this.phase === 'BLUFFING' && !bot.currentBluff) {
          const bluffText = decoys[index % decoys.length] || `A bizarre ${bot.name} theory`;
          this.submitBluff(bot.id, bluffText);
        }
      }, delayMs);
      this.botTimeouts.push(timeout);
    });
  }

  public submitBluff(playerId: string, rawText: string) {
    if (this.phase !== 'BLUFFING') return;
    const player = this.players.get(playerId);
    if (!player) return;

    const bluffText = rawText.trim();
    if (!bluffText) return;

    // Check if bluff is identical or similar-sounding to the truth
    if (this.currentQuestion) {
      const truthSimilarity = areBluffsSimilar(bluffText, this.currentQuestion.correctAnswer);
      if (truthSimilarity.isSimilar) {
        this.sendToPlayer(playerId, {
          type: 'BLUFF_FEEDBACK',
          payload: {
            valid: false,
            message: 'Too close to the actual truth! Enter a clever lie to fool your friends!'
          }
        });
        return;
      }
    }

    // Accept bluff (similar or identical bluffs between players will be merged into one option)
    player.currentBluff = bluffText;
    this.sendToPlayer(playerId, {
      type: 'BLUFF_FEEDBACK',
      payload: { valid: true }
    });

    this.broadcastState();

    const allSubmitted = Array.from(this.players.values()).every(p => !!p.currentBluff);
    if (allSubmitted && this.timerSecondsRemaining > 3) {
      this.clearTimer();
      this.startTimer(3, () => {
        this.endBluffingPhase();
      });
    }
  }

  private endBluffingPhase() {
    this.clearTimer();
    this.clearBotTimeouts();

    if (!this.currentQuestion) return;

    const fallbackPool = [...(this.currentQuestion.fallbackDecoys || ['A funny rumor', 'An ancient superstition', 'An Olympic prank', 'A mistaken identity'])];
    let fallbackIdx = 0;

    for (const player of this.players.values()) {
      if (!player.currentBluff) {
        player.currentBluff = fallbackPool[fallbackIdx % fallbackPool.length] || 'No bluff entered in time';
        fallbackIdx++;
      }
    }

    const choicesList: ChoiceOption[] = [
      {
        id: `correct-${Date.now()}`,
        text: this.currentQuestion.correctAnswer,
        isCorrect: true,
        voterIds: []
      }
    ];

    // --- Merge similar-sounding bluffs into one option ---
    interface BluffCluster {
      authors: Array<{ id: string; name: string }>;
      bluffTexts: string[];
    }

    const clusters: BluffCluster[] = [];

    for (const player of this.players.values()) {
      if (!player.currentBluff) continue;

      let matchedCluster: BluffCluster | null = null;
      for (const cluster of clusters) {
        // Check if player's bluff sounds similar to any existing bluff in this cluster
        const isSimilar = cluster.bluffTexts.some(existingText =>
          areBluffsSimilar(player.currentBluff!, existingText).isSimilar
        );
        if (isSimilar) {
          matchedCluster = cluster;
          break;
        }
      }

      if (matchedCluster) {
        matchedCluster.authors.push({ id: player.id, name: player.name });
        matchedCluster.bluffTexts.push(player.currentBluff);
      } else {
        clusters.push({
          authors: [{ id: player.id, name: player.name }],
          bluffTexts: [player.currentBluff]
        });
      }
    }

    // Convert each cluster into a single choice option
    clusters.forEach((cluster, idx) => {
      const bestText = pickBestMergedText(cluster.bluffTexts);
      const isMerged = cluster.authors.length > 1;

      choicesList.push({
        id: `bluff-cluster-${idx}-${Date.now()}`,
        text: bestText,
        isCorrect: false,
        authorPlayerId: cluster.authors[0].id,
        authorPlayerName: cluster.authors.map(a => a.name).join(' & '),
        authorPlayerIds: cluster.authors.map(a => a.id),
        authorPlayerNames: cluster.authors.map(a => a.name),
        isMerged,
        originalBluffs: cluster.bluffTexts,
        voterIds: []
      });
    });

    // Ensure at least 4 options by injecting decoys if needed
    while (choicesList.length < 4 && fallbackIdx < fallbackPool.length * 2) {
      const decoyCandidate = fallbackPool[fallbackIdx % fallbackPool.length];
      fallbackIdx++;
      const isTooSimilar = choicesList.some(c => areBluffsSimilar(decoyCandidate, c.text).isSimilar);
      if (!isTooSimilar) {
        choicesList.push({
          id: `decoy-${choicesList.length}-${Date.now()}`,
          text: decoyCandidate,
          isCorrect: false,
          voterIds: []
        });
      }
    }

    this.choices = choicesList.sort(() => 0.5 - Math.random());
    this.phase = 'VOTING';
    this.broadcastState();

    this.scheduleBotVotes();

    this.startTimer(25, () => {
      this.endVotingPhase();
    });
  }

  private scheduleBotVotes() {
    const bots = Array.from(this.players.values()).filter(p => p.isBot);

    bots.forEach(bot => {
      const delayMs = 3000 + Math.random() * 9000;
      const timeout = setTimeout(() => {
        if (this.phase === 'VOTING' && !bot.currentVoteChoiceId) {
          const validChoices = this.choices.filter(c =>
            c.authorPlayerId !== bot.id &&
            !(c.authorPlayerIds && c.authorPlayerIds.includes(bot.id))
          );
          if (validChoices.length > 0) {
            const correctChoice = validChoices.find(c => c.isCorrect);
            const otherBluffs = validChoices.filter(c => !c.isCorrect);

            let selectedChoice: ChoiceOption;
            if (correctChoice && Math.random() < 0.35) {
              selectedChoice = correctChoice;
            } else if (otherBluffs.length > 0) {
              selectedChoice = otherBluffs[Math.floor(Math.random() * otherBluffs.length)];
            } else {
              selectedChoice = validChoices[0];
            }

            this.submitVote(bot.id, selectedChoice.id);
          }
        }
      }, delayMs);
      this.botTimeouts.push(timeout);
    });
  }

  public submitVote(playerId: string, choiceId: string) {
    if (this.phase !== 'VOTING') return;
    const player = this.players.get(playerId);
    if (!player) return;

    const choice = this.choices.find(c => c.id === choiceId);
    const isAuthor = choice?.authorPlayerId === playerId ||
      (choice?.authorPlayerIds && choice.authorPlayerIds.includes(playerId));

    if (!choice || isAuthor) {
      return;
    }

    player.currentVoteChoiceId = choiceId;
    this.broadcastState();

    const allVoted = Array.from(this.players.values()).every(p => !!p.currentVoteChoiceId);
    if (allVoted && this.timerSecondsRemaining > 2) {
      this.clearTimer();
      this.startTimer(2, () => {
        this.endVotingPhase();
      });
    }
  }

  private endVotingPhase() {
    this.clearTimer();
    this.clearBotTimeouts();

    for (const choice of this.choices) {
      choice.voterIds = [];
      for (const player of this.players.values()) {
        if (player.currentVoteChoiceId === choice.id) {
          choice.voterIds.push(player.id);
        }
      }
    }

    const result: QuestionResult = {
      question: this.currentQuestion!,
      choices: this.choices,
      pointsAwarded: {}
    };

    for (const player of this.players.values()) {
      result.pointsAwarded[player.id] = {
        correctPoints: 0,
        bluffPoints: 0,
        total: 0,
        fooledPlayers: []
      };
    }

    for (const choice of this.choices) {
      if (choice.isCorrect) {
        for (const voterId of choice.voterIds) {
          if (this.isTieBreaker && !this.tiedPlayerIds.includes(voterId)) {
            continue;
          }
          const award = result.pointsAwarded[voterId];
          if (award) {
            award.correctPoints += 1 * this.pointMultiplier;
            award.total += 1 * this.pointMultiplier;
          }
        }
      } else {
        // Collect all author IDs for this bluff (including co-authors if merged)
        const authorIds = choice.authorPlayerIds && choice.authorPlayerIds.length > 0
          ? choice.authorPlayerIds
          : choice.authorPlayerId
          ? [choice.authorPlayerId]
          : [];

        for (const authorId of authorIds) {
          const authorAward = result.pointsAwarded[authorId];
          const authorEligible = !this.isTieBreaker || this.tiedPlayerIds.includes(authorId);

          for (const voterId of choice.voterIds) {
            const voter = this.players.get(voterId);
            if (voter && authorAward && authorEligible) {
              authorAward.bluffPoints += 1 * this.pointMultiplier;
              authorAward.total += 1 * this.pointMultiplier;
              if (!authorAward.fooledPlayers.includes(voter.name)) {
                authorAward.fooledPlayers.push(voter.name);
              }
            }
          }
        }
      }
    }

    // Apply points to persistent score, saving previousScore for animations!
    for (const player of this.players.values()) {
      const award = result.pointsAwarded[player.id];
      if (award) {
        player.previousScore = player.score;
        player.score += award.total;
        player.lastRoundScoreDelta = award.total;
      }
    }

    this.lastResult = result;
    this.phase = 'REVEAL_BLUFFS';
    this.revealStep = 1;
    this.broadcastState();

    this.startTimer(8, () => {
      this.advanceReveal();
    });
  }

  public advanceReveal() {
    this.clearTimer();

    if (this.phase === 'REVEAL_BLUFFS') {
      this.phase = 'REVEAL_TRUTH';
      this.broadcastState();
      this.startTimer(8, () => {
        this.showScoreboard();
      });
    } else if (this.phase === 'REVEAL_TRUTH') {
      this.showScoreboard();
    }
  }

  public showScoreboard() {
    this.clearTimer();
    this.phase = 'SCOREBOARD';
    this.currentQuestionIndex++;
    this.broadcastState();

    this.startTimer(10, () => {
      this.checkRoundTransition();
    });
  }

  public checkRoundTransition() {
    this.clearTimer();

    const isRoundComplete = (this.currentQuestionIndex % this.questionsPerRound === 0) || this.isTieBreaker;

    if (!isRoundComplete) {
      this.startNextQuestion();
      return;
    }

    if (this.isTieBreaker) {
      this.evaluateTieBreaker();
      return;
    }

    if (this.currentRound < this.totalRounds) {
      this.currentRound++;
      this.startNextQuestion();
    } else {
      this.evaluateEndOfGameTies();
    }
  }

  private evaluateEndOfGameTies() {
    const playersList = Array.from(this.players.values());
    if (playersList.length === 0) return;

    playersList.sort((a, b) => b.score - a.score);
    const highestScore = playersList[0].score;

    const tied = playersList.filter(p => p.score === highestScore);

    if (tied.length > 1) {
      this.isTieBreaker = true;
      this.tiedPlayerIds = tied.map(p => p.id);
      this.currentRound = 4;
      this.phase = 'TIE_BREAKER_SPLASH';
      this.broadcastState();

      this.startTimer(6, () => {
        this.startNextQuestion();
      });
    } else {
      this.phase = 'GAME_OVER';
      this.broadcastState();
    }
  }

  private evaluateTieBreaker() {
    const tiedPlayers = this.tiedPlayerIds.map(id => this.players.get(id)).filter(Boolean) as InternalPlayer[];
    tiedPlayers.sort((a, b) => b.score - a.score);

    if (tiedPlayers.length <= 1 || tiedPlayers[0].score > tiedPlayers[1].score) {
      this.phase = 'GAME_OVER';
      this.broadcastState();
    } else {
      this.tiedPlayerIds = tiedPlayers.filter(p => p.score === tiedPlayers[0].score).map(p => p.id);
      this.startNextQuestion();
    }
  }

  public restartGame() {
    this.clearTimer();
    this.clearBotTimeouts();
    this.phase = 'LOBBY';
    this.currentRound = 1;
    this.isTieBreaker = false;
    this.tiedPlayerIds = [];
    this.currentQuestionIndex = 0;
    this.choices = [];
    this.lastResult = undefined;
    this.usedCustomQuestionIds.clear();

    for (const player of this.players.values()) {
      player.score = 0;
      player.previousScore = 0;
      player.lastRoundScoreDelta = 0;
      player.currentBluff = undefined;
      player.currentVoteChoiceId = undefined;
    }

    this.broadcastState();
  }

  public updateSettings(settings: { categories?: Category[]; questionsPerRound?: number; difficultyMode?: 'easy' | 'standard' | 'hard' }) {
    if (this.phase !== 'LOBBY') return;
    if (settings.categories && settings.categories.length > 0) {
      this.selectedCategories = settings.categories;
    }
    if (settings.questionsPerRound && settings.questionsPerRound >= 1 && settings.questionsPerRound <= 5) {
      this.questionsPerRound = settings.questionsPerRound;
      this.totalQuestionsInGame = this.totalRounds * this.questionsPerRound;
    }
    if (settings.difficultyMode) {
      this.difficultyMode = settings.difficultyMode;
    }
    this.broadcastState();
  }
}
