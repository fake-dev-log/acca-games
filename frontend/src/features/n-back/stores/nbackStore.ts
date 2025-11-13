import {create} from 'zustand';
import {nback, types} from '@wails/go/models';
import {
  getPaginatedNBackSessionsWithResults,
  startNBackGame,
  submitNBackAnswer,
} from '@api/nback';
import { GameMode } from "@constants/gameModes";

interface NBackState {
  gameState: nback.NBackGameState | null;
  gameMode: GameMode;
  sessionId: number | null;
  loading: boolean;
  error: string | null;
  paginatedSessions: {
    sessions: types.NBackSessionWithResults[];
    totalCount: number;
  };

  setGameState: (gameState: nback.NBackGameState) => void;
  setSessionId: (id: number) => void;
  setGameMode: (mode: GameMode) => void;
  startGame: (settings: types.NBackSettings) => Promise<void>;
  submitAnswer: (choice: string, responseTime: number, trial: number) => Promise<types.NBackResult | null>;
  resetGame: () => void;
  fetchPaginatedSessions: (page: number, limit: number) => Promise<void>;
}

export const useNBackStore = create<NBackState>((set) => ({
  gameState: null,
  gameMode: 'setup',
  sessionId: null,
  loading: false,
  error: null,
  paginatedSessions: { sessions: [], totalCount: 0 },

  setGameState: (gameState) => set({ gameState }),
  setSessionId: (id) => set({ sessionId: id }),
  setGameMode: (mode) => set({ gameMode: mode }),

  startGame: async (settings: types.NBackSettings) => {
    set({ gameMode: 'loading', loading: true, error: null });
    try {
      const gameState = await startNBackGame(settings);
      set({ gameState, sessionId: gameState.id, gameMode: 'playing', loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', gameMode: 'setup', loading: false });
    }
  },

  submitAnswer: async (choice, responseTime, trial) => {
    try {
      return await submitNBackAnswer(choice, responseTime, trial);
    } catch (err) {
      console.error("Failed to submit N-Back answer:", err);
      return null;
    }
  },

  resetGame: () => {
    set({ gameState: null, gameMode: 'setup', sessionId: null, error: null, loading: false });
  },

  fetchPaginatedSessions: async (page: number, limit: number) => {
    set({ loading: true, error: null });
    try {
      const paginatedResult = await getPaginatedNBackSessionsWithResults(page, limit);
      const typedSessions = paginatedResult.sessions.map(s => types.NBackSessionWithResults.createFrom(s));
      const parsedSessions = typedSessions.map(s => {
        s.settings = JSON.parse(s.settings as unknown as string);
        return s;
      });
      set({ 
        paginatedSessions: {
          sessions: parsedSessions,
          totalCount: paginatedResult.totalCount,
        }, 
        loading: false 
      });
    } catch (err: any) {
      set({ error: `Failed to fetch paginated sessions for n-back: ${err.message || 'Unknown error'}`, loading: false });
    }
  },
}));