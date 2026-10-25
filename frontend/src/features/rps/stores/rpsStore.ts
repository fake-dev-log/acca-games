import {create} from 'zustand';
import { GameMode } from "@constants/gameModes";
import { rpsEngine } from '../logic/RPSEngine';
import { RpsSettings, GameState, RpsResult } from '../logic/types';

interface RpsState {
  gameState: GameState | null;
  results: RpsResult[];
  gameMode: GameMode;
  sessionId: number | null;
  loading: boolean;
  error: string | null;
  // Pagination removed for standalone version
  
  setGameState: (gameState: GameState) => void;
  setSessionId: (id: number) => void;
  setGameMode: (mode: GameMode) => void;
  startGame: (settings: RpsSettings) => Promise<void>;
  submitAnswer: (choice: string, responseTime: number, trial: number) => Promise<RpsResult | null>;
  resetGame: () => void;
  // fetchPaginatedSessions removed for standalone version
}

export const useRpsStore = create<RpsState>((set) => ({
  gameState: null,
  results: [],
  gameMode: 'setup',
  sessionId: null,
  loading: false,
  error: null,
  
  setGameState: (gameState) => set({ gameState }),
  setSessionId: (id) => set({ sessionId: id }),
  setGameMode: (mode) => set({ gameMode: mode }),

  startGame: async (settings: RpsSettings) => {
    set({ gameMode: 'loading', loading: true, error: null, results: [] });
    try {
      // Simulate async for consistency, though engine is sync
      const gameState = rpsEngine.startGame(settings);
      set({ gameState, sessionId: gameState.id, gameMode: 'playing', loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', gameMode: 'setup', loading: false });
    }
  },

  submitAnswer: async (playerChoice, responseTimeMs, questionNum) => {
    try {
        // Synchronous call to engine
      const result = rpsEngine.submitAnswer(playerChoice, responseTimeMs, questionNum);
      set((state) => ({ results: [...state.results, result] }));
      return result;
    } catch (err) {
      console.error("Failed to submit rps result", err);
      return null;
    }
  },

  resetGame: () => {
    set({ gameState: null, results: [], gameMode: 'setup', sessionId: null, error: null, loading: false });
  },
}));
