import { create } from 'zustand';
import { GameMode } from "@constants/gameModes";
import { nBackEngine } from '../logic/NBackEngine';
import { NBackSettings, NBackGameState, NBackResult } from '../logic/types';

interface NBackState {
  gameState: NBackGameState | null;
  gameMode: GameMode;
  sessionId: number | null;
  loading: boolean;
  error: string | null;
  results: NBackResult[];

  setGameState: (gameState: NBackGameState) => void;
  setSessionId: (id: number) => void;
  setGameMode: (mode: GameMode) => void;
  startGame: (settings: NBackSettings) => Promise<void>;
  submitAnswer: (choice: string, responseTime: number, trial: number) => Promise<NBackResult | null>;
  resetGame: () => void;
}

export const useNBackStore = create<NBackState>((set) => ({
  gameState: null,
  gameMode: 'setup',
  sessionId: null,
  loading: false,
  error: null,
  results: [],

  setGameState: (gameState) => set({ gameState }),
  setSessionId: (id) => set({ sessionId: id }),
  setGameMode: (mode) => set({ gameMode: mode }),

  startGame: async (settings: NBackSettings) => {
    set({ gameMode: 'loading', loading: true, error: null, results: [] });
    try {
      const gameState = nBackEngine.startGame(settings);
      set({ gameState, sessionId: gameState.id, gameMode: 'playing', loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', gameMode: 'setup', loading: false });
    }
  },

  submitAnswer: async (choice, responseTime, trial) => {
    try {
      const result = nBackEngine.submitAnswer(choice, responseTime, trial);
      set((state) => ({ results: [...state.results, result] }));
      return result;
    } catch (err) {
      console.error("Failed to submit N-Back answer:", err);
      return null;
    }
  },

  resetGame: () => {
    set({ gameState: null, gameMode: 'setup', sessionId: null, error: null, loading: false, results: [] });
  },
}));
