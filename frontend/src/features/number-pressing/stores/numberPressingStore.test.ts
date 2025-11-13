import { act } from '@testing-library/react';
import { vi } from 'vitest';
import { useNumberPressingStore } from './numberPressingStore';
import { types } from '@wails/go/models';
import {
  StartNumberPressingGame,
  SubmitNumberPressingResultR1,
  SubmitNumberPressingResultR2,
} from '@wails/go/main/App';

// Mock the Wails backend functions
vi.mock('@wails/go/main/App', () => ({
  StartNumberPressingGame: vi.fn(),
  SubmitNumberPressingResultR1: vi.fn(),
  SubmitNumberPressingResultR2: vi.fn(),
}));

const initialState = useNumberPressingStore.getState();

describe('useNumberPressingStore', () => {
  beforeEach(() => {
    act(() => {
      useNumberPressingStore.setState(initialState);
    });
    vi.clearAllMocks();
  });

  describe('startGame', () => {
    it('should start a game and update the state correctly', async () => {
      const mockSettings: types.NumberPressingSetup = types.NumberPressingSetup.createFrom({
        rounds: [1, 2],
        problemsPerRound: 5,
        isRealMode: false,
      });

      const mockGameState: types.NumberPressingGameState = types.NumberPressingGameState.createFrom({
        id: 1,
        setup: mockSettings,
        problemsR1: [{ targetNumber: 1 }],
        problemsR2: [{ doubleClick: [2], skip: [3] }],
      });

      (StartNumberPressingGame as jest.Mock).mockResolvedValue(mockGameState);

      await act(async () => {
        await useNumberPressingStore.getState().startGame(mockSettings);
      });

      const state = useNumberPressingStore.getState();
      expect(StartNumberPressingGame).toHaveBeenCalledWith(mockSettings);
      expect(state.gameMode).toBe('playing');
      expect(state.loading).toBe(false);
      expect(state.gameState).toEqual(mockGameState);
      expect(state.sessionId).toBe(1);
      expect(state.error).toBeNull();
    });

    it('should handle errors when starting a game', async () => {
      const mockSettings: types.NumberPressingSetup = types.NumberPressingSetup.createFrom({
        rounds: [1],
        problemsPerRound: 5,
        isRealMode: false,
      });
      const error = new Error('Failed to start');
      (StartNumberPressingGame as jest.Mock).mockRejectedValue(error);

      await act(async () => {
        await useNumberPressingStore.getState().startGame(mockSettings);
      });

      const state = useNumberPressingStore.getState();
      expect(state.gameMode).toBe('setup');
      expect(state.loading).toBe(false);
      expect(state.error).toBe(error.message);
      expect(state.gameState).toBeNull();
    });
  });

  describe('submitAnswer', () => {
    it('should call SubmitNumberPressingResultR1 for round 1', async () => {
      const mockResult: types.NumberPressingResultR1 = types.NumberPressingResultR1.createFrom({
        sessionId: 1,
        problemNumber: 1,
        targetNumber: 5,
        pressedNumber: 5,
        isCorrect: true,
        responseTimeMs: 500,
      });

      await act(async () => {
        await useNumberPressingStore.getState().submitAnswerR1(mockResult);
      });

      expect(SubmitNumberPressingResultR1).toHaveBeenCalledWith(mockResult);
    });

    it('should call SubmitNumberPressingResultR2 for round 2', async () => {
      const mockResult: types.NumberPressingResultR2 = types.NumberPressingResultR2.createFrom({
        sessionId: 1,
        problemNumber: 1,
        isCorrect: true,
        totalTimeMs: 2500,
        correctClicks: 9,
        incorrectClicks: 0,
      });

      await act(async () => {
        await useNumberPressingStore.getState().submitAnswerR2(mockResult);
      });

      expect(SubmitNumberPressingResultR2).toHaveBeenCalledWith(mockResult);
    });
  });

  describe('resetGame', () => {
    it('should reset the game state to initial values', async () => {
       const mockSettings: types.NumberPressingSetup = types.NumberPressingSetup.createFrom({
        rounds: [1, 2],
        problemsPerRound: 5,
        isRealMode: false,
      });
      const mockGameState: types.NumberPressingGameState = types.NumberPressingGameState.createFrom({
        id: 1,
        setup: mockSettings,
        problemsR1: [],
        problemsR2: [],
      });
      
      // Set some state first
      act(() => {
        useNumberPressingStore.setState({
          gameMode: 'playing',
          gameState: mockGameState,
          sessionId: 1,
          error: 'An error',
        });
      });

      // Reset the state
      act(() => {
        useNumberPressingStore.getState().resetGame();
      });

      const state = useNumberPressingStore.getState();
      expect(state.gameMode).toBe('setup');
      expect(state.gameState).toBeNull();
      expect(state.sessionId).toBeNull();
      expect(state.error).toBeNull();
      expect(state.loading).toBe(false);
    });
  });
});
