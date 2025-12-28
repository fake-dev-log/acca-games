import { create } from 'zustand';
import { GameMode } from "@constants/gameModes";
import { countComparisonEngine } from '../logic/CountComparisonEngine';
import { CountComparisonSettings, CountComparisonProblem, CountComparisonSubmission, CountComparisonResult } from '../logic/types';

interface CountComparisonState {
  settings: CountComparisonSettings;
  currentProblem: CountComparisonProblem | null;
  gameMode: GameMode;
  sessionId: number | null;
  loading: boolean;
  error: string | null;
  results: CountComparisonResult[];

  setSettings: (settings: CountComparisonSettings) => void;
  setGameMode: (mode: GameMode) => void;
  startGame: (settings: CountComparisonSettings) => void;
  fetchNextProblem: () => void;
  submitAnswer: (submission: CountComparisonSubmission) => boolean;
  resetGame: () => void;
}

export const useCountComparisonStore = create<CountComparisonState>((set, get) => ({
  settings: {
    numProblems: 10,
    presentationTime: 1000,
    inputTime: 3000,
    isRealMode: false,
  },
  currentProblem: null,
  gameMode: 'setup',
  sessionId: null,
  loading: false,
  error: null,
  results: [],

  setSettings: (settings) => set({ settings }),
  setGameMode: (mode) => set({ gameMode: mode }),

  startGame: (settings: CountComparisonSettings) => {
    set({ gameMode: 'loading', loading: true, error: null, settings, results: [] });
    try {
      const { sessionId } = countComparisonEngine.startGame(settings);
      set({ sessionId });
      get().fetchNextProblem();
      set({ gameMode: 'playing', loading: false });
    } catch (err: any) {
      set({ error: err.message, gameMode: 'setup', loading: false });
    }
  },

  fetchNextProblem: () => {
    const problem = countComparisonEngine.getNextProblem();
    if (problem) {
      set({ currentProblem: problem });
    } else {
      set({ currentProblem: null, gameMode: 'result' });
    }
  },

  submitAnswer: (submission: CountComparisonSubmission): boolean => {
    try {
      const isCorrect = countComparisonEngine.submitAnswer(submission.playerChoice, submission.responseTimeMs);
      set((state) => ({ results: countComparisonEngine.getResults() }));
      return isCorrect;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  },

  resetGame: () => {
    set({
      settings: {
        numProblems: 10,
        presentationTime: 1000,
        inputTime: 3000,
        isRealMode: false,
      },
      currentProblem: null,
      gameMode: 'setup',
      sessionId: null,
      loading: false,
      error: null,
      results: [],
    });
  },
}));
