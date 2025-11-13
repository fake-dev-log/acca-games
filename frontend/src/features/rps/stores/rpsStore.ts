import {create} from 'zustand';
import {rps, types} from '@wails/go/models';
import {
  getPaginatedRpsSessionsWithResults,
  startRpsGame,
  submitRpsAnswer,
} from '@api/rps';
import { GameMode } from "@constants/gameModes";

interface RpsState {
  gameState: rps.GameState | null;
  gameMode: GameMode;
  sessionId: number | null;
  loading: boolean;
  error: string | null;
  paginatedSessions: {
    sessions: types.RpsSessionWithResults[];
    totalCount: number;
  };

  setGameState: (gameState: rps.GameState) => void;
  setSessionId: (id: number) => void;
  setGameMode: (mode: GameMode) => void;
  startGame: (settings: types.RpsSettings) => Promise<void>;
  submitAnswer: (choice: string, responseTime: number, trial: number) => Promise<types.RpsResult | null>;
  resetGame: () => void;
  fetchPaginatedSessions: (page: number, limit: number) => Promise<void>;
}

export const useRpsStore = create<RpsState>((set) => ({
  gameState: null,
  gameMode: 'setup',
  sessionId: null,
  loading: false,
  error: null,
  paginatedSessions: { sessions: [], totalCount: 0 },
  setGameState: (gameState) => set({ gameState }),
  setSessionId: (id) => set({ sessionId: id }),
  setGameMode: (mode) => set({ gameMode: mode }),

  startGame: async (settings: types.RpsSettings) => {
    set({ gameMode: 'loading', loading: true, error: null });
    try {
      const gameState = await startRpsGame(settings);
      set({ gameState, sessionId: gameState.id, gameMode: 'playing', loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', gameMode: 'setup', loading: false });
    }
  },

  submitAnswer: async (playerChoice, responseTimeMs, questionNum) => {
    try {
      return await submitRpsAnswer(playerChoice, responseTimeMs, questionNum);
    } catch (err) {
      console.error("Failed to submit rps result", err);
      return null;
    }
  },

  resetGame: () => {
    set({ gameState: null, gameMode: 'setup', sessionId: null, error: null, loading: false });
  },

  fetchPaginatedSessions: async (page: number, limit: number) => {
    set({ loading: true, error: null });
    try {
      const paginatedResult = await getPaginatedRpsSessionsWithResults(page, limit);
      const typedSessions = paginatedResult.sessions.map(s => types.RpsSessionWithResults.createFrom(s));
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
      set({ error: `Failed to fetch paginated sessions for rps: ${err.message || 'Unknown error'}`, loading: false });
    }
  },
}));