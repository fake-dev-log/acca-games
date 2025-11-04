import { create } from 'zustand';
import {
  StartNumberPressingGame,
  GetNumberPressingGameSessions,
  GetAllNumberPressingResults,
  GetNumberPressingResultsForSession,
} from '@wails/go/main/App';
import { types } from '@wails/go/models';

interface NumberPressingState {
  gameState: types.NumberPressingGameState | null;
  sessions: types.GameSession[];
  allResultsR1: types.NumberPressingResultR1[];
  allResultsR2: types.NumberPressingResultR2[];
  currentSessionResultsR1: types.NumberPressingResultR1[];
  currentSessionResultsR2: types.NumberPressingResultR2[];
  loading: boolean;
  error: string | null;
  startGame: (settings: types.NumberPressingSetup) => Promise<void>;
  fetchSessions: () => Promise<void>;
  fetchAllResults: () => Promise<void>;
  fetchResultsForSession: (sessionId: number) => Promise<void>;
  resetGameState: () => void;
}

export const useNumberPressingStore = create<NumberPressingState>((set) => ({
  gameState: null,
  sessions: [],
  allResultsR1: [],
  allResultsR2: [],
  currentSessionResultsR1: [],
  currentSessionResultsR2: [],
  loading: false,
  error: null,

  startGame: async (settings) => {
    set({ loading: true, error: null });
    try {
      const gameState = await StartNumberPressingGame(settings);
      set({ gameState, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to start game', loading: false });
    }
  },

  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const sessions = await GetNumberPressingGameSessions();
      set({ sessions, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch sessions', loading: false });
    }
  },

  fetchAllResults: async () => {
    set({ loading: true, error: null });
    try {
      const bundle = await GetAllNumberPressingResults();
      set({ allResultsR1: bundle?.resultsR1 || [], allResultsR2: bundle?.resultsR2 || [], loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch all results', loading: false });
    }
  },

  fetchResultsForSession: async (sessionId: number) => {
    set({ loading: true, error: null });
    try {
        const bundle = await GetNumberPressingResultsForSession(sessionId);
        set({ currentSessionResultsR1: bundle?.resultsR1 || [], currentSessionResultsR2: bundle?.resultsR2 || [], loading: false });
    } catch (error: any) {
        set({ error: error.message || 'Failed to fetch session results', loading: false });
    }
  },

  resetGameState: () => set({ gameState: null, loading: false, error: null }),
}));