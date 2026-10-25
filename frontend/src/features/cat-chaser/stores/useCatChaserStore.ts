import { create } from 'zustand';
import { CatChaserGameState, CatChaserProblem, CatChaserResult, CatChaserSettings } from '@features/cat-chaser/logic/types';
import { catChaserEngine } from '@features/cat-chaser/logic/CatChaserEngine';
import { GameMode } from '@constants/gameModes';

type GameStep = 'MOUSE' | 'ISI' | 'CAT_NORMAL' | 'CAT_HIGHLIGHT' | 'DECISION_RED' | 'DECISION_BLUE' | 'FEEDBACK';

interface CatChaserStore {
  gameMode: GameMode;
  sessionId: number | null;
  resetGame: () => void;

  gameState: CatChaserGameState | null;
  currentRound: number;
  step: GameStep;

  // Current Problem Data
  currentProblem: CatChaserProblem | null;
  results: CatChaserResult[];
  lastResult: CatChaserResult | null;

  startGame: (settings: CatChaserSettings) => Promise<void>;
  startRound: (round: number) => void;
  setStep: (step: GameStep) => void;
  submitAnswer: (
    targetColor: 'RED' | 'BLUE',
    choice: 'CAUGHT' | 'MISSED' | 'TIMEOUT',
    confidence: number,
    timeMs: number
  ) => Promise<void>;
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

  startGame: async (settings) => {
    set({ gameMode: 'loading' });
    try {
      const gameState = catChaserEngine.startGame(settings);
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
      const result = catChaserEngine.submitAnswer(currentRound, targetColor, choice, confidence, timeMs);
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
    lastResult: null,
  }),
}));
