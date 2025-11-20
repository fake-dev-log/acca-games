import { create } from 'zustand';
import { types } from '@wails/go/models';
import {
  startCountComparisonGame,
  getNextCountComparisonProblem,
  submitCountComparisonAnswer,
  getPaginatedCountComparisonSessionsWithResults,
} from '@api/countComparison';

interface CountComparisonState {
  settings: types.CountComparisonSettings | null;
  currentProblem: types.CountComparisonProblem | null;
  gameMode: 'setup' | 'playing' | 'results' | 'loading' | 'result';
  sessionId: number | null;
  loading: boolean;
  error: string | null;
  paginatedSessions: {
    sessions: types.CountComparisonSessionWithResults[]; // Use the new type
    totalCount: number;
  };

  setSettings: (settings: types.CountComparisonSettings) => void;
  setGameMode: (mode: CountComparisonState['gameMode']) => void;
  startGame: (settings: types.CountComparisonSettings) => Promise<number>; // Changed return type to Promise<number>
  fetchNextProblem: () => Promise<void>;
  submitAnswer: (submission: types.CountComparisonSubmission) => Promise<boolean>;
  resetGame: () => void;
  fetchPaginatedSessions: (page: number, limit: number) => Promise<void>;
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
  paginatedSessions: { sessions: [], totalCount: 0 },

  setSettings: (settings) => set({ settings }),
  setGameMode: (mode) => set({ gameMode: mode }),

  startGame: async (settings: types.CountComparisonSettings) => {
    set({ gameMode: 'loading', loading: true, error: null, settings });
    try {
      const newSessionId = await startCountComparisonGame(settings); // Capture sessionId
      set({ sessionId: newSessionId }); // Set sessionId in the store
      await get().fetchNextProblem(); // Fetch the first problem
      set({ gameMode: 'playing', loading: false });
      return newSessionId; // Return sessionId
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', gameMode: 'setup', loading: false });
      throw err; // Re-throw error for proper handling
    }
  },

  fetchNextProblem: async () => {
    set({ loading: true, error: null });
    try {
      const problem = await getNextCountComparisonProblem();
      if (problem) {
        set({ currentProblem: problem, loading: false });
      } else {
        set({ currentProblem: null, gameMode: 'result', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
    }
  },

  submitAnswer: async (submission: types.CountComparisonSubmission): Promise<boolean> => {
    set({ loading: true, error: null });
    try {
      await submitCountComparisonAnswer(submission);
      const problem = get().currentProblem;
      if (!problem) {
        throw new Error("No current problem to submit answer for.");
      }
      const isCorrect = submission.playerChoice === problem.correctSide;
      set({ loading: false });
      return isCorrect;
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', loading: false });
      return false; // Assume incorrect on error
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
    });
  },

  fetchPaginatedSessions: async (page: number, limit: number) => {
    set({ loading: true, error: null });
    try {
      const paginatedResult = await getPaginatedCountComparisonSessionsWithResults(page, limit);
      const parsedSessions = paginatedResult.sessions.map((s: types.CountComparisonSessionWithResults) => {
        return s;
    });

      set({
        paginatedSessions: {
          sessions: parsedSessions,
          totalCount: paginatedResult.totalCount,
        },
        loading: false,
      });
    } catch (err: any) {
      set({ error: `Failed to fetch paginated sessions: ${err.message || 'Unknown error'}`, loading: false });
    }
  },
}));