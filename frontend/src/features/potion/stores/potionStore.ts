import { create } from 'zustand';
import { GameMode } from '@constants/gameModes';
import { potionEngine } from '../logic/PotionEngine';
import { PotionColor, PotionGameState, PotionResult, PotionSettings } from '../logic/types';

interface PotionState {
  gameState: PotionGameState | null;
  gameMode: GameMode;
  sessionId: number | null;
  error: string | null;
  results: PotionResult[];

  setGameMode: (mode: GameMode) => void;
  startGame: (settings: PotionSettings) => void;
  submitAnswer: (trialNum: number, choice: PotionColor | null, responseTimeMs: number) => PotionResult | null;
  resetGame: () => void;
}

export const usePotionStore = create<PotionState>((set) => ({
  gameState: null,
  gameMode: 'setup',
  sessionId: null,
  error: null,
  results: [],

  setGameMode: (mode) => set({ gameMode: mode }),

  startGame: (settings) => {
    try {
      const gameState = potionEngine.startGame(settings);
      set({ gameState, sessionId: gameState.id, gameMode: 'playing', error: null, results: [] });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', gameMode: 'setup' });
    }
  },

  submitAnswer: (trialNum, choice, responseTimeMs) => {
    try {
      const result = potionEngine.submitAnswer(trialNum, choice, responseTimeMs);
      set((state) => ({ results: [...state.results, result] }));
      return result;
    } catch (err) {
      console.error('Failed to submit potion answer:', err);
      return null;
    }
  },

  resetGame: () => set({ gameState: null, gameMode: 'setup', sessionId: null, error: null, results: [] }),
}));
