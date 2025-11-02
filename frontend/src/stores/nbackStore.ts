import { create } from 'zustand';
import { nback, types } from '@wails/go/models';
import {
  getAllNBackResults,
  getNBackGameSessions,
  getNBackResultsForSession,
  startNBackGame,
  submitNBackAnswer,
} from '@api/nback';

interface NBackState {
  // State
  sessions: types.GameSession[];
  allResults: types.NBackRecord[];
  currentSessionResults: types.NBackRecord[];
  gameState: nback.NBackGameState | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchSessions: () => Promise<void>;
  fetchAllResults: () => Promise<void>;
  fetchResultsForSession: (sessionId: number) => Promise<void>;
  startGame: (settings: types.NBackSettings) => Promise<void>;
  submitAnswer: (
    playerChoice: string,
    responseTimeMs: number,
    trialNum: number,
  ) => Promise<types.NBackResult | undefined>;
  resetGameState: () => void;
}

export const useNBackStore = create<NBackState>((set, get) => ({
  // Initial State
  sessions: [],
  allResults: [],
  currentSessionResults: [],
  gameState: null,
  loading: false,
  error: null,

  // Actions
  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const sessions = await getNBackGameSessions();
      set({ sessions, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch sessions', loading: false });
    }
  },

  fetchAllResults: async () => {
    set({ loading: true, error: null });
    try {
      const allResults = await getAllNBackResults();
      set({ allResults, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch all results', loading: false });
    }
  },

  fetchResultsForSession: async (sessionId: number) => {
    set({ loading: true, error: null });
    try {
      const results = await getNBackResultsForSession(sessionId);
      set({ currentSessionResults: results, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch session results', loading: false });
    }
  },

  startGame: async (settings: types.NBackSettings) => {
    set({ loading: true, error: null });
    try {
      const gameState = await startNBackGame(settings);
      set({ gameState, loading: false });
    } catch (err) {
      set({ error: 'Failed to start game', loading: false });
    }
  },

  submitAnswer: async (playerChoice, responseTimeMs, trialNum) => {
    // No loading state change here to allow for rapid submissions
    try {
      return await submitNBackAnswer(playerChoice, responseTimeMs, trialNum);
    } catch (err) {
      set({ error: 'Failed to submit answer' });
    }
  },

  resetGameState: () => {
    set({ gameState: null });
  },
}));
