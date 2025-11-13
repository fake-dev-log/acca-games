import { create } from 'zustand';
import { types } from '@wails/go/models';
import {
  StartNumberPressingGame,
  SubmitNumberPressingResultR1,
  SubmitNumberPressingResultR2,
} from '@wails/go/main/App';
import { getPaginatedNumberPressingSessionsWithResults } from '@api/numberPressing';
import { GameMode } from "@constants/gameModes";

interface NumberPressingState {
  gameState: types.NumberPressingGameState | null;
  gameMode: GameMode;
  sessionId: number | null;
  loading: boolean;
  error: string | null;
  paginatedSessions: {
    sessions: types.NumberPressingSessionWithResults[];
    totalCount: number;
  };

  setGameState: (gameState: types.NumberPressingGameState) => void;
  setSessionId: (id: number) => void;
  setGameMode: (mode: GameMode) => void;
  startGame: (settings: types.NumberPressingSetup) => Promise<void>;
  submitAnswerR1: (result: types.NumberPressingResultR1) => Promise<void>;
  submitAnswerR2: (result: types.NumberPressingResultR2) => Promise<void>;
  resetGame: () => void;
  fetchPaginatedSessions: (page: number, limit: number) => Promise<void>;
}

export const useNumberPressingStore = create<NumberPressingState>((set) => ({
  gameState: null,
  gameMode: 'setup',
  sessionId: null,
  loading: false,
  error: null,
  paginatedSessions: { sessions: [], totalCount: 0 },

  setGameState: (gameState) => set({ gameState }),
  setSessionId: (id) => set({ sessionId: id }),
  setGameMode: (mode) => set({ gameMode: mode }),

  startGame: async (settings: types.NumberPressingSetup) => {
    set({ gameMode: 'loading', loading: true, error: null });
    try {
      const gameState = await StartNumberPressingGame(settings);
      set({ gameState, sessionId: gameState.id, gameMode: 'playing', loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', gameMode: 'setup', loading: false });
    }
  },

  submitAnswerR1: async (result: types.NumberPressingResultR1) => {
    try {
      await SubmitNumberPressingResultR1(result);
    } catch (err) {
      console.error("Failed to submit Number Pressing R1 result:", err);
    }
  },

  submitAnswerR2: async (result: types.NumberPressingResultR2) => {
    try {
      await SubmitNumberPressingResultR2(result);
    } catch (err) {
      console.error("Failed to submit Number Pressing R2 result:", err);
    }
  },

  resetGame: () => {
    set({
      gameState: null,
      gameMode: 'setup',
      sessionId: null,
      loading: false,
      error: null,
    });
  },

  fetchPaginatedSessions: async (page: number, limit: number) => {
    set({ loading: true, error: null });
    try {
      const paginatedResult = await getPaginatedNumberPressingSessionsWithResults(page, limit);
      const typedSessions = paginatedResult.sessions.map(s => types.NumberPressingSessionWithResults.createFrom(s));
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
      set({ error: `Failed to fetch paginated sessions for number-pressing: ${err.message || 'Unknown error'}`, loading: false });
    }
  },
}));
