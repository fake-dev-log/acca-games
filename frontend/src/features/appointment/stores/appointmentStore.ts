import { create } from 'zustand';
import { GameMode } from '@constants/gameModes';
import { appointmentEngine } from '../logic/AppointmentEngine';
import { AppointmentGameState, AppointmentResult, AppointmentSettings } from '../logic/types';

interface AppointmentState {
  gameState: AppointmentGameState | null;
  gameMode: GameMode;
  sessionId: number | null;
  error: string | null;
  results: AppointmentResult[];

  setGameMode: (mode: GameMode) => void;
  startGame: (settings: AppointmentSettings) => void;
  submitAnswer: (questionNum: number, choice: string | null, responseTimeMs: number) => AppointmentResult | null;
  resetGame: () => void;
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  gameState: null,
  gameMode: 'setup',
  sessionId: null,
  error: null,
  results: [],

  setGameMode: (mode) => set({ gameMode: mode }),

  startGame: (settings) => {
    try {
      const gameState = appointmentEngine.startGame(settings);
      set({ gameState, sessionId: gameState.id, gameMode: 'playing', error: null, results: [] });
    } catch (err: any) {
      set({ error: err.message || 'Unknown error', gameMode: 'setup' });
    }
  },

  submitAnswer: (questionNum, choice, responseTimeMs) => {
    try {
      const result = appointmentEngine.submitAnswer(questionNum, choice, responseTimeMs);
      set((state) => ({ results: [...state.results, result] }));
      return result;
    } catch (err) {
      console.error('Failed to submit appointment answer:', err);
      return null;
    }
  },

  resetGame: () => set({ gameState: null, gameMode: 'setup', sessionId: null, error: null, results: [] }),
}));
