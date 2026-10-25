import { create } from 'zustand';
import { GameMode } from "@constants/gameModes";
import { numberPressingEngine } from '../logic/NumberPressingEngine';
import { NumberPressingSetup, NumberPressingGameState, NumberPressingResultR1, NumberPressingResultR2, NumberPressingResultsBundle } from '../logic/types';

interface NumberPressingState {
  gameState: NumberPressingGameState | null;
  gameMode: GameMode;
  sessionId: number | null;
  loading: boolean;
  error: string | null;
  results: NumberPressingResultsBundle;

  setGameState: (gameState: NumberPressingGameState) => void;
  setSessionId: (id: number) => void;
  setGameMode: (mode: GameMode) => void;
  startGame: (settings: NumberPressingSetup) => Promise<void>;
  submitAnswerR1: (result: NumberPressingResultR1) => Promise<void>;
  submitAnswerR2: (result: NumberPressingResultR2) => Promise<void>;
  resetGame: () => void;
}

export const useNumberPressingStore = create<NumberPressingState>((set) => ({
  gameState: null,
  gameMode: 'setup',
  sessionId: null,
  loading: false,
  error: null,
  results: { resultsR1: [], resultsR2: [] },

  setGameState: (gameState) => set({ gameState }),
  setSessionId: (id) => set({ sessionId: id }),
  setGameMode: (mode) => set({ gameMode: mode }),

  startGame: async (settings: NumberPressingSetup) => {
    set({ gameMode: 'loading', loading: true, error: null, results: { resultsR1: [], resultsR2: [] } });
    try {
      const gameState = numberPressingEngine.startGame(settings);
      set({ gameState, sessionId: gameState.id, gameMode: 'playing', loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', gameMode: 'setup', loading: false });
    }
  },

  submitAnswerR1: async (result: NumberPressingResultR1) => {
    try {
      numberPressingEngine.submitResultR1(result);
      set((state) => ({
        results: {
          ...state.results,
          resultsR1: [...state.results.resultsR1, result]
        }
      }));
    } catch (err) {
      console.error("Failed to submit Number Pressing R1 result:", err);
    }
  },

  submitAnswerR2: async (result: NumberPressingResultR2) => {
    try {
      numberPressingEngine.submitResultR2(result);
      set((state) => ({
        results: {
          ...state.results,
          resultsR2: [...state.results.resultsR2, result]
        }
      }));
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
      results: { resultsR1: [], resultsR2: [] },
    });
  },
}));