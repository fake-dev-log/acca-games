import { create } from 'zustand';
import { rps, types } from '@wails/go/models';
import {
  startRpsGame,
  submitRpsAnswer,
  getRpsGameSessions,
  getRpsResultsForSession,
} from '@api/rps';

interface RpsState {
  gameState: rps.GameState | null;
  sessions: types.GameSession[];
  currentSessionResults: types.RpsResult[];
  loading: boolean;
  error: string | null;

  startGame: (settings: types.RpsSettings) => Promise<void>;
  submitAnswer: (
    playerChoice: string,
    responseTimeMs: number,
    questionNum: number,
  ) => Promise<types.RpsResult | undefined>;
  resetGameState: () => void;
  fetchSessions: () => Promise<void>;
  fetchResultsForSession: (sessionId: number) => Promise<void>;
}

export const useRpsStore = create<RpsState>((set) => ({
  gameState: null,
  sessions: [],
  currentSessionResults: [],
  loading: false,
  error: null,

  startGame: async (settings: types.RpsSettings) => {
    set({ loading: true, error: null });
    try {
      const gameState = await startRpsGame(settings);
      set({ gameState, loading: false });
    } catch (err) {
      set({ error: 'Failed to start RPS game', loading: false });
    }
  },

  submitAnswer: async (playerChoice, responseTimeMs, questionNum) => {
    try {
      return await submitRpsAnswer(playerChoice, responseTimeMs, questionNum);
    } catch (err) {
      set({ error: 'Failed to submit RPS answer' });
      return undefined;
    }
  },

  resetGameState: () => {
    set({ gameState: null });
  },

  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const sessions = await getRpsGameSessions();
      set({ sessions, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch RPS sessions', loading: false });
    }
  },

  fetchResultsForSession: async (sessionId: number) => {
    set({ loading: true, error: null });
    try {
      const results = await getRpsResultsForSession(sessionId);
      set({ currentSessionResults: results, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch RPS session results', loading: false });
    }
  },
}));
