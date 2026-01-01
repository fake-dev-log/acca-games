import { create } from 'zustand';
import { cat_chaser, types } from '@wails/go/models';
import { startCatChaserGame, submitCatChaserAnswer, getPaginatedCatChaserSessionsWithResults } from '@api/catChaser';
import { GameMode } from '@constants/gameModes';

type GameStep = 'MOUSE' | 'ISI' | 'CAT_NORMAL' | 'CAT_HIGHLIGHT' | 'DECISION_RED' | 'DECISION_BLUE' | 'FEEDBACK';

interface CatChaserStore {
  gameMode: GameMode;
  sessionId: number | null;
  resetGame: () => void;

  gameState: cat_chaser.CatChaserGameState | null;
  currentRound: number;
  step: GameStep;

  // Current Problem Data
  currentProblem: types.CatChaserProblem | null;
  results: types.CatChaserResult[];
  lastResult: types.CatChaserResult | null;

  // Records
  loading: boolean;
  error: string | null;
  paginatedSessions: {
    sessions: types.CatChaserSessionWithResults[];
    totalCount: number;
  };

  startGame: (settings: types.CatChaserSettings) => Promise<void>;
  startRound: (round: number) => void;
  setStep: (step: GameStep) => void;
  submitAnswer: (
    targetColor: 'RED' | 'BLUE',
    choice: 'CAUGHT' | 'MISSED' | 'TIMEOUT',
    confidence: number,
    timeMs: number
  ) => Promise<void>;
  fetchPaginatedSessions: (page: number, limit: number) => Promise<void>;
}

export const useCatChaserStore = create<CatChaserStore>((set, get) => ({
  gameMode: 'setup',
  sessionId: null,
  gameState: null,
  currentRound: 0,
  step: 'MOUSE',
  currentProblem: null,
  results: [],
  lastResult: null,
  
  loading: false,
  error: null,
  paginatedSessions: { sessions: [], totalCount: 0 },

  startGame: async (settings) => {
    set({ gameMode: 'loading' });
    try {
      const gameState = await startCatChaserGame(settings);
      set({
        gameState,
        sessionId: gameState.id,
        gameMode: 'playing',
        currentRound: 1,
        results: [],
      });
      get().startRound(1);
    } catch (err) {
      console.error('Failed to start game:', err);
      set({ gameMode: 'setup' });
    }
  },

  startRound: (round) => {
    const { gameState } = get();
    if (!gameState || !gameState.problems || round > gameState.problems.length) {
        set({ gameMode: 'result' });
        return;
    }
    const problem = gameState.problems[round - 1];
    set({
      currentRound: round,
      currentProblem: problem,
      step: 'MOUSE',
    });
  },

  setStep: (step) => set({ step }),

  submitAnswer: async (targetColor, choice, confidence, timeMs) => {
    const { currentRound, results } = get();
    try {
      const result = await submitCatChaserAnswer(
        currentRound,
        targetColor,
        choice,
        confidence,
        timeMs
      );
      set({ results: [...results, result], lastResult: result });
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  },

  resetGame: () => set({
    gameState: null,
    sessionId: null,
    currentRound: 0,
    gameMode: 'setup',
    step: 'MOUSE',
    currentProblem: null,
    results: [],
    loading: false,
    error: null,
  }),

  fetchPaginatedSessions: async (page: number, limit: number) => {
    set({ loading: true, error: null });
    try {
      const paginatedResult = await getPaginatedCatChaserSessionsWithResults(page, limit);
      set({ 
        paginatedSessions: paginatedResult, 
        loading: false 
      });
    } catch (err: any) {
      set({ error: `Failed to fetch paginated sessions: ${err.message || 'Unknown error'}`, loading: false });
    }
  },
}));
